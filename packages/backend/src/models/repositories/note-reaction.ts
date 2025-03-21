import { db } from "@/db/postgre.js";
import { NoteReaction } from "@/models/entities/note-reaction.js";
import { Notes, Users } from "../index.js";
import type { Packed } from "@/misc/schema.js";
import { decodeReaction } from "backend-rs";
import type { User } from "@/models/entities/user.js";

export const NoteReactionRepository = db.getRepository(NoteReaction).extend({
	async pack(
		src: NoteReaction["id"] | NoteReaction,
		me?: { id: User["id"] } | null | undefined,
		options?: {
			withNote: boolean;
		},
	): Promise<Packed<"NoteReaction">> {
		const opts = Object.assign(
			{
				withNote: false,
			},
			options,
		);

		const reaction =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });

		return {
			id: reaction.id,
			createdAt: reaction.createdAt.toISOString(),
			user: await Users.pack(reaction.user ?? reaction.userId, me),
			type: decodeReaction(reaction.reaction).reaction,
			...(opts.withNote
				? {
						// may throw error
						note: await Notes.pack(reaction.note ?? reaction.noteId, me),
					}
				: {}),
		};
	},

	async packMany(
		src: NoteReaction[],
		me?: { id: User["id"] } | null | undefined,
		options?: {
			withNote: boolean;
		},
	): Promise<Packed<"NoteReaction">[]> {
		const reactions = await Promise.allSettled(
			src.map((reaction) => this.pack(reaction, me, options)),
		);

		// filter out rejected promises, only keep fulfilled values
		return reactions.flatMap((result) =>
			result.status === "fulfilled" ? [result.value] : [],
		);
	},
});
