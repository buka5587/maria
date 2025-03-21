import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import { deliver } from "@/queue/index.js";
import createFollowRequest from "./requests/create.js";
import { registerOrFetchInstanceDoc } from "@/services/register-or-fetch-instance-doc.js";
import Logger from "../logger.js";
import { IdentifiableError } from "@/misc/identifiable-error.js";
import type { User } from "@/models/entities/user.js";
import {
	Followings,
	Users,
	FollowRequests,
	Blockings,
	Instances,
	UserProfiles,
} from "@/models/index.js";
import {
	Event,
	genIdAt,
	isSilencedServer,
	publishToMainStream,
	publishToUserStream,
	UserEvent,
	renderAccept,
	renderFollow,
	renderReject,
} from "backend-rs";
import { createNotification } from "@/services/create-notification.js";
import { isDuplicateKeyValueError } from "@/misc/is-duplicate-key-value-error.js";
import type { Packed } from "@/misc/schema.js";
import { getActiveWebhooks } from "@/misc/webhook-cache.js";
import { webhookDeliver } from "@/queue/index.js";

const logger = new Logger("following/create");

export async function insertFollowingDoc(
	followee: {
		id: User["id"];
		host: User["host"];
		uri: User["host"];
		inbox: User["inbox"];
		sharedInbox: User["sharedInbox"];
	},
	follower: {
		id: User["id"];
		host: User["host"];
		uri: User["host"];
		inbox: User["inbox"];
		sharedInbox: User["sharedInbox"];
	},
) {
	if (follower.id === followee.id) return;

	let alreadyFollowed = false;

	const now = new Date();

	await Followings.insert({
		id: genIdAt(now),
		createdAt: now,
		followerId: follower.id,
		followeeId: followee.id,

		// 非正規化
		followerHost: follower.host,
		followerInbox: Users.isRemoteUser(follower) ? follower.inbox : null,
		followerSharedInbox: Users.isRemoteUser(follower)
			? follower.sharedInbox
			: null,
		followeeHost: followee.host,
		followeeInbox: Users.isRemoteUser(followee) ? followee.inbox : null,
		followeeSharedInbox: Users.isRemoteUser(followee)
			? followee.sharedInbox
			: null,
	}).catch((e) => {
		if (
			isDuplicateKeyValueError(e) &&
			Users.isRemoteUser(follower) &&
			Users.isLocalUser(followee)
		) {
			logger.info(`Insert duplicated ignore. ${follower.id} => ${followee.id}`);
			alreadyFollowed = true;
		} else {
			throw e;
		}
	});

	const req = await FollowRequests.findOneBy({
		followeeId: followee.id,
		followerId: follower.id,
	});

	if (req) {
		await FollowRequests.delete({
			followeeId: followee.id,
			followerId: follower.id,
		});

		// Create notification that request was accepted.
		createNotification(follower.id, "followRequestAccepted", {
			notifierId: followee.id,
		});
	}

	if (alreadyFollowed) return;

	//#region Increment counts
	await Promise.all([
		Users.increment({ id: follower.id }, "followingCount", 1),
		Users.increment({ id: followee.id }, "followersCount", 1),
	]);
	//#endregion

	//#region Update instance stats
	if (Users.isRemoteUser(follower) && Users.isLocalUser(followee)) {
		registerOrFetchInstanceDoc(follower.host).then((i) => {
			Instances.increment({ id: i.id }, "followingCount", 1);
		});
	} else if (Users.isLocalUser(follower) && Users.isRemoteUser(followee)) {
		registerOrFetchInstanceDoc(followee.host).then((i) => {
			Instances.increment({ id: i.id }, "followersCount", 1);
		});
	}
	//#endregion

	// Publish follow event
	if (Users.isLocalUser(follower)) {
		Users.pack(followee.id, follower, {
			detail: true,
		}).then(async (packed) => {
			await publishToUserStream(
				follower.id,
				UserEvent.Follow,
				packed as Packed<"UserDetailedNotMe">,
			);
			await publishToMainStream(
				follower.id,
				Event.Follow,
				packed as Packed<"UserDetailedNotMe">,
			);

			const webhooks = (await getActiveWebhooks()).filter(
				(x) => x.userId === follower.id && x.on.includes("follow"),
			);
			for (const webhook of webhooks) {
				webhookDeliver(webhook, "follow", {
					user: packed,
				});
			}
		});
	}

	// Publish followed event
	if (Users.isLocalUser(followee)) {
		Users.pack(follower.id, followee).then(async (packed) => {
			publishToMainStream(followee.id, Event.Followed, packed);

			const webhooks = (await getActiveWebhooks()).filter(
				(x) => x.userId === followee.id && x.on.includes("followed"),
			);
			for (const webhook of webhooks) {
				webhookDeliver(webhook, "followed", {
					user: packed,
				});
			}
		});

		// 通知を作成
		createNotification(followee.id, "follow", {
			notifierId: follower.id,
		});
	}
}

