<template>
	<div v-if="meta" class="rsqzvsbo">
		<div class="top">
			<MkFeaturedPhotos class="bg" />
			<XTimeline class="tl" />
			<div class="shape1"></div>
			<div class="shape2"></div>
			<img src="/client-assets/misskey.svg" class="misskey" />
			<div class="emojis">
				<MkEmoji
					v-for="reaction in defaultReactions"
					:normal="true"
					:no-style="true"
					:emoji="reaction"
				/>
			</div>
			<div class="main">
				<img
					:src="
						faviconUrl ||
						iconUrl ||
						'/favicon.ico'
					"
					alt=""
					class="icon"
				/>
				<button class="_button _acrylic menu" @click="showMenu">
					<i :class="icon('ph-dots-three-outline ph-dir')"></i>
				</button>
				<div class="fg">
					<h1>
						<img
							v-if="meta.logoImageUrl"
							class="logo"
							:src="meta.logoImageUrl"
							alt="logo"
						/>
						<span v-else class="text">{{ instanceName }}</span>
					</h1>
					<div class="about">
						<div
							class="desc"
							v-html="
								meta.description || i18n.ts.headlineFirefish
							"
						></div>
					</div>
					<div class="action">
						<MkButton
							inline
							rounded
							gradate
							data-cy-signup
							style="margin-inline-end: 12px"
							@click="signup()"
							>{{ i18n.ts.signup }}</MkButton
						>
						<MkButton
							inline
							rounded
							data-cy-signin
							@click="signin()"
							>{{ i18n.ts.login }}</MkButton
						>
						<MkButton
							inline
							rounded
							style="margin-inline-start: 12px; margin-block-start: 12px"
							onclick="window.location.href='/explore'"
							>{{ i18n.ts.explore }}</MkButton
						>
					</div>
				</div>
			</div>
			<div v-if="instances" class="federation">
				<MarqueeText :duration="40">
					<MkA
						v-for="instance in instances"
						:key="instance.id"
						:class="$style.federationInstance"
						@click="signup()"
					>
						<img
							v-if="instance.iconUrl"
							class="icon"
							:src="instance.iconUrl"
							alt=""
						/>
						<span class="name _monospace">{{ instance.host }}</span>
					</MkA>
				</MarqueeText>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import XTimeline from "./welcome.timeline.vue";
import MarqueeText from "@/components/MkMarquee.vue";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkButton from "@/components/MkButton.vue";
import MkFeaturedPhotos from "@/components/MkFeaturedPhotos.vue";
import { instanceName } from "@/config";
import * as os from "@/os";
import { getInstanceInfo } from "@/instance";
import { i18n } from "@/i18n";
import { defaultReactions } from "@/store";
import icon from "@/scripts/icon";

const meta = ref();
const stats = ref();
const tags = ref();
const onlineUsersCount = ref();
const instances = ref();

const { faviconUrl, iconUrl } = getInstanceInfo();

os.api("meta", { detail: true }).then((_meta) => {
	meta.value = _meta;
});

os.api("stats").then((_stats) => {
	stats.value = _stats;
});

os.api("get-online-users-count").then((res) => {
	onlineUsersCount.value = res.count;
});

os.api("hashtags/list", {
	sort: "+mentionedLocalUsers",
	limit: 8,
}).then((_tags) => {
	tags.value = _tags;
});

os.api("federation/instances", {
	sort: "+pubSub",
	limit: 20,
}).then((_instances) => {
	instances.value = _instances;
});

function signin() {
	os.popup(
		XSigninDialog,
		{
			autoSet: true,
		},
		{},
		"closed",
	);
}

function signup() {
	os.popup(
		XSignupDialog,
		{
			autoSet: true,
		},
		{},
		"closed",
	);
}

