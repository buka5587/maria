<template>
	<div
		class="mkw-unixClock _monospace"
		:class="{ _panel: !widgetProps.transparent }"
		:style="{ fontSize: `${widgetProps.fontSize}em` }"
	>
		<div v-if="widgetProps.showLabel" class="label">UNIX Epoch</div>
		<div class="time">
			<span v-text="ss"></span>
			<span v-if="widgetProps.showMs" class="colon" :class="{ showColon }"
				>:</span
			>
			<span v-if="widgetProps.showMs" v-text="ms"></span>
		</div>
		<div v-if="widgetProps.showLabel" class="label">UTC</div>
	</div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watch } from "vue";
import type {
	WidgetComponentExpose,
	WidgetComponentProps,
	WidgetComponentEmits,
} from "./widget";
import { useWidgetPropsManager } from "./widget";
import type { GetFormResultType } from "@/scripts/form";

const name = "unixClock";

const widgetPropsDef = {
	transparent: {
		type: "boolean" as const,
		default: false,
	},
	fontSize: {
		type: "number" as const,
		default: 1.5,
		step: 0.1,
	},
	showMs: {
		type: "boolean" as const,
		default: true,
	},
	showLabel: {
		type: "boolean" as const,
		default: true,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(
	name,
	widgetPropsDef,
	props,
	emit,
);

let intervalId;
const ss = ref("");
const ms = ref("");
const showColon = ref(false);
let prevSec: string | null = null;

watch(showColon, (v) => {
	if (v) {
		window.setTimeout(() => {
			showColon.value = false;
		}, 30);
	}
});

const tick = () => {
	const now = Date.now();
	ss.value = Math.floor(now / 1000).toString();
	ms.value = Math.floor((now % 1000) / 10)
		.toString()
		.padStart(2, "0");
	if (ss.value !== prevSec) showColon.value = true;
	prevSec = ss.value;
};

tick();

watch(
	() => widgetProps.showMs,
	() => {
		if (intervalId) window.clearInterval(intervalId);
		intervalId = window.setInterval(tick, widgetProps.showMs ? 10 : 1000);
	},
	{ immediate: true },
);

onUnmounted(() => {
	window.clearInterval(intervalId);
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" scoped>
.mkw-unixClock {
	padding-block: 16px;
	padding-inline: 0;
	text-align: center;

	> .label {
		font-size: 65%;
		opacity: 0.7;
	}

	> .time {
		> .colon {
			opacity: 0;
			transition: opacity 1s ease;

			&.showColon {
				opacity: 1;
				transition: opacity 0s;
			}
		}
	}
}
</style>
