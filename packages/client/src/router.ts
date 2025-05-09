import type { AsyncComponentLoader } from "vue";
import { defineAsyncComponent, inject } from "vue";
import { isEmojiMod, isModerator, me } from "@/me";
import { type RouteDef, Router } from "@/nirax";
import MkError from "@/pages/_error_.vue";
import MkLoading from "@/pages/_loading_.vue";

const page = (loader: AsyncComponentLoader) =>
	defineAsyncComponent({
		loader,
		loadingComponent: MkLoading,
		errorComponent: MkError,
	});

export const routes: RouteDef[] = [
	{
		path: "/@:initUser/pages/:initPageName/view-source",
		component: page(() => import("./pages/page-editor/page-editor.vue")),
	},
	{
		path: "/@:username/pages/:pageName",
		component: page(() => import("./pages/page.vue")),
	},
	{
		path: "/@:acct/following",
		component: page(() => import("./pages/user/following.vue")),
	},
	{
		path: "/@:acct/followers",
		component: page(() => import("./pages/user/followers.vue")),
	},
	{
		name: "user",
		path: "/@:acct/:page?",
		component: page(() => import("./pages/user/index.vue")),
	},
	{
		name: "note",
		path: "/notes/:noteId",
		component: page(() => import("./pages/note.vue")),
	},
	{
		name: "note-history",
		path: "/notes/:noteId/history",
		component: page(() => import("./pages/note-history.vue")),
	},
	{
		path: "/clips/:clipId",
		component: page(() => import("./pages/clip.vue")),
	},
	{
		path: "/user-info/:userId",
		component: page(() => import("./pages/user-info.vue")),
	},
	{
		path: "/instance-info/:host",
		component: page(() => import("./pages/instance-info.vue")),
	},
	{
		path: "/public/local",
		component: page(() => import("./pages/no-graze.vue")),
	},
	{
		name: "settings",
		path: "/settings",
		component: page(() => import("./pages/settings/index.vue")),
		loginRequired: true,
		children: [
			{
				path: "/profile",
				name: "profile",
				component: page(() => import("./pages/settings/profile.vue")),
			},
			{
				path: "/privacy",
				name: "privacy",
				component: page(() => import("./pages/settings/privacy.vue")),
			},
			{
				path: "/reaction",
				name: "reaction",
				component: page(() => import("./pages/settings/reaction.vue")),
			},
			{
				path: "/drive",
				name: "drive",
				component: page(() => import("./pages/settings/drive.vue")),
			},
			{
				path: "/notifications",
				name: "notifications",
				component: page(() => import("./pages/settings/notifications.vue")),
			},
			{
				path: "/accessibility",
				name: "accessibility",
				component: page(() => import("./pages/settings/accessibility.vue")),
			},
			{
				path: "/email",
				name: "email",
				component: page(() => import("./pages/settings/email.vue")),
			},
			{
				path: "/security",
				name: "security",
				component: page(() => import("./pages/settings/security.vue")),
			},
			{
				path: "/general",
				name: "general",
				component: page(() => import("./pages/settings/general.vue")),
			},
			{
				path: "/theme/install",
				name: "theme",
				component: page(() => import("./pages/settings/theme.install.vue")),
			},
			{
				path: "/theme/manage",
				name: "theme",
				component: page(() => import("./pages/settings/theme.manage.vue")),
			},
			{
				path: "/theme",
				name: "theme",
				component: page(() => import("./pages/settings/theme.vue")),
			},
			{
				path: "/custom-css",
				name: "custom-css",
				component: page(() => import("./pages/settings/custom-css.vue")),
			},
			{
				path: "/custom-katex-macro",
				name: "custom-katex-macro",
				component: page(
					() => import("./pages/settings/custom-katex-macro.vue"),
				),
			},
			{
				path: "/account-info",
				name: "account-info",
				component: page(() => import("./pages/settings/account-info.vue")),
			},
			{
				path: "/navbar",
				name: "navbar",
				component: page(() => import("./pages/settings/navbar.vue")),
			},
			{
				path: "/statusbar",
				name: "statusbar",
				component: page(() => import("./pages/settings/statusbar.vue")),
			},
			{
				path: "/sounds",
				name: "sounds",
				component: page(() => import("./pages/settings/sounds.vue")),
			},
			{
				path: "/plugin/install",
				name: "plugin",
				component: page(() => import("./pages/settings/plugin.install.vue")),
			},
			{
				path: "/plugin",
				name: "plugin",
				component: page(() => import("./pages/settings/plugin.vue")),
			},
			{
				path: "/import-export",
				name: "import-export",
				component: page(() => import("./pages/settings/import-export.vue")),
			},
			{
				path: "/instance-mute",
				name: "instance-mute",
				component: page(() => import("./pages/settings/instance-mute.vue")),
			},
			{
				path: "/mute-block",
				name: "mute-block",
				component: page(() => import("./pages/settings/mute-block.vue")),
			},
			{
				path: "/word-mute",
				name: "word-mute",
				component: page(() => import("./pages/settings/word-mute.vue")),
			},
			{
				path: "/api",
				name: "api",
				component: page(() => import("./pages/settings/api.vue")),
			},
			{
				path: "/apps",
				name: "apps",
				component: page(() => import("./pages/settings/apps.vue")),
			},
			{
				path: "/webhook/edit/:webhookId",
				name: "webhook",
				component: page(() => import("./pages/settings/webhook.edit.vue")),
			},
			{
				path: "/webhook/new",
				name: "webhook",
				component: page(() => import("./pages/settings/webhook.new.vue")),
			},
			{
				path: "/webhook",
				name: "webhook",
				component: page(() => import("./pages/settings/webhook.vue")),
			},
			{
				path: "/deck",
				name: "deck",
				component: page(() => import("./pages/settings/deck.vue")),
			},
			{
				path: "/delete-account",
				name: "delete-account",
				component: page(() => import("./pages/settings/delete-account.vue")),
			},
			{
				path: "/preferences-backups",
				name: "preferences-backups",
				component: page(
					() => import("./pages/settings/preferences-backups.vue"),
				),
			},
			{
				path: "/migration",
				name: "migration",
				component: page(() => import("./pages/settings/migration.vue")),
			},
			{
				path: "/custom-css",
				name: "general",
				component: page(() => import("./pages/settings/custom-css.vue")),
			},
			{
				path: "/custom-katex-macro",
				name: "general",
				component: page(
					() => import("./pages/settings/custom-katex-macro.vue"),
				),
			},
			{
				path: "/accounts",
				name: "profile",
				component: page(() => import("./pages/settings/accounts.vue")),
			},
			{
				path: "/account-info",
				name: "other",
				component: page(() => import("./pages/settings/account-info.vue")),
			},
			{
				path: "/delete-account",
				name: "other",
				component: page(() => import("./pages/settings/delete-account.vue")),
			},
			{
				path: "/other",
				name: "other",
				component: page(() => import("./pages/settings/other.vue")),
			},
			{
				path: "/",
				component: page(() => import("./pages/_empty_.vue")),
			},
		],
	},
	{
		path: "/reset-password/:token?",
		component: page(() => import("./pages/reset-password.vue")),
	},
	{
		path: "/signup-complete/:code",
		component: page(() => import("./pages/signup-complete.vue")),
	},
	{
		path: "/verify-email/:code",
		component: page(() => import("./pages/verify-email.vue")),
	},
	{
		path: "/announcements",
		component: page(() => import("./pages/announcements.vue")),
	},
	{
		path: "/about",
		component: page(() => import("./pages/about.vue")),
		hash: "initialTab",
	},
	{
		path: "/about-maria",
		component: page(() => import("./pages/about-maria.vue")),
	},
	{
		path: "/theme-editor",
		component: page(() => import("./pages/theme-editor.vue")),
		loginRequired: true,
	},
	{
		path: "/explore/tags/:tag",
		component: page(() => import("./pages/explore.vue")),
	},
	{
		path: "/explore",
		component: page(() => import("./pages/explore.vue")),
	},
	{
		path: "/search",
		component: page(() => import("./pages/search.vue")),
		query: {
			q: "query",
			user: "user",
			host: "host",
			since: "since",
			until: "until",
			withFiles: "withFiles",
			channel: "channel",
			detailed: "searchCwAndAlt",
		},
	},
	{
		path: "/authorize-follow",
		component: page(() => import("./pages/follow.vue")),
		loginRequired: true,
	},
	{
		path: "/follow-me",
		component: page(() => import("./pages/follow-me.vue")),
	},
	{
		path: "/authorize_interaction",
		component: page(() => import("./pages/authorize_interaction.vue")),
		loginRequired: true,
	},
	{
		path: "/share",
		component: page(() => import("./pages/share.vue")),
		loginRequired: true,
	},
	{
		path: "/api-console",
		component: page(() => import("./pages/api-console.vue")),
		loginRequired: true,
	},
	{
		path: "/mfm-cheat-sheet",
		component: page(() => import("./pages/mfm-cheat-sheet.vue")),
	},
	{
		path: "/scratchpad",
		component: page(() => import("./pages/scratchpad.vue")),
	},
	{
		path: "/preview",
		component: page(() => import("./pages/preview.vue")),
	},
	{
		path: "/auth/:token",
		component: page(() => import("./pages/auth.vue")),
	},
	{
		path: "/oauth/authorize",
		component: page(() => import("./pages/oauth.vue")),
		query: {
			response_type: "response_type",
			client_id: "client_id",
			redirect_uri: "redirect_uri",
			scope: "scope",
			force_login: "force_login",
			lang: "lang",
			state: "state",
		},
	},
	{
		path: "/miauth/:session",
		component: page(() => import("./pages/miauth.vue")),
		query: {
			callback: "callback",
			name: "name",
			icon: "icon",
			permission: "permission",
		},
	},
	{
		path: "/tags/:tag",
		component: page(() => import("./pages/tag.vue")),
	},
	{
		path: "/pages/new",
		component: page(() => import("./pages/page-editor/page-editor.vue")),
		loginRequired: true,
	},
	{
		path: "/pages/edit/:initPageId",
		component: page(() => import("./pages/page-editor/page-editor.vue")),
		loginRequired: true,
	},
	{
		path: "/pages",
		component: page(() => import("./pages/pages.vue")),
	},
	{
		path: "/gallery/:postId/edit",
		component: page(() => import("./pages/gallery/edit.vue")),
		loginRequired: true,
	},
	{
		path: "/gallery/new",
		component: page(() => import("./pages/gallery/edit.vue")),
		loginRequired: true,
	},
	{
		path: "/gallery/:postId",
		component: page(() => import("./pages/gallery/post.vue")),
	},
	{
		path: "/gallery",
		component: page(() => import("./pages/gallery/index.vue")),
	},
	{
		path: "/channels/:channelId/edit",
		component: page(() => import("./pages/channel-editor.vue")),
		loginRequired: true,
	},
	{
		path: "/channels/new",
		component: page(() => import("./pages/channel-editor.vue")),
		loginRequired: true,
	},
	{
		path: "/channels/:channelId",
		component: page(() => import("./pages/channel.vue")),
	},
	{
		path: "/channels",
		component: page(() => import("./pages/channels.vue")),
	},
	{
		path: "/registry/keys/system/:path(*)?",
		component: page(() => import("./pages/registry.keys.vue")),
	},
	{
		path: "/registry/value/system/:path(*)?",
		component: page(() => import("./pages/registry.value.vue")),
	},
	{
		path: "/registry",
		component: page(() => import("./pages/registry.vue")),
	},
	{
		path: "/admin/file/:fileId",
		component: isModerator
			? page(() => import("./pages/admin-file.vue"))
			: page(() => import("./pages/not-found.vue")),
	},
	{
		path: "/admin/emojis",
		name: "emojis",
		component: isEmojiMod
			? page(() => import("./pages/admin/emojis.vue"))
			: page(() => import("./pages/not-found.vue")),
	},
	{
		path: "/admin",
		component: isModerator
			? page(() => import("./pages/admin/index.vue"))
			: page(() => import("./pages/not-found.vue")),
		children: [
			{
				path: "/overview",
				name: "overview",
				component: page(() => import("./pages/admin/overview.vue")),
			},
			{
				path: "/users",
				name: "users",
				component: page(() => import("./pages/admin/users.vue")),
			},
			{
				path: "/hashtags",
				name: "hashtags",
				component: page(() => import("./pages/admin/hashtags.vue")),
			},
			{
				path: "/federation",
				name: "federation",
				component: page(() => import("./pages/admin/federation.vue")),
			},
			{
				path: "/queue",
				name: "queue",
				component: page(() => import("./pages/admin/queue.vue")),
			},
			{
				path: "/files",
				name: "files",
				component: page(() => import("./pages/admin/files.vue")),
			},
			{
				path: "/announcements",
				name: "announcements",
				component: page(() => import("./pages/admin/announcements.vue")),
			},
			{
				path: "/ads",
				name: "ads",
				component: page(() => import("./pages/admin/promotions.vue")),
			},
			{
				path: "/database",
				name: "database",
				component: page(() => import("./pages/admin/database.vue")),
			},
			{
				path: "/abuses",
				name: "abuses",
				component: page(() => import("./pages/admin/abuses.vue")),
			},
			{
				path: "/settings",
				name: "settings",
				component: page(() => import("./pages/admin/settings.vue")),
			},
			{
				path: "/email-settings",
				name: "email-settings",
				component: page(() => import("./pages/admin/email-settings.vue")),
			},
			{
				path: "/object-storage",
				name: "object-storage",
				component: page(() => import("./pages/admin/object-storage.vue")),
			},
			{
				path: "/security",
				name: "security",
				component: page(() => import("./pages/admin/security.vue")),
			},
			{
				path: "/relays",
				name: "relays",
				component: page(() => import("./pages/admin/relays.vue")),
			},
			{
				path: "/instance-block",
				name: "instance-block",
				component: page(() => import("./pages/admin/instance-block.vue")),
			},
			{
				path: "/proxy-account",
				name: "proxy-account",
				component: page(() => import("./pages/admin/proxy-account.vue")),
			},
			{
				path: "/other-settings",
				name: "other-settings",
				component: page(() => import("./pages/admin/other-settings.vue")),
			},
			{
				path: "/other-settings",
				name: "other-settings",
				component: page(() => import("./pages/admin/custom-css.vue")),
			},
			{
				path: "/experiments",
				name: "experiments",
				component: page(() => import("./pages/admin/experiments.vue")),
			},
			{
				path: "/",
				component: page(() => import("./pages/_empty_.vue")),
			},
		],
	},
	{
		path: "/my/notifications",
		component: page(() => import("./pages/notifications.vue")),
		loginRequired: true,
	},
	{
		path: "/my/favorites",
		component: page(() => import("./pages/favorites.vue")),
		loginRequired: true,
	},
	{
		name: "messaging",
		path: "/my/messaging",
		component: page(() => import("./pages/messaging/index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/messaging/:userAcct",
		component: page(() => import("./pages/messaging/messaging-room.vue")),
		loginRequired: true,
	},
	{
		path: "/my/messaging/group/:groupId",
		component: page(() => import("./pages/messaging/messaging-room.vue")),
		loginRequired: true,
	},
	{
		path: "/my/drive/folder/:folder",
		component: page(() => import("./pages/drive.vue")),
		loginRequired: true,
	},
	{
		path: "/my/drive/file/:fileId/attached",
		component: page(() => import("./pages/attached-files.vue")),
		loginRequired: true,
	},
	{
		path: "/my/drive",
		component: page(() => import("./pages/drive.vue")),
		loginRequired: true,
	},
	{
		path: "/my/follow-requests",
		component: page(() => import("./pages/follow-requests.vue")),
		loginRequired: true,
	},
	{
		path: "/my/follow-requests/sent",
		component: page(() => import("./pages/follow-requests-sent.vue")),
		loginRequired: true,
	},
	{
		path: "/my/lists/:listId",
		component: page(() => import("./pages/my-lists/list.vue")),
		loginRequired: true,
	},
	{
		path: "/my/lists",
		component: page(() => import("./pages/my-lists/index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/clips",
		component: page(() => import("./pages/my-clips/index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/groups",
		component: page(() => import("./pages/my-groups/index.vue")),
		loginRequired: true,
	},
	{
		path: "/my/groups/:groupId",
		component: page(() => import("./pages/my-groups/group.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas/create",
		component: page(() => import("./pages/my-antennas/create.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas/:antennaId",
		component: page(() => import("./pages/my-antennas/edit.vue")),
		loginRequired: true,
	},
	{
		path: "/my/antennas",
		component: page(() => import("./pages/my-antennas/index.vue")),
		loginRequired: true,
	},
	{
		path: "/timeline",
		// TODO: show not-found page if meta.enableGuestTimeline is false
		//       (currently it shows nothing if guest timelines are unavailable)
		component: page(() => import("./pages/timeline.vue")),
	},
	{
		path: "/timeline/list/:listId",
		component: page(() => import("./pages/user-list-timeline.vue")),
		loginRequired: true,
	},
	{
		path: "/timeline/antenna/:antennaId",
		component: page(() => import("./pages/antenna-timeline.vue")),
		loginRequired: true,
	},
	{
		name: "index",
		path: "/",
		component: me
			? page(() => import("./pages/timeline.vue"))
			: page(() => import("./pages/welcome.vue")),
		globalCacheKey: "index",
	},
	{
		path: "/:(*)",
		component: page(() => import("./pages/not-found.vue")),
	},
];

export const mainRouter = new Router(
	routes,
	location.pathname + location.search + location.hash,
);

window.history.replaceState(
	{ key: mainRouter.getCurrentKey() },
	"",
	location.href,
);

// TODO: このファイルでスクロール位置も管理する設計だとdeckに対応できないのでなんとかする
// スクロール位置取得+スクロール位置設定関数をprovideする感じでも良いかも

const scrollPosStore = new Map<string, number>();

window.setInterval(() => {
	scrollPosStore.set(window.history.state?.key, window.scrollY);
}, 1000);

mainRouter.addListener("push", (ctx) => {
	window.history.pushState({ key: ctx.key }, "", ctx.path);
	const scrollPos = scrollPosStore.get(ctx.key) ?? 0;
	window.scroll({ top: scrollPos, behavior: "instant" });
	if (scrollPos !== 0) {
		window.setTimeout(() => {
			// 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
			window.scroll({ top: scrollPos, behavior: "instant" });
		}, 100);
	}
});

mainRouter.addListener("replace", (ctx) => {
	window.history.replaceState({ key: ctx.key }, "", ctx.path);
});

mainRouter.addListener("same", () => {
	window.scroll({ top: 0, behavior: "smooth" });
});

window.addEventListener("popstate", (event) => {
	mainRouter.replace(
		location.pathname + location.search + location.hash,
		event.state?.key,
		false,
	);
	const scrollPos = scrollPosStore.get(event.state?.key) ?? 0;
	window.scroll({ top: scrollPos, behavior: "instant" });
	window.setTimeout(() => {
		// 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
		window.scroll({ top: scrollPos, behavior: "instant" });
	}, 100);
});

export function useRouter(): Router {
	return inject<Router | null>("router", null) ?? mainRouter;
}
