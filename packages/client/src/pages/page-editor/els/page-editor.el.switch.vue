<template>
	<XContainer :draggable="true" @remove="() => $emit('remove')">
		<template #header
			><i :class="icon('ph-lightning')"></i>
			{{ i18n.ts._pages.blocks.switch }}</template
		>

		<section class="kjuadyyj">
			<MkInput v-model="value.name"
				><template #prefix
					><i :class="icon('ph-magic-wand')"></i></template
				><template #label>{{
					i18n.ts._pages.blocks._switch.name
				}}</template></MkInput
			>
			<MkInput v-model="value.text"
				><template #label>{{
					i18n.ts._pages.blocks._switch.text
				}}</template></MkInput
			>
			<MkSwitch v-model="value.default"
				><span>{{
					i18n.ts._pages.blocks._switch.default
				}}</span></MkSwitch
			>
		</section>
	</XContainer>
</template>

<script lang="ts" setup>
import XContainer from "../page-editor.container.vue";
import MkSwitch from "@/components/form/switch.vue";
import MkInput from "@/components/form/input.vue";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

withDefaults(
	defineProps<{
		value: any;
	}>(),
	{
		value: {
			name: "",
		},
	},
);
</script>

<style lang="scss" scoped>
.kjuadyyj {
	padding-block-start: 0;
	padding-inline-end: 16px;
	padding-block-end: 16px;
	padding-inline-start: 16px;
}
</style>
