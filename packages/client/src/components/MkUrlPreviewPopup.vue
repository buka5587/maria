<template>
	<div
		class="fgmtyycl"
		:style="{ zIndex, top: top + 'px', left: left + 'px' }"
	>
		<transition
			:name="defaultStore.state.animation ? 'zoom' : ''"
			@after-leave="emit('closed')"
		>
			<MkUrlPreview v-if="showing" class="_popup _shadow" :url="url" />
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import * as os from "@/os";
import { defaultStore } from "@/store";

const props = defineProps<{
	showing: boolean;
	url: string;
	source: HTMLElement;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

const zIndex = os.claimZIndex("middle");
const top = ref(0);
const left = ref(0);

onMounted(() => {
	const rect = props.source.getBoundingClientRect();
	const x =
		Math.max(rect.left + props.source.offsetWidth / 2 - 300 / 2, 6) +
		window.scrollX;
	const y = rect.top + props.source.offsetHeight + window.scrollY;

	top.value = y;
	left.value = x;
});
</script>

<style lang="scss" scoped>
.fgmtyycl {
	position: absolute;
	inline-size: 500px;
	max-inline-size: calc(90vi - 12px);
	pointer-events: none;
}
</style>
