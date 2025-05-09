<template>
	<MkModal ref="modal" @click="$emit('click')" @closed="$emit('closed')">
		<div
			ref="rootEl"
			class="hrmcaedk _narrow_"
			:style="{
				inlineSize: `${width}px`,
				blockSize: height ? `min(${height}px, 100%)` : '100%',
			}"
		>
			<div class="header" @contextmenu="onContextmenu">
				<button
					v-if="history.length > 0"
					v-tooltip="i18n.ts.goBack"
					class="_button"
					@click="back()"
				>
					<i :class="icon('ph-dir ph-caret-left')"></i>
				</button>
				<span v-else style="display: inline-block; inline-size: 20px"></span>
				<span v-if="pageMetadata?.value" class="title">
					<i
						v-if="pageMetadata?.value.icon"
						class="icon"
						:class="icon(pageMetadata?.value.icon)"
					></i>
					<span>{{ pageMetadata?.value.title }}</span>
				</span>
				<button
					class="_button"
					:aria-label="i18n.ts.close"
					@click="modal!.close()"
				>
					<i :class="icon('ph-x')"></i>
				</button>
			</div>
			<div class="body">
				<MkStickyContainer>
					<template #header
						><MkPageHeader
							v-if="
								pageMetadata?.value &&
								!pageMetadata?.value.hideHeader
							"
							:info="pageMetadata?.value"
					/></template>
					<RouterView :router="router" />
				</MkStickyContainer>
			</div>
		</div>
	</MkModal>
</template>

<script lang="ts" setup>
import type { ComputedRef } from "vue";
import { computed, provide, ref } from "vue";
import MkModal from "@/components/MkModal.vue";
import { popout as _popout } from "@/scripts/popout";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import * as os from "@/os";
import { mainRouter, routes } from "@/router";
import { i18n } from "@/i18n";
import type { PageMetadata } from "@/scripts/page-metadata";
import { provideMetadataReceiver } from "@/scripts/page-metadata";
import { Router } from "@/nirax";
import icon from "@/scripts/icon";
import type { MenuItem } from "@/types/menu";

const props = defineProps<{
	initialPath: string;
}>();

defineEmits<{
	(ev: "closed"): void;
	(ev: "click"): void;
}>();

const router = new Router(routes, props.initialPath);

router.addListener("push", (ctx) => {});

const pageMetadata = ref<null | ComputedRef<PageMetadata>>();
const rootEl = ref();
const modal = ref<InstanceType<typeof MkModal> | null>(null);
const path = ref(props.initialPath);
const width = ref(860);
const height = ref(660);
const history: string[] = [];

provide("router", router);
provideMetadataReceiver((info) => {
	pageMetadata.value = info;
});
provide("shouldOmitHeaderTitle", true);
provide("shouldHeaderThin", true);

const pageUrl = computed(() => url + path.value);
const contextmenu = computed((): MenuItem[] => {
	return [
		{
			type: "label",
			text: path.value,
		},
		{
			icon: `${icon("ph-arrows-out-simple")}`,
			text: i18n.ts.showInPage,
			action: expand,
		},
		{
			icon: `${icon("ph-arrow-square-out")}`,
			text: i18n.ts.popout,
			action: popout,
		},
		null,
		{
			icon: `${icon("ph-arrow-square-out")}`,
			text: i18n.ts.openInNewTab,
			action: () => {
				window.open(pageUrl.value, "_blank");
				modal.value!.close();
			},
		},
		{
			icon: `${icon("ph-link-simple")}`,
			text: i18n.ts.copyLink,
			action: () => {
				copyToClipboard(pageUrl.value);
				os.success();
			},
		},
	];
});

function navigate(path: string, record = true) {
	if (record) history.push(router.getCurrentPath());
	router.push(path);
}

function back() {
	const backTo = history.pop();
	if (backTo) {
		navigate(backTo, false);
	}
}

function expand() {
	mainRouter.push(path.value);
	modal.value!.close();
}

function popout() {
	_popout(path.value, rootEl.value);
	modal.value!.close();
}

function onContextmenu(ev: MouseEvent) {
	os.contextMenu(contextmenu.value, ev);
}
</script>

<style lang="scss" scoped>
.hrmcaedk {
	overflow: hidden;
	display: flex;
	flex-direction: column;
	contain: content;
	border-radius: var(--radius);
	margin: auto;

	--root-margin: 24px;

	@media (max-inline-size: 500px) {
		--root-margin: 16px;
	}

	> .header {
		$height: 52px;
		$height-narrow: 42px;
		display: flex;
		flex-shrink: 0;
		block-size: $height;
		line-height: $height;
		font-weight: bold;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background: var(--windowHeader);
		-webkit-backdrop-filter: var(--blur, blur(15px));
		backdrop-filter: var(--blur, blur(15px));

		> button {
			block-size: $height;
			inline-size: $height;

			&:hover {
				color: var(--fgHighlighted);
			}
		}

		@media (max-inline-size: 500px) {
			block-size: $height-narrow;
			line-height: $height-narrow;
			padding-inline-start: 16px;

			> button {
				block-size: $height-narrow;
				inline-size: $height-narrow;
			}
		}

		> .title {
			flex: 1;

			> .icon {
				margin-inline-end: 0.5em;
			}
		}
	}

	> .body {
		overflow: auto;
		background: var(--bg);
	}
}
</style>
