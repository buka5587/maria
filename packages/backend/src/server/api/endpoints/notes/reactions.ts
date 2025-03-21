import type { FindOptionsWhere } from "typeorm";
import { NoteReactions } from "@/models/index.js";
import type { NoteReaction } from "@/models/entities/note-reaction.js";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { getNote } from "@/server/api/common/getters.js";

export const meta = {
	tags: ["notes", "reactions"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	allowGet: true,
	cacheSec: 60,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "NoteReaction",
		},
	},

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "263fff3d-d0e1-4af4-bea7-8408059b451a",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: { type: "string", format: "misskey:id" },
		type: { type: "string", nullable: true },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		offset: { type: "integer", default: 0 },
	},
	required: ["noteId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	// check note visibility
	const note = await getNote(ps.noteId, user).catch((err) => {
		if (err.id === "9725d0ce-ba28-4dde-95a7-2cbb2c15de24")
			throw new ApiError(meta.errors.noSuchNote);
		throw err;
	});

	const query = {
		noteId: ps.noteId,
	} as FindOptionsWhere<NoteReaction>;

	if (ps.type) {
		// ローカルリアクションはホスト名が . とされているが
		// DB 上ではそうではないので、必要に応じて変換
		const suffix = "@.:";
		const type = ps.type.endsWith(suffix)
			? `${ps.type.slice(0, ps.type.length - suffix.length)}:`
			: ps.type;
		query.reaction = type;
	}

	const reactions = await NoteReactions.find({
		where: query,
		take: ps.limit,
		skip: ps.offset,
		order: {
			id: -1,
		},
		relations: ["user", "user.avatar", "user.banner", "note"],
	});

	return await NoteReactions.packMany(reactions, user);
});
