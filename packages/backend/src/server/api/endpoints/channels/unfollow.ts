import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { Channels, ChannelFollowings } from "@/models/index.js";
import { publishToUserStream, UserEvent } from "backend-rs";

export const meta = {
	tags: ["channels"],

	requireCredential: true,

	kind: "write:channels",

	errors: {
		noSuchChannel: {
			message: "No such channel.",
			code: "NO_SUCH_CHANNEL",
			id: "19959ee9-0153-4c51-bbd9-a98c49dc59d6",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		channelId: { type: "string", format: "misskey:id" },
	},
	required: ["channelId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const channel = await Channels.findOneBy({
		id: ps.channelId,
	});

	if (channel == null) {
		throw new ApiError(meta.errors.noSuchChannel);
	}

	await ChannelFollowings.delete({
		followerId: user.id,
		followeeId: channel.id,
	});

	await publishToUserStream(user.id, UserEvent.UnfollowChannel, channel);
});
