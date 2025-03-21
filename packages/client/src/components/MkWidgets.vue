<template>
	<div class="vjoppmmu">
		<template v-if="edit">
			<header v-focus tabindex="-1">
				<MkSelect
					v-model="widgetAdderSelected"
					style="margin-block-end: var(--margin)"
					class="mk-widget-select"
				>
					<template #label>{{ i18n.ts.selectWidget }}</template>
					<option
						v-for="widget in sortedWidgets"
						:key="widget"
						:value="widget"
					>
						{{ i18n.t(`_widgets.${widget}`) }}
					</option>
				</MkSelect>
				<MkButton
					inline
					primary
					class="mk-widget-add"
					@click="addWidget"
					><i :class="icon('ph-plus')"></i>
					{{ i18n.ts.add }}</MkButton
				>
				<MkButton inline @click="$emit('exit')">{{
					i18n.ts.close
				}}</MkButton>
			</header>
			<VueDraggable v-model="widgets_" handle=".handle" :animation="150">
				<div v-for="element in widgets_" :key="element.id">
					<div class="customize-container">
						<button
							class="config _button"
							@click.prevent.stop="configWidget(element.id)"
						>
							<i :class="icon('ph-gear-six')"></i>
						</button>
						<button
							class="remove _button"
							:aria-label="i18n.ts.close"
							@click.prevent.stop="removeWidget(element)"
						>
							<i :class="icon('ph-x')"></i>
						</button>
						<div class="handle">
							<component
								:is="`mkw-${element.name}`"
								:ref="(el) => (widgetRefs[element.id] = el)"
								class="widget"
								:widget="element"
								@updateProps="updateWidget(element.id, $event)"
							/>
						</div>
					</div>
				</div>
			</VueDraggable>
		</template>
		<component
			:is="`mkw-${widget.name}`"
			v-for="widget in widgets"
			v-else
			:key="widget.id"
			:ref="(el) => (widgetRefs[widget.id] = el)"
			class="widget"
			:widget="widget"
			@updateProps="updateWidget(widget.id, $event)"
			@contextmenu.stop="onContextmenu(widget, $event)"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { v4 as uuid } from "uuid";
import { VueDraggable } from "vue-draggable-plus";
import MkSelect from "@/components/form/select.vue";
import MkButton from "@/components/MkButton.vue";
import { widgets as widgetDefs } from "@/widgets";
import * as os from "@/os";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

interface Widget {
	name: string;
	id: string;
	data: Record<string, unknown>;
}

const props = defineProps<{
	widgets: Widget[];
	edit: boolean;
}>();

const emit = defineEmits<{
	(ev: "updateWidgets", widgets: Widget[]): void;
	(ev: "addWidget", widget: Widget): void;
	(ev: "removeWidget", widget: Widget): void;
	(ev: "updateWidget", widget: Partial<Widget>): void;
	(ev: "exit"): void;
}>();

const sortedWidgets = computed(() =>
	widgetDefs.sort((a, b) =>
		i18n.t(`_widgets.${a}`).localeCompare(i18n.t(`_widgets.${b}`)),
	),
);

const widgetRefs = {};
const configWidget = (id: string) => {
	widgetRefs[id].configure();
};
const widgetAdderSelected = ref(null);
const addWidget = () => {
	if (widgetAdderSelected.value == null) return;

	emit("addWidget", {
		name: widgetAdderSelected.value,
		id: uuid(),
		data: {},
	});

	widgetAdderSelected.value = null;
};
const removeWidget = (widget) => {
	emit("removeWidget", widget);
};
const updateWidget = (id, data) => {
	emit("updateWidget", { id, data });
};
const widgets_ = computed({
	get: () => props.widgets,
	set: (value) => {
		emit("updateWidgets", value);
	},
});

function onContextmenu(widget: Widget, ev: MouseEvent) {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target as HTMLElement)) return;
	if (
		["INPUT", "TEXTAREA", "IMG", "VIDEO", "CANVAS"].includes(
			(ev.target as HTMLElement).tagName,
		) ||
		(ev.target as HTMLElement).getAttribute("contentEditable")
	)
		return;
	if (window.getSelection()?.toString() !== "") return;

	os.contextMenu(
		[
			{
				type: "label",
				text: i18n.t(`_widgets.${widget.name}`),
			},
			{
				icon: `${icon("ph-gear-six")}`,
				text: i18n.ts.settings,
				action: () => {
					configWidget(widget.id);
				},
			},
		],
		ev,
	);
}
</script>

<style lang="scss" scoped>
.vjoppmmu {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	> header {
		margin-block: 16px;
		margin-inline: 0;

		> * {
			inline-size: 100%;
			padding: 4px;
		}
	}

	> .widget,
	.customize-container {
		contain: content;
		margin-block-end: var(--margin);

		&:first-of-type {
			margin-block-start: 0;
		}
	}

	.customize-container {
		position: relative;
		cursor: move;

		> .config,
		> .remove {
			position: absolute;
			z-index: 10000;
			inset-block-start: 8px;
			inline-size: 32px;
			block-size: 32px;
			color: #fff;
			background: rgba(#000, 0.7);
			border-radius: 4px;
		}

		> .config {
			inset-inline-end: 8px + 8px + 32px;
		}

		> .remove {
			inset-inline-end: 8px;
		}

		> .handle {
			> .widget {
				pointer-events: none;
			}
		}
	}
}
</style>
