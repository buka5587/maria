import { Brackets } from "typeorm";
import { Notes } from "@/models/index.js";
import { safeForSql } from "backend-rs";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import define from "@/server/api/define.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";

export const meta = {
	tags: ["notes", "hashtags"],
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		reply: { type: "boolean", nullable: true, default: null },
		renote: { type: "boolean", nullable: true, default: null },
		withFiles: {
			type: "boolean",
			default: false,
			description: "Only show notes that have attached files.",
		},
		poll: { type: "boolean", nullable: true, default: null },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
	},
	anyOf: [
		{
			properties: {
				tag: { type: "string", minLength: 1 },
			},
			required: ["tag"],
		},
		{
			properties: {
				query: {
					type: "array",
					description:
						"The outer arrays are chained with OR, the inner arrays are chained with AND.",
					items: {
						type: "array",
						items: {
							type: "string",
							minLength: 1,
						},
						minItems: 1,
					},
					minItems: 1,
				},
			},
			required: ["query"],
		},
	],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
	)
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("user.avatar", "avatar")
		.leftJoinAndSelect("user.banner", "banner")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("replyUser.avatar", "replyUserAvatar")
		.leftJoinAndSelect("replyUser.banner", "replyUserBanner")
		.leftJoinAndSelect("renote.user", "renoteUser")
		.leftJoinAndSelect("renoteUser.avatar", "renoteUserAvatar")
		.leftJoinAndSelect("renoteUser.banner", "renoteUserBanner");

	generateVisibilityQuery(query, me);
	if (me) generateMutedUserQuery(query, me);
	if (me) generateBlockedUserQuery(query, me);

	try {
		if (ps.tag) {
			if (!safeForSql(normalizeForSearch(ps.tag))) throw "Injection";
			query.andWhere(`'{"${normalizeForSearch(ps.tag)}"}' <@ note.tags`);
		} else {
			query.andWhere(
				new Brackets((qb) => {
					for (const tags of ps.query!) {
						qb.orWhere(
							new Brackets((qb) => {
								for (const tag of tags) {
									if (!safeForSql(normalizeForSearch(ps.tag)))
										throw "Injection";
									qb.andWhere(`'{"${normalizeForSearch(tag)}"}' <@ note.tags`);
								}
							}),
						);
					}
				}),
			);
		}
	} catch (e) {
		if (e.message === "Injection") return [];
		throw e;
	}

	if (ps.reply != null) {
		if (ps.reply) {
			query.andWhere("note.replyId IS NOT NULL");
		} else {
			query.andWhere("note.replyId IS NULL");
		}
	}

	if (ps.renote != null) {
		if (ps.renote) {
			query.andWhere("note.renoteId IS NOT NULL");
		} else {
			query.andWhere("note.renoteId IS NULL");
		}
	}

	if (ps.withFiles) {
		query.andWhere("note.fileIds != '{}'");
	}

	if (ps.poll != null) {
		if (ps.poll) {
			query.andWhere("note.hasPoll = TRUE");
		} else {
			query.andWhere("note.hasPoll = FALSE");
		}
	}

	// We fetch more than requested because some may be filtered out, and if there's less than
	// requested, the pagination stops.
	const found = [];
	const take = Math.floor(ps.limit * 1.5);
	let skip = 0;
	while (found.length < ps.limit) {
		const notes = await query.take(take).skip(skip).getMany();
		found.push(...(await Notes.packMany(notes, me)));
		skip += take;
		if (notes.length < take) break;
	}

	if (found.length > ps.limit) {
		found.length = ps.limit;
	}

	return found;
});
