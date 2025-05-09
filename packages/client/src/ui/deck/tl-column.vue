<template>
	<XColumn
		:menu="menu"
		:column="column"
		:is-stacked="isStacked"
		:indicated="indicated"
		@change-active-state="onChangeActiveState"
		@parent-focus="($event) => emit('parent-focus', $event)"
	>
		<template #header>
			<i v-if="column.tl === 'home'" :class="icon('ph-house')"></i>
			<i
				v-else-if="column.tl === 'local'"
				:class="icon('ph-chats-circle')"
			></i>
			<i
				v-else-if="column.tl === 'social'"
				:class="icon('ph-share-network')"
			></i>
			<i
				v-else-if="column.tl === 'global'"
				:class="icon('ph-planet')"
			></i>
			<span style="margin-inline-start: 8px">{{ column.name }}</span>
		</template>

		<div v-if="disabled" class="iwaalbte">
			<p>
				<i :class="icon('ph-minus-circle')"></i>
				{{ i18n.t("disabled-timeline.title") }}
			</p>
			<p class="desc">{{ i18n.t("disabled-timeline.description") }}</p>
		</div>
		<XTimeline
			v-else-if="column.tl"
			ref="timeline"
			:key="column.tl"
			:src="column.tl"
			@after="() => emit('loaded')"
			@queue="queueUpdated"
			@note="onNote"
		/>
	</XColumn>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import XColumn from "./column.vue";
import type { Column } from "./deck-store";
import { removeColumn, updateColumn } from "./deck-store";
import XTimeline from "@/components/MkTimeline.vue";
import * as os from "@/os";
import { isModerator, isSignedIn, me } from "@/me";
import { getInstanceInfo } from "@/instance";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const emit = defineEmits<{
	(ev: "loaded"): void;
	(ev: "parent-focus", direction: "up" | "down" | "left" | "right"): void;
}>();

const disabled = ref(false);
const indicated = ref(false);
const columnActive = ref(true);

const {
	disableLocalTimeline,
	disableRecommendedTimeline,
	disableGlobalTimeline,
} = getInstanceInfo();

onMounted(() => {
	if (props.column.tl == null) {
		setType();
	} else if (isSignedIn(me)) {
		disabled.value =
			!isModerator &&
			((disableLocalTimeline &&
				["local", "social"].includes(props.column.tl)) ||
				(disableRecommendedTimeline &&
					["recommended"].includes(props.column.tl)) ||
				(disableGlobalTimeline && ["global"].includes(props.column.tl)));
	}
});

async function setType() {
	const { canceled, result: src } = await os.select({
		title: i18n.ts.timeline,
		items: [
			{
				value: "home" as const,
				text: i18n.ts._timelines.home,
			},
			{
				value: "local" as const,
				text: i18n.ts._timelines.local,
			},
			{
				value: "recommended" as const,
				text: i18n.ts._timelines.recommended,
			},
			{
				value: "social" as const,
				text: i18n.ts._timelines.social,
			},
			{
				value: "global" as const,
				text: i18n.ts._timelines.global,
			},
		],
	});
	if (canceled) {
		if (props.column.tl == null) {
			removeColumn(props.column.id);
		}
		return;
	}
	updateColumn(props.column.id, {
		tl: src,
	});
}

function queueUpdated(q) {
	if (columnActive.value) {
		indicated.value = q !== 0;
	}
}

function onNote() {
	if (!columnActive.value) {
		indicated.value = true;
	}
}

function onChangeActiveState(state) {
	columnActive.value = state;

	if (columnActive.value) {
		indicated.value = false;
	}
}

const menu = [
	{
		icon: `${icon("ph-pencil")}`,
		text: i18n.ts.timeline,
		action: setType,
	},
];
</script>

<style lang="scss" scoped>
.iwaalbte {
	text-align: center;

	> p {
		margin: 16px;

		&.desc {
			font-size: 14px;
		}
	}
}
</style>
