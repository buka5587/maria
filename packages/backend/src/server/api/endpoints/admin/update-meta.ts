import { Meta } from "@/models/entities/meta.js";
import { insertModerationLog } from "@/services/insert-moderation-log.js";
import { db } from "@/db/postgre.js";
import define from "@/server/api/define.js";
import { updateMetaCache } from "backend-rs";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireAdmin: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {
		disableRegistration: { type: "boolean", nullable: true },
		disableLocalTimeline: { type: "boolean", nullable: true },
		disableRecommendedTimeline: { type: "boolean", nullable: true },
		disableGlobalTimeline: { type: "boolean", nullable: true },
		enableGuestTimeline: { type: "boolean", nullable: true },
		defaultReaction: { type: "string", nullable: true },
		recommendedInstances: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		pinnedUsers: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		customMOTD: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		customSplashIcons: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		hiddenTags: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		blockedHosts: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		silencedHosts: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		allowedHosts: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
			},
		},
		secureMode: { type: "boolean", nullable: true },
		privateMode: { type: "boolean", nullable: true },
		themeColor: {
			type: "string",
			nullable: true,
			pattern: "^#[0-9a-fA-F]{6}$",
		},
		mascotImageUrl: { type: "string", nullable: true },
		bannerUrl: { type: "string", nullable: true },
		logoImageUrl: { type: "string", nullable: true },
		errorImageUrl: { type: "string", nullable: true },
		iconUrl: { type: "string", nullable: true },
		backgroundImageUrl: { type: "string", nullable: true },
		name: { type: "string", nullable: true },
		description: { type: "string", nullable: true },
		defaultLightTheme: { type: "string", nullable: true },
		defaultDarkTheme: { type: "string", nullable: true },
		localDriveCapacityMb: { type: "integer" },
		remoteDriveCapacityMb: { type: "integer" },
		antennaLimit: { type: "integer" },
		cacheRemoteFiles: { type: "boolean" },
		markLocalFilesNsfwByDefault: { type: "boolean" },
		emailRequiredForSignup: { type: "boolean" },
		enableHcaptcha: { type: "boolean" },
		hcaptchaSiteKey: { type: "string", nullable: true },
		hcaptchaSecretKey: { type: "string", nullable: true },
		enableRecaptcha: { type: "boolean" },
		recaptchaSiteKey: { type: "string", nullable: true },
		recaptchaSecretKey: { type: "string", nullable: true },
		proxyAccountId: { type: "string", format: "misskey:id", nullable: true },
		maintainerName: { type: "string", nullable: true },
		maintainerEmail: { type: "string", nullable: true },
		pinnedPages: {
			type: "array",
			items: {
				type: "string",
			},
		},
		pinnedClipId: { type: "string", format: "misskey:id", nullable: true },
		langs: {
			type: "array",
			items: {
				type: "string",
			},
		},
		summalyProxy: { type: "string", nullable: true },
		deeplAuthKey: { type: "string", nullable: true },
		deeplIsPro: { type: "boolean" },
		libreTranslateApiUrl: { type: "string", nullable: true },
		libreTranslateApiKey: { type: "string", nullable: true },
		enableEmail: { type: "boolean" },
		email: { type: "string", nullable: true },
		smtpSecure: { type: "boolean" },
		smtpHost: { type: "string", nullable: true },
		smtpPort: { type: "integer", nullable: true },
		smtpUser: { type: "string", nullable: true },
		smtpPass: { type: "string", nullable: true },
		enableServiceWorker: { type: "boolean" },
		swPublicKey: { type: "string", nullable: true },
		swPrivateKey: { type: "string", nullable: true },
		tosUrl: { type: "string", nullable: true },
		moreUrls: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					url: { type: "string" },
				},
			},
			nullable: true,
		},
		repositoryUrl: { type: "string" },
		feedbackUrl: { type: "string" },
		useObjectStorage: { type: "boolean" },
		objectStorageBaseUrl: { type: "string", nullable: true },
		objectStorageBucket: { type: "string", nullable: true },
		objectStoragePrefix: { type: "string", nullable: true },
		objectStorageEndpoint: { type: "string", nullable: true },
		objectStorageRegion: { type: "string", nullable: true },
		objectStoragePort: { type: "integer", nullable: true },
		objectStorageAccessKey: { type: "string", nullable: true },
		objectStorageSecretKey: { type: "string", nullable: true },
		objectStorageUseSSL: { type: "boolean" },
		objectStorageUseProxy: { type: "boolean" },
		objectStorageSetPublicRead: { type: "boolean" },
		objectStorageS3ForcePathStyle: { type: "boolean" },
		enableIpLogging: { type: "boolean" },
		enableActiveEmailValidation: { type: "boolean" },
		experimentalFeatures: {
			type: "object",
			nullable: true,
			properties: {
				postImports: { type: "boolean" },
			},
		},
		enableServerMachineStats: { type: "boolean" },
		enableIdenticonGeneration: { type: "boolean" },
		donationLink: { type: "string", nullable: true },
	},
	required: [],
} as const;

