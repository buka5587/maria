import { deleteFile } from "@/services/drive/delete-file.js";
import { publishToDriveFileStream } from "backend-rs";
import define from "@/server/api/define.js";
import { ApiError } from "@/server/api/error.js";
import { DriveFiles } from "@/models/index.js";

export const meta = {
	tags: ["drive"],

	requireCredential: true,

	kind: "write:drive",

	description: "Delete an existing drive file.",

	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "908939ec-e52b-4458-b395-1025195cea58",
		},

		accessDenied: {
			message: "Access denied.",
			code: "ACCESS_DENIED",
			id: "5eb8d909-2540-4970-90b8-dd6f86088121",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		fileId: { type: "string", format: "misskey:id" },
	},
	required: ["fileId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const file = await DriveFiles.findOneBy({ id: ps.fileId });

	if (file == null) {
		throw new ApiError(meta.errors.noSuchFile);
	}

	if (!(user.isAdmin || user.isModerator) && file.userId !== user.id) {
		throw new ApiError(meta.errors.accessDenied);
	}

	// Delete
	await deleteFile(file);

	// Publish fileDeleted event
	publishToDriveFileStream(user.id, "delete", file.id);
});
