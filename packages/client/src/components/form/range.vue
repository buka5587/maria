<template>
	<label class="timctyfi" :class="{ disabled, easing }">
		<div class="label"><slot name="label"></slot></div>
		<div v-adaptive-border class="body" :class="{ background }">
			<div class="container">
				<input
					ref="inputEl"
					type="range"
					:min="min"
					:max="max"
					:step="step"
					:list="id"
					:value="modelValue"
					:disabled="disabled"
					@change="(x) => onChange(x)"
					@focus="tooltipShow"
					@blur="tooltipHide"
					@touchstart="tooltipShow"
					@touchend="tooltipHide"
					@mouseenter="tooltipShow"
					@mouseleave="tooltipHide"
					@input="
						(x) => {
							inputVal = Number((x.target as HTMLInputElement).value);
							if (instant) onChange(x);
						}
					"
				/>
				<datalist v-if="showTicks && steps" :id="id">
					<option
						v-for="i in steps"
						:key="`step-${i}`"
						:value="i + min"
						:label="(i + min).toString()"
					></option>
				</datalist>
			</div>
		</div>
		<div class="caption"><slot name="caption"></slot></div>
	</label>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from "vue";
import * as os from "@/os";

const id = os.getUniqueId();

const props = withDefaults(
	defineProps<{
		modelValue: number | null;
		disabled?: boolean;
		min: number;
		max: number;
		step?: number;
		textConverter?: (value: number) => string;
		showTicks?: boolean;
		easing?: boolean;
		background?: boolean;
		tooltips?: boolean;
		instant?: boolean;
	}>(),
	{
		step: 1,
		textConverter: (v) => v.toString(),
		easing: false,
		background: true,
		tooltips: true,
		instant: false,
	},
);

const inputEl = ref<HTMLInputElement>();
const inputVal = ref(props.modelValue);

const emit = defineEmits<{
	"update:modelValue": [value: number];
}>();

const steps = computed(() => {
	if (props.step) {
		return (props.max - props.min) / props.step;
	} else {
		return 0;
	}
});

function onChange(_x) {
	emit("update:modelValue", inputVal.value);
}

const tooltipShowing = ref(false);
function tooltipShow() {
	if (!props.tooltips) return;
	tooltipShowing.value = true;
	os.popup(
		defineAsyncComponent(() => import("@/components/MkTooltip.vue")),
		{
			showing: tooltipShowing,
			text: computed(() => {
				return props.textConverter(inputVal.value);
			}),
			targetElement: inputEl,
		},
		{},
		"closed",
	);
}
function tooltipHide() {
	if (!props.tooltips) return;
	tooltipShowing.value = false;
}
</script>

<style lang="scss" scoped>
@use "sass:math";

.timctyfi {
	position: relative;

	> .label {
		font-size: 0.85em;
		padding-block-start: 0;
		padding-inline-end: 0;
		padding-block-end: 8px;
		padding-inline-start: 0;
		user-select: none;

		&:empty {
			display: none;
		}
	}

	> .caption {
		font-size: 0.85em;
		padding-block-start: 8px;
		padding-inline-end: 0;
		padding-block-end: 0;
		padding-inline-start: 0;
		color: var(--fgTransparentWeak);

		&:empty {
			display: none;
		}
	}

	$thumbHeight: 20px;
	$thumbWidth: 20px;

	> .body {
		padding-block: 10px;
		padding-inline: 0;
		background: none;
		border: none;
		border-radius: 6px;

		&.background {
			padding-block: 10px;
			padding-inline: 12px;
			background: var(--panel);
			border: solid 1px var(--panel);
		}

		> .container {
			position: relative;
			display: flex;
			align-items: center;
			block-size: $thumbHeight;

			@mixin track {
				block-size: 3px;
				background: rgba(0, 0, 0, 0.1);
				border-radius: 999px;
			}

			@mixin fill {
				background-color: var(--accent);
			}

			@mixin thumb {
				inline-size: $thumbWidth;
				block-size: $thumbHeight;
				background: var(--accent);
				border-radius: 999px;

				&:hover {
					background: var(--accentLighten);
					cursor: pointer;
				}
			}
			> input {
				inline-size: 100%;
				background: none;

				&::-webkit-slider-runnable-track {
					@include track;
				}
				&::-moz-range-track {
					@include track;
				}
				&::-ms-track {
					@include track;
				}

				&::-moz-range-progress {
					@include fill;
				}
				&::-ms-fill-lower {
					@include fill;
				}

				&::-webkit-slider-thumb {
					margin-block-start: -6.5px;
					@include thumb;
				}
				&::-moz-range-thumb {
					@include thumb;
				}
				&::-ms-thumb {
					@include thumb;
				}
			}
		}
	}

	&.easing {
		> .body {
			> .container {
				> .track {
					> .highlight {
						transition: width 0.2s cubic-bezier(0, 0, 0, 1);
					}
				}

				> .thumb {
					transition: left 0.2s cubic-bezier(0, 0, 0, 1);
				}
			}
		}
	}
}
</style>
