<template>
	<div
		v-if="hpml"
		class="iroscrza"
		:class="{ center: page.alignCenter, serif: page.font === 'serif' }"
	>
		<XBlock
			v-for="child in page.content"
			:key="child.id"
			:block="child"
			:hpml="hpml"
			:h="2"
		/>
	</div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, nextTick, onMounted, onUnmounted } from "vue";
import { Parser } from "@syuilo/aiscript";
import XBlock from "./page.block.vue";
import { Hpml } from "@/scripts/hpml/evaluator";
import { url } from "@/config";
import { me } from "@/me";
import { defaultStore } from "@/store";

export default defineComponent({
	components: {
		XBlock,
	},
	props: {
		page: {
			type: Object as PropType<Record<string, any>>,
			required: true,
		},
	},
	setup(props, ctx) {
		const hpml = new Hpml(props.page, {
			randomSeed: Math.random(),
			visitor: me,
			url,
			enableAiScript: !defaultStore.state.disablePagesScript,
		});

		const parser = new Parser();

		onMounted(() => {
			nextTick(() => {
				if (props.page.script && hpml.aiscript) {
					let ast;
					try {
						ast = parser.parse(props.page.script);
					} catch (err) {
						console.error(err);
						/* os.alert({
							type: 'error',
							text: 'Syntax error :('
						}); */
						return;
					}
					hpml.aiscript
						.exec(ast)
						.then(() => {
							hpml.eval();
						})
						.catch((err) => {
							console.error(err);
							/* os.alert({
							type: 'error',
							text: err
						}); */
						});
				} else {
					hpml.eval();
				}
			});
			onUnmounted(() => {
				if (hpml.aiscript) hpml.aiscript.abort();
			});
		});

		return {
			hpml,
		};
	},
});
</script>

<style lang="scss" scoped>
.iroscrza {
	&.serif {
		> div {
			font-family: serif;
		}
	}

	&.center {
		text-align: center;
	}
}
</style>
