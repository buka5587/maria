import cluster from "node:cluster";
import chalk from "chalk";
import Xev from "xev";

import Logger from "@/services/logger.js";
import { inspect } from "node:util";

// for typeorm
import "reflect-metadata";
import { masterMain } from "./master.js";
import { workerMain } from "./worker.js";
import os from "node:os";

import { initializeRustLogger } from "backend-rs";

const logger = new Logger("core", "cyan");
const clusterLogger = logger.createSubLogger("cluster", "orange", false);
const ev = new Xev();

/**
 * Init process
 */
export default async function () {
	initializeRustLogger();

	const mode =
		process.env.mode && ["web", "queue"].includes(process.env.mode)
			? `(${process.env.mode})`
			: "";
	const type = cluster.isPrimary ? "(master)" : "(worker)";
	process.title = `Maria ${mode} ${type}`;

	if (cluster.isPrimary) {
		await masterMain();
		if (cluster.isPrimary) {
			ev.mount();
		}
	}

	if (cluster.isWorker) {
		await workerMain();
	}

	if (cluster.isPrimary) {
		// Leave the master process with a marginally lower priority but not too low.
		os.setPriority(2);
	}
	if (cluster.isWorker) {
		// Set workers to a much lower priority so that the master process will be
		// able to respond to api calls even if the workers gank everything.
		os.setPriority(10);
	}

	// For when Maria is started in a child process during unit testing.
	// Otherwise, process.send cannot be used, so start it.
	if (process.send) {
		process.send("ok");
	}
}

//#region Events

// Listen new workers
cluster.on("fork", (worker) => {
	clusterLogger.debug(`Process forked: [${worker.id}]`);
});

// Listen online workers
cluster.on("online", (worker) => {
	clusterLogger.debug(`Process is now online: [${worker.id}]`);
});

// Listen for dying workers
cluster.on("exit", (worker) => {
	// Replace the dead worker,
	// we're not sentimental
	clusterLogger.error(chalk.red(`[${worker.id}] died :(`));
	cluster.fork();
});

// Display detail of unhandled promise rejection
process.on("unhandledRejection", console.dir);

// Display detail of uncaught exception
process.on("uncaughtException", (err) => {
	try {
		logger.error(inspect(err));
	} catch {}
});

// Dying away...
process.on("exit", (code) => {
	logger.info(`The process is going to exit with code ${code}`);
});

//#endregion
