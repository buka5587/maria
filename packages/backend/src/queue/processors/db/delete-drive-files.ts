import type Bull from "bull";

import { queueLogger } from "../../logger.js";
import { deleteFileSync } from "@/services/drive/delete-file.js";
import { Users, DriveFiles } from "@/models/index.js";
import { MoreThan } from "typeorm";
import type { DbUserJobData } from "@/queue/types.js";

const logger = queueLogger.createSubLogger("delete-drive-files");

export async function deleteDriveFiles(
	job: Bull.Job<DbUserJobData>,
	done: any,
): Promise<void> {
	logger.info(`Deleting drive files of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}

	let deletedCount = 0;
	let cursor: any = null;

	while (true) {
		const files = await DriveFiles.find({
			where: {
				userId: user.id,
				...(cursor ? { id: MoreThan(cursor) } : {}),
			},
			take: 100,
			order: {
				id: 1,
			},
		});

		if (files.length === 0) {
			job.progress(100);
			break;
		}

		cursor = files[files.length - 1].id;

		for (const file of files) {
			await deleteFileSync(file);
			deletedCount++;
		}

		const total = await DriveFiles.countBy({
			userId: user.id,
		});

		job.progress(deletedCount / total);
	}

	logger.info(`${deletedCount} drive files of user ${user.id} were deleted.`);
	done();
}
