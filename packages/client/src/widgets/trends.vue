<template>
	<MkContainer :show-header="widgetProps.showHeader" class="mkw-trends">
		<template #header
			><i :class="icon('ph-hash')"></i
			>{{ i18n.ts._widgets.trends }}</template
		>

		<div class="wbrkwala">
			<MkLoading v-if="fetching" />
			<transition-group
				v-else
				tag="div"
				:name="defaultStore.state.animation ? 'chart' : ''"
				class="tags"
			>
				<div v-for="stat in stats" :key="stat.tag">
					<div class="tag">
						<MkA
							class="a"
							:to="`/tags/${encodeURIComponent(stat.tag)}`"
							:title="stat.tag"
							>#{{ stat.tag }}</MkA
						>
						<p>
							{{
								i18n.t("nUsersMentioned", {
									n: stat.usersCount,
								})
							}}
						</p>
					</div>
					<MkMiniChart class="chart" :src="stat.chart" />
				</div>
			</transition-group>
		</div>
	</MkContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type {
	WidgetComponentExpose,
	WidgetComponentProps,
	WidgetComponentEmits,
} from "./widget";
import { useWidgetPropsManager } from "./widget";
import type { GetFormResultType } from "@/scripts/form";
import MkContainer from "@/components/MkContainer.vue";
import MkMiniChart from "@/components/MkMiniChart.vue";
import * as os from "@/os";
import { useInterval } from "@/scripts/use-interval";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const name = "hashtags";

const widgetPropsDef = {
	showHeader: {
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

const stats = ref([]);
const fetching = ref(true);

const fetch = () => {
	os.api("hashtags/trend").then((res) => {
		stats.value = res;
		fetching.value = false;
	});
};

useInterval(fetch, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" scoped>
.wbrkwala {
	block-size: (62px + 1px) + (62px + 1px) + (62px + 1px) + (62px + 1px) + 62px;
	overflow: hidden;

	> .tags {
		.chart-move {
			transition: transform 1s ease;
		}

		> div {
			display: flex;
			align-items: center;
			padding-block: 14px;
			padding-inline: 16px;
			border-block-end: solid 0.5px var(--divider);

			> .tag {
				flex: 1;
				overflow: hidden;
				font-size: 0.9em;
				color: var(--fg);

				> .a {
					display: block;
					inline-size: 100%;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: 18px;
				}

				> p {
					margin: 0;
					font-size: 75%;
					opacity: 0.7;
					line-height: 16px;
				}
			}

			> .chart {
				block-size: 30px;
			}
		}
	}
}
</style>