function showMenu(ev) {
	os.popupMenu(
		[
			{
				text: i18n.ts.instanceInfo,
				icon: `${icon("ph-info")}`,
				action: () => {
					os.pageWindow("/about");
				},
			},
			{
				text: i18n.ts.aboutFirefish,
				icon: `${icon("ph-info")}`,
				action: () => {
					os.pageWindow("/about-maria");
				},
			},
			getInstanceInfo.tosUrl
				? {
						text: i18n.ts.tos,
						icon: `${icon("ph-scroll")}`,
						action: () => {
							window.open(getInstanceInfo.tosUrl, "_blank");
						},
					}
				: null,
		],
		ev.currentTarget ?? ev.target,
	);
}
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	> .top {
		display: flex;
		text-align: center;
		min-block-size: 100vb;
		box-sizing: border-box;
		padding: 16px;

		> .bg {
			position: absolute;
			inset-block-start: 0;
			inset-inline-end: 0;
			inline-size: 80%; // 100%からshapeの幅を引いている
			block-size: 100%;
		}

		> .tl {
			position: absolute;
			inset-block-start: 0;
			inset-block-end: 0;
			inset-inline-end: 64px;
			margin: auto;
			inline-size: 500px;
			block-size: calc(100% - 128px);
			overflow: hidden;
			-webkit-mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 128px,
				rgba(0, 0, 0, 1) calc(100% - 128px),
				rgba(0, 0, 0, 0) 100%
			);
			mask-image: linear-gradient(
				var(--gradient-to-block-start),
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 1) 128px,
				rgba(0, 0, 0, 1) calc(100% - 128px),
				rgba(0, 0, 0, 0) 100%
			);

			// TODO: use logical property (max-inline-size doesn't work)
			@media (max-width: 1200px) {
				display: none;
			}
		}

		> .shape1 {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
			background: var(--accent);
			clip-path: polygon(0% 0%, 45% 0%, 20% 100%, 0% 100%);
		}
		> .shape2 {
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: 0;
			inline-size: 100%;
			block-size: 100%;
			background: var(--accent);
			clip-path: polygon(0% 0%, 25% 0%, 35% 100%, 0% 100%);
			opacity: 0.5;
		}

		> .misskey {
			position: absolute;
			inset-block-start: 42px;
			inset-inline-start: 42px;
			inline-size: 140px;

			// TODO: use logical property (max-inline-size doesn't work)
			@media (max-width: 450px) {
				inline-size: 130px;
			}
		}

		> .emojis {
			position: absolute;
			inset-block-end: 32px;
			inset-inline-start: 115px;
			transform: scale(1.5);

			> * {
				margin-inline-end: 8px;
			}

			// TODO: use logical property (max-inline-size doesn't work)
			@media (max-width: 1200px) {
				display: none;
			}
		}

		> .main {
			position: relative;
			inline-size: min(480px, 100%);
			margin-block-start: auto;
			margin-inline-end: auto;
			margin-block-end: auto;
			margin-inline-start: 128px;
			background: var(--panel);
			border-radius: var(--radius);
			box-shadow: 0 12px 32px rgb(0 0 0 / 25%);

			// TODO: use logical property (max-inline-size doesn't work)
			@media (max-width: 1200px) {
				margin: auto;
			}

			> .icon {
				inline-size: 85px;
				margin-block-start: -47px;
				vertical-align: bottom;
			}

			> .menu {
				position: absolute;
				inset-block-start: 16px;
				inset-inline-end: 16px;
				inline-size: 32px;
				block-size: 32px;
				border-radius: 8px;
				font-size: 18px;
				z-index: 2;
			}

			> .fg {
				position: relative;
				z-index: 1;

				> h1 {
					display: block;
					margin: 0;
					padding-block-start: 16px;
					padding-inline-end: 32px;
					padding-block-end: 24px;
					padding-inline-start: 32px;
					font-size: 1.4em;

					> .logo {
						vertical-align: bottom;
						max-block-size: 120px;
						max-inline-size: min(100%, 300px);
					}
				}

				> .about {
					padding-block: 0;
					padding-inline: 32px;
				}

				> .action {
					padding: 32px;
					padding-block-start: 22px;

					> * {
						line-height: 28px;
					}
				}
			}
		}

		> .federation {
			position: absolute;
			inset-block-end: 16px;
			inset-inline-start: 0;
			inset-inline-end: 0;
			margin: auto;
			background: var(--acrylicPanel);
			-webkit-backdrop-filter: var(--blur, blur(15px));
			backdrop-filter: var(--blur, blur(15px));
			border-radius: 999px;
			overflow: clip;
			inline-size: 35%;
			inset-inline-start: 50%;
			padding-block: 8px;
			padding-inline: 0;

			// TODO: use logical property (max-inline-size doesn't work)
			@media (max-width: 900px) {
				display: none;
			}
		}
	}
}
</style>

<style lang="scss" module>
.federationInstance {
	display: inline-flex;
	align-items: center;
	vertical-align: bottom;
	padding-block-start: 6px;
	padding-inline-end: 12px;
	padding-block-end: 6px;
	padding-inline-start: 6px;
	margin-block-start: 0;
	margin-inline-end: 10px;
	margin-block-end: 0;
	margin-inline-start: 0;
	background: var(--panel);
	border-radius: 999px;

	> :global(.icon) {
		display: inline-block;
		inline-size: 20px;
		block-size: 20px;
		margin-inline-end: 5px;
		border-radius: 999px;
	}
}
</style>
