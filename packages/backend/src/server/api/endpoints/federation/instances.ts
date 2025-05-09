import define from "@/server/api/define.js";
import { Instances } from "@/models/index.js";
import { fetchMeta, sqlLikeEscape } from "backend-rs";

export const meta = {
	tags: ["federation"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "FederationInstance",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		host: {
			type: "string",
			nullable: true,
			description: "Omit or use `null` to not filter by host.",
		},
		blocked: { type: "boolean", nullable: true },
		notResponding: { type: "boolean", nullable: true },
		suspended: { type: "boolean", nullable: true },
		federating: { type: "boolean", nullable: true },
		silenced: { type: "boolean", nullable: true },
		subscribing: { type: "boolean", nullable: true },
		publishing: { type: "boolean", nullable: true },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 30 },
		offset: { type: "integer", default: 0 },
		sort: { type: "string" },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const query = Instances.createQueryBuilder("instance");

	switch (ps.sort) {
		case "+pubSub":
			query
				.orderBy("instance.followingCount", "DESC")
				.orderBy("instance.followersCount", "DESC");
			break;
		case "-pubSub":
			query
				.orderBy("instance.followingCount", "ASC")
				.orderBy("instance.followersCount", "ASC");
			break;
		case "+notes":
			query.orderBy("instance.notesCount", "DESC");
			break;
		case "-notes":
			query.orderBy("instance.notesCount", "ASC");
			break;
		case "+users":
			query.orderBy("instance.usersCount", "DESC");
			break;
		case "-users":
			query.orderBy("instance.usersCount", "ASC");
			break;
		case "+following":
			query.orderBy("instance.followingCount", "DESC");
			break;
		case "-following":
			query.orderBy("instance.followingCount", "ASC");
			break;
		case "+followers":
			query.orderBy("instance.followersCount", "DESC");
			break;
		case "-followers":
			query.orderBy("instance.followersCount", "ASC");
			break;
		case "+caughtAt":
			query.orderBy("instance.caughtAt", "DESC");
			break;
		case "-caughtAt":
			query.orderBy("instance.caughtAt", "ASC");
			break;
		case "+lastCommunicatedAt":
			query.orderBy("instance.lastCommunicatedAt", "DESC");
			break;
		case "-lastCommunicatedAt":
			query.orderBy("instance.lastCommunicatedAt", "ASC");
			break;

		default:
			query.orderBy("instance.id", "DESC");
			break;
	}

	if (typeof ps.blocked === "boolean") {
		const instanceMeta = await fetchMeta();
		if (ps.blocked) {
			if (instanceMeta.blockedHosts.length === 0) {
				return [];
			}
			query.andWhere("instance.host IN (:...blocks)", {
				blocks: instanceMeta.blockedHosts,
			});
		} else if (instanceMeta.blockedHosts.length > 0) {
			query.andWhere("instance.host NOT IN (:...blocks)", {
				blocks: instanceMeta.blockedHosts,
			});
		}
	}

	if (typeof ps.silenced === "boolean") {
		const instanceMeta = await fetchMeta();
		if (ps.silenced) {
			if (instanceMeta.silencedHosts.length === 0) {
				return [];
			}
			query.andWhere("instance.host IN (:...silences)", {
				silences: instanceMeta.silencedHosts,
			});
		} else if (instanceMeta.silencedHosts.length > 0) {
			query.andWhere("instance.host NOT IN (:...silences)", {
				silences: instanceMeta.silencedHosts,
			});
		}
	}

	if (typeof ps.notResponding === "boolean") {
		if (ps.notResponding) {
			query.andWhere("instance.isNotResponding = TRUE");
		} else {
			query.andWhere("instance.isNotResponding = FALSE");
		}
	}

	if (typeof ps.suspended === "boolean") {
		if (ps.suspended) {
			query.andWhere("instance.isSuspended = TRUE");
		} else {
			query.andWhere("instance.isSuspended = FALSE");
		}
	}

	if (typeof ps.federating === "boolean") {
		if (ps.federating) {
			query.andWhere(
				"((instance.followingCount > 0) OR (instance.followersCount > 0))",
			);
		} else {
			query.andWhere(
				"((instance.followingCount = 0) AND (instance.followersCount = 0))",
			);
		}
	}

	if (typeof ps.subscribing === "boolean") {
		if (ps.subscribing) {
			query.andWhere("instance.followersCount > 0");
		} else {
			query.andWhere("instance.followersCount = 0");
		}
	}

	if (typeof ps.publishing === "boolean") {
		if (ps.publishing) {
			query.andWhere("instance.followingCount > 0");
		} else {
			query.andWhere("instance.followingCount = 0");
		}
	}

	if (ps.host) {
		query.andWhere("instance.host like :host", {
			host: `%${sqlLikeEscape(ps.host.toLowerCase())}%`,
		});
	}

	const instances = await query.take(ps.limit).skip(ps.offset).getMany();

	return await Instances.packMany(instances);
});