export default async function (
	_follower: { id: User["id"] },
	_followee: { id: User["id"] },
	requestId?: string,
) {
	const [follower, followee] = await Promise.all([
		Users.findOneByOrFail({ id: _follower.id }),
		Users.findOneByOrFail({ id: _followee.id }),
	]);

	// check blocking
	const [blocking, blocked] = await Promise.all([
		Blockings.findOneBy({
			blockerId: follower.id,
			blockeeId: followee.id,
		}),
		Blockings.findOneBy({
			blockerId: followee.id,
			blockeeId: follower.id,
		}),
	]);

	if (Users.isRemoteUser(follower) && Users.isLocalUser(followee) && blocked) {
		// リモートフォローを受けてブロックしていた場合は、エラーにするのではなくRejectを送り返しておしまい。
		const content = renderActivity(
			renderReject(followee.id, renderFollow(follower, followee, requestId)),
		);
		deliver(followee.id, content, follower.inbox);
		return;
	} else if (
		Users.isRemoteUser(follower) &&
		Users.isLocalUser(followee) &&
		blocking
	) {
		// リモートフォローを受けてブロックされているはずの場合だったら、ブロック解除しておく。
		await Blockings.delete(blocking.id);
	} else {
		// それ以外は単純に例外
		if (blocking)
			throw new IdentifiableError(
				"710e8fb0-b8c3-4922-be49-d5d93d8e6a6e",
				"blocking",
			);
		if (blocked)
			throw new IdentifiableError(
				"3338392a-f764-498d-8855-db939dcf8c48",
				"blocked",
			);
	}

	const followeeProfile = await UserProfiles.findOneByOrFail({
		userId: followee.id,
	});

	// フォロー対象が鍵アカウントである or
	// The follower is silenced, or
	// フォロワーがBotであり、フォロー対象がBotからのフォローに慎重である or
	// フォロワーがローカルユーザーであり、フォロー対象がリモートユーザーである or
	// The follower is remote, the followee is local, and the follower is in a silenced instance.
	// 上記のいずれかに当てはまる場合はすぐフォローせずにフォローリクエストを発行しておく
	if (
		followee.isLocked ||
		follower.isSilenced ||
		(followeeProfile.carefulBot && follower.isBot) ||
		(Users.isLocalUser(follower) && Users.isRemoteUser(followee)) ||
		(Users.isRemoteUser(follower) &&
			Users.isLocalUser(followee) &&
			(await isSilencedServer(follower.host)))
	) {
		let autoAccept = false;

		// 鍵アカウントであっても、既にフォローされていた場合はスルー
		const following = await Followings.findOneBy({
			followerId: follower.id,
			followeeId: followee.id,
		});
		if (following) {
			autoAccept = true;
		}

		// フォローしているユーザーは自動承認オプション
		if (
			!autoAccept &&
			Users.isLocalUser(followee) &&
			followeeProfile.autoAcceptFollowed
		) {
			const followed = await Followings.findOneBy({
				followerId: followee.id,
				followeeId: follower.id,
			});

			if (followed) autoAccept = true;
		}

		if (!autoAccept) {
			await createFollowRequest(follower, followee, requestId);
			return;
		}
	}

	await insertFollowingDoc(followee, follower);

	if (Users.isRemoteUser(follower) && Users.isLocalUser(followee)) {
		const content = renderActivity(
			renderAccept(followee.id, renderFollow(follower, followee, requestId)),
		);
		deliver(followee.id, content, follower.inbox);
	}
}
