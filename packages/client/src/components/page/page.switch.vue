<template>
	<div class="hkcxmtwj">
		<MkSwitch
			:model-value="value"
			@update:modelValue="updateValue($event)"
			>{{ hpml.interpolate(block.text) }}</MkSwitch
		>
	</div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import MkSwitch from "../form/switch.vue";
import type { Hpml } from "@/scripts/hpml/evaluator";
import type { SwitchVarBlock } from "@/scripts/hpml/block";

export default defineComponent({
	components: {
		MkSwitch,
	},
	props: {
		block: {
			type: Object as PropType<SwitchVarBlock>,
			required: true,
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true,
		},
	},
	setup(props, ctx) {
		const value = computed(() => {
			return props.hpml.vars.value[props.block.name];
		});

		function updateValue(newValue: boolean) {
			props.hpml.updatePageVar(props.block.name, newValue);
			props.hpml.eval();
		}

		return {
			value,
			updateValue,
		};
	},
});
</script>

<style lang="scss" scoped>
.hkcxmtwj {
	display: inline-block;
	margin-block: 16px;
	margin-inline: auto;

	& + .hkcxmtwj {
		margin-inline-start: 16px;
	}
}
</style>