function isValidHttpUrl(src: string) {
	let url;

	try {
		url = new URL(src);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

export default define(meta, paramDef, async (ps, me) => {
	const set = {} as Partial<Meta>;

	if (typeof ps.disableRegistration === "boolean") {
		set.disableRegistration = ps.disableRegistration;
	}

	if (typeof ps.disableLocalTimeline === "boolean") {
		set.disableLocalTimeline = ps.disableLocalTimeline;
	}

	if (typeof ps.disableRecommendedTimeline === "boolean") {
		set.disableRecommendedTimeline = ps.disableRecommendedTimeline;
	}

	if (typeof ps.disableGlobalTimeline === "boolean") {
		set.disableGlobalTimeline = ps.disableGlobalTimeline;
	}

	if (typeof ps.enableGuestTimeline === "boolean") {
		set.enableGuestTimeline = ps.enableGuestTimeline;
	}

	if (typeof ps.defaultReaction === "string") {
		set.defaultReaction = ps.defaultReaction;
	}

	if (Array.isArray(ps.pinnedUsers)) {
		set.pinnedUsers = ps.pinnedUsers.filter(Boolean);
	}

	if (Array.isArray(ps.customMOTD)) {
		set.customMotd = ps.customMOTD.filter(Boolean);
	}

	if (Array.isArray(ps.customSplashIcons)) {
		set.customSplashIcons = ps.customSplashIcons.filter(Boolean);
	}

	if (Array.isArray(ps.recommendedInstances)) {
		set.recommendedInstances = ps.recommendedInstances.filter(Boolean);
		if (set.recommendedInstances?.length > 0) {
			set.recommendedInstances.forEach((instance, index) => {
				if (/^https?:\/\//i.test(instance)) {
					set.recommendedInstances![index] = instance
						.replace(/^https?:\/\//i, "")
						.replace(/\/$/, "");
				}
			});
		}
	}

	if (Array.isArray(ps.hiddenTags)) {
		set.hiddenTags = ps.hiddenTags.filter(Boolean);
	}

	if (Array.isArray(ps.blockedHosts)) {
		let lastValue = "";
		set.blockedHosts = ps.blockedHosts.sort().filter((h) => {
			const lv = lastValue;
			lastValue = h;
			return h !== "" && h !== lv;
		});
	}

	if (Array.isArray(ps.silencedHosts)) {
		let lastValue = "";
		set.silencedHosts = ps.silencedHosts.sort().filter((h) => {
			const lv = lastValue;
			lastValue = h;
			return h !== "" && h !== lv;
		});
	}

	if (ps.themeColor !== undefined) {
		set.themeColor = ps.themeColor;
	}

	if (Array.isArray(ps.allowedHosts)) {
		set.allowedHosts = ps.allowedHosts.filter(Boolean);
	}

	if (typeof ps.privateMode === "boolean") {
		set.privateMode = ps.privateMode;
	}

	if (typeof ps.secureMode === "boolean") {
		set.secureMode = ps.secureMode;
	}

	if (ps.mascotImageUrl !== undefined) {
		set.mascotImageUrl = ps.mascotImageUrl;
	}

	if (ps.bannerUrl !== undefined) {
		set.bannerUrl = ps.bannerUrl;
	}

	if (ps.logoImageUrl !== undefined) {
		set.logoImageUrl = ps.logoImageUrl;
	}

	if (ps.iconUrl !== undefined) {
		set.iconUrl = ps.iconUrl;
	}

	if (ps.backgroundImageUrl !== undefined) {
		set.backgroundImageUrl = ps.backgroundImageUrl;
	}

	if (ps.logoImageUrl !== undefined) {
		set.logoImageUrl = ps.logoImageUrl;
	}

	if (ps.name !== undefined) {
		set.name = ps.name;
	}

	if (ps.description !== undefined) {
		set.description = ps.description;
	}

	if (ps.defaultLightTheme !== undefined) {
		set.defaultLightTheme = ps.defaultLightTheme;
	}

	if (ps.defaultDarkTheme !== undefined) {
		set.defaultDarkTheme = ps.defaultDarkTheme;
	}

	if (ps.localDriveCapacityMb !== undefined) {
		set.localDriveCapacityMb = ps.localDriveCapacityMb;
	}

	if (ps.remoteDriveCapacityMb !== undefined) {
		set.remoteDriveCapacityMb = ps.remoteDriveCapacityMb;
	}

	if (ps.antennaLimit !== undefined) {
		set.antennaLimit = ps.antennaLimit;
	}

	if (ps.cacheRemoteFiles !== undefined) {
		set.cacheRemoteFiles = ps.cacheRemoteFiles;
	}

	if (ps.markLocalFilesNsfwByDefault !== undefined) {
		set.markLocalFilesNsfwByDefault = ps.markLocalFilesNsfwByDefault;
	}

	if (ps.emailRequiredForSignup !== undefined) {
		set.emailRequiredForSignup = ps.emailRequiredForSignup;
	}

	if (ps.enableHcaptcha !== undefined) {
		set.enableHcaptcha = ps.enableHcaptcha;
	}

	if (ps.hcaptchaSiteKey !== undefined) {
		set.hcaptchaSiteKey = ps.hcaptchaSiteKey;
	}

	if (ps.hcaptchaSecretKey !== undefined) {
		set.hcaptchaSecretKey = ps.hcaptchaSecretKey;
	}

	if (ps.enableRecaptcha !== undefined) {
		set.enableRecaptcha = ps.enableRecaptcha;
	}

	if (ps.recaptchaSiteKey !== undefined) {
		set.recaptchaSiteKey = ps.recaptchaSiteKey;
	}

	if (ps.recaptchaSecretKey !== undefined) {
		set.recaptchaSecretKey = ps.recaptchaSecretKey;
	}

	if (ps.proxyAccountId !== undefined) {
		set.proxyAccountId = ps.proxyAccountId;
	}

	if (ps.maintainerName !== undefined) {
		set.maintainerName = ps.maintainerName;
	}

	if (ps.maintainerEmail !== undefined) {
		set.maintainerEmail = ps.maintainerEmail;
	}

	if (Array.isArray(ps.langs)) {
		set.langs = ps.langs.filter(Boolean);
	}

	if (Array.isArray(ps.pinnedPages)) {
		set.pinnedPages = ps.pinnedPages.filter(Boolean);
	}

	if (ps.pinnedClipId !== undefined) {
		set.pinnedClipId = ps.pinnedClipId;
	}

	if (ps.summalyProxy !== undefined) {
		set.summalyProxy = ps.summalyProxy;
	}

	if (ps.enableEmail !== undefined) {
		set.enableEmail = ps.enableEmail;
	}

	if (ps.email !== undefined) {
		set.email = ps.email;
	}

	if (ps.smtpSecure !== undefined) {
		set.smtpSecure = ps.smtpSecure;
	}

	if (ps.smtpHost !== undefined) {
		set.smtpHost = ps.smtpHost;
	}

	if (ps.smtpPort !== undefined) {
		set.smtpPort = ps.smtpPort;
	}

	if (ps.smtpUser !== undefined) {
		set.smtpUser = ps.smtpUser;
	}

	if (ps.smtpPass !== undefined) {
		set.smtpPass = ps.smtpPass;
	}

	if (ps.errorImageUrl !== undefined) {
		set.errorImageUrl = ps.errorImageUrl;
	}

	if (ps.enableServiceWorker !== undefined) {
		set.enableServiceWorker = ps.enableServiceWorker;
	}

	if (ps.swPublicKey !== undefined) {
		set.swPublicKey = ps.swPublicKey;
	}

	if (ps.swPrivateKey !== undefined) {
		set.swPrivateKey = ps.swPrivateKey;
	}

	if (ps.tosUrl !== undefined) {
		set.tosUrl = ps.tosUrl;
	}

	if (ps.moreUrls !== undefined) {
		const areUrlsVaild = ps.moreUrls.every(
			(obj: { name: string; url: string }) => isValidHttpUrl(String(obj.url)),
		);
		if (!areUrlsVaild) throw new Error("invalid URL");
		set.moreUrls = ps.moreUrls;
	}

	if (ps.repositoryUrl !== undefined) {
		set.repositoryUrl = ps.repositoryUrl;
	}

	if (ps.feedbackUrl !== undefined) {
		set.feedbackUrl = ps.feedbackUrl;
	}

	if (ps.useObjectStorage !== undefined) {
		set.useObjectStorage = ps.useObjectStorage;
	}

	if (ps.objectStorageBaseUrl !== undefined) {
		set.objectStorageBaseUrl = ps.objectStorageBaseUrl;
	}

	if (ps.objectStorageBucket !== undefined) {
		set.objectStorageBucket = ps.objectStorageBucket;
	}

	if (ps.objectStoragePrefix !== undefined) {
		set.objectStoragePrefix = ps.objectStoragePrefix;
	}

	if (ps.objectStorageEndpoint !== undefined) {
		set.objectStorageEndpoint = ps.objectStorageEndpoint;
	}

	if (ps.objectStorageRegion !== undefined) {
		set.objectStorageRegion = ps.objectStorageRegion;
	}

	if (ps.objectStoragePort !== undefined) {
		set.objectStoragePort = ps.objectStoragePort;
	}

	if (ps.objectStorageAccessKey !== undefined) {
		set.objectStorageAccessKey = ps.objectStorageAccessKey;
	}

	if (ps.objectStorageSecretKey !== undefined) {
		set.objectStorageSecretKey = ps.objectStorageSecretKey;
	}

	if (ps.objectStorageUseSSL !== undefined) {
		set.objectStorageUseSsl = ps.objectStorageUseSSL;
	}

	if (ps.objectStorageUseProxy !== undefined) {
		set.objectStorageUseProxy = ps.objectStorageUseProxy;
	}

	if (ps.objectStorageSetPublicRead !== undefined) {
		set.objectStorageSetPublicRead = ps.objectStorageSetPublicRead;
	}

	if (ps.objectStorageS3ForcePathStyle !== undefined) {
		set.objectStorageS3ForcePathStyle = ps.objectStorageS3ForcePathStyle;
	}

	if (ps.deeplAuthKey !== undefined) {
		if (ps.deeplAuthKey === "") {
			set.deeplAuthKey = null;
		} else {
			set.deeplAuthKey = ps.deeplAuthKey;
		}
	}

	if (ps.deeplIsPro !== undefined) {
		set.deeplIsPro = ps.deeplIsPro;
	}

	if (ps.libreTranslateApiUrl !== undefined) {
		if (ps.libreTranslateApiUrl === "") {
			set.libreTranslateApiUrl = null;
		} else {
			set.libreTranslateApiUrl = ps.libreTranslateApiUrl;
		}
	}

	if (ps.libreTranslateApiKey !== undefined) {
		if (ps.libreTranslateApiKey === "") {
			set.libreTranslateApiKey = null;
		} else {
			set.libreTranslateApiKey = ps.libreTranslateApiKey;
		}
	}

	if (ps.enableIpLogging !== undefined) {
		set.enableIpLogging = ps.enableIpLogging;
	}

	if (ps.enableActiveEmailValidation !== undefined) {
		set.enableActiveEmailValidation = ps.enableActiveEmailValidation;
	}

	if (ps.experimentalFeatures !== undefined) {
		set.experimentalFeatures = ps.experimentalFeatures || undefined;
	}

	if (ps.enableServerMachineStats !== undefined) {
		set.enableServerMachineStats = ps.enableServerMachineStats;
	}

	if (ps.enableIdenticonGeneration !== undefined) {
		set.enableIdenticonGeneration = ps.enableIdenticonGeneration;
	}

	if (ps.donationLink !== undefined) {
		set.donationLink = ps.donationLink;
		if (set.donationLink && !/^https?:\/\//i.test(set.donationLink)) {
			set.donationLink = `https://${set.donationLink}`;
		}
	}

	await db.transaction(async (transactionalEntityManager) => {
		const metas = await transactionalEntityManager.find(Meta, {
			order: {
				id: "DESC",
			},
		});

		const meta = metas[0];

		if (meta) {
			await transactionalEntityManager.update(Meta, meta.id, set);
		} else {
			await transactionalEntityManager.save(Meta, set);
		}
	});

	await Promise.all([insertModerationLog(me, "updateMeta"), updateMetaCache()]);
});
