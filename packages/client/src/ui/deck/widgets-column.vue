<template>
	<XColumn
		:menu="menu"
		:naked="true"
		:column="column"
		:is-stacked="isStacked"
		@parent-focus="($event) => emit('parent-focus', $event)"
	>
		<template #header
			><i :class="icon('ph-browser')" style="margin-inline-end: 8px"></i
			>{{ column.name }}</template
		>
		<div class="wtdtxvec">
			<MkAd class="a" :prefer="['widget']" />
			<div
				v-if="!(column.widgets && column.widgets.length > 0) && !edit"
				class="intro"
			>
				{{ i18n.ts._deck.widgetsIntroduction }}
			</div>
			<XWidgets
				:edit="edit"
				:widgets="column.widgets"
				@add-widget="addWidget"
				@remove-widget="removeWidget"
				@update-widget="updateWidget"
				@update-widgets="updateWidgets"
				@exit="edit = false"
			/>
		</div>
	</XColumn>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import XColumn from "./column.vue";
import type { Column } from "./deck-store";
import {
	addColumnWidget,
	removeColumnWidget,
	setColumnWidgets,
	updateColumnWidget,
} from "./deck-store";
import XWidgets from "@/components/MkWidgets.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const emit = defineEmits<{
	(ev: "parent-focus", direction: "up" | "down" | "left" | "right"): void;
}>();

const edit = ref(false);

function addWidget(widget) {
	addColumnWidget(props.column.id, widget);
}

function removeWidget(widget) {
	removeColumnWidget(props.column.id, widget);
}

function updateWidget({ id, data }) {
	updateColumnWidget(props.column.id, id, data);
}

function updateWidgets(widgets) {
	setColumnWidgets(props.column.id, widgets);
}

function func() {
	edit.value = !edit.value;
}

const menu = [
	{
		icon: `${icon("ph-pencil")}`,
		text: i18n.ts.editWidgets,
		action: func,
	},
];
</script>

<style lang="scss" scoped>
.wtdtxvec {
	--margin: 8px;
	--panelBorder: none;

	padding-block: 0;
	padding-inline: var(--margin);

	> .intro {
		padding: 16px;
		text-align: center;
	}
}
</style>
