<template>
	<div :class="$style.root">
		<div class="_table status">
			<div class="_row">
				<div class="_cell" style="text-align: center">
					<div class="_label">Process</div>
					{{ number(activeSincePrevTick) }}
				</div>
				<div class="_cell" style="text-align: center">
					<div class="_label">Active</div>
					{{ number(active) }}
				</div>
				<div class="_cell" style="text-align: center">
					<div class="_label">Waiting</div>
					{{ number(waiting) }}
				</div>
				<div class="_cell" style="text-align: center">
					<div class="_label">Delayed</div>
					{{ number(delayed) }}
				</div>
			</div>
		</div>
		<div class="charts">
			<div class="chart">
				<div class="title">Process</div>
				<XChart ref="chartProcess" type="process" />
			</div>
			<div class="chart">
				<div class="title">Active</div>
				<XChart ref="chartActive" type="active" />
			</div>
			<div class="chart">
				<div class="title">Delayed</div>
				<XChart ref="chartDelayed" type="delayed" />
			</div>
			<div class="chart">
				<div class="title">Waiting</div>
				<XChart ref="chartWaiting" type="waiting" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { markRaw, onMounted, onUnmounted, ref, shallowRef } from "vue";
import XChart from "./overview.queue.chart.vue";
import number from "@/filters/number";
import { useStream } from "@/stream";

const stream = useStream();
const connection = markRaw(stream.useChannel("queueStats"));

const activeSincePrevTick = ref(0);
const active = ref(0);
const delayed = ref(0);
const waiting = ref(0);
const chartProcess = shallowRef<InstanceType<typeof XChart>>();
const chartActive = shallowRef<InstanceType<typeof XChart>>();
const chartDelayed = shallowRef<InstanceType<typeof XChart>>();
const chartWaiting = shallowRef<InstanceType<typeof XChart>>();

const props = defineProps<{
	domain: string;
}>();

const onStats = (stats) => {
	activeSincePrevTick.value = stats[props.domain].activeSincePrevTick;
	active.value = stats[props.domain].active;
	delayed.value = stats[props.domain].delayed;
	waiting.value = stats[props.domain].waiting;

	chartProcess.value?.pushData(stats[props.domain].activeSincePrevTick);
	chartActive.value?.pushData(stats[props.domain].active);
	chartDelayed.value?.pushData(stats[props.domain].delayed);
	chartWaiting.value?.pushData(stats[props.domain].waiting);
};

const onStatsLog = (statsLog) => {
	const dataProcess = [];
	const dataActive = [];
	const dataDelayed = [];
	const dataWaiting = [];

	for (const stats of [...statsLog].reverse()) {
		dataProcess.push(stats[props.domain].activeSincePrevTick);
		dataActive.push(stats[props.domain].active);
		dataDelayed.push(stats[props.domain].delayed);
		dataWaiting.push(stats[props.domain].waiting);
	}

	chartProcess.value?.setData(dataProcess);
	chartActive.value?.setData(dataActive);
	chartDelayed.value?.setData(dataDelayed);
	chartWaiting.value?.setData(dataWaiting);
};

onMounted(() => {
	connection.on("stats", onStats);
	connection.on("statsLog", onStatsLog);
	connection.send("requestLog", {
		id: Math.random().toString().substring(2, 10),
		length: 100,
	});
});

onUnmounted(() => {
	connection.off("stats", onStats);
	connection.off("statsLog", onStatsLog);
	connection.dispose();
});
</script>

<style lang="scss" module>
.root {
	&:global {
		> .status {
			padding-block-start: 0;
			padding-inline-end: 0;
			padding-block-end: 16px;
			padding-inline-start: 0;
		}

		> .charts {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 12px;

			> .chart {
				min-inline-size: 0;
				padding: 16px;
				background: var(--panel);
				border-radius: var(--radius);

				> .title {
					font-size: 0.85em;
				}
			}
		}
	}
}
</style>
