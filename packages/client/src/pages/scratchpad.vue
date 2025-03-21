<template>
	<div class="iltifgqe">
		<div class="editor _panel _gap">
			<PrismEditor
				v-model="code"
				class="_code code"
				style="block-size: 30vb"
				:highlight="highlighter"
				:line-numbers="false"
			/>
			<MkButton
				style="position: absolute; inset-block-start: 8px; right: 8px"
				primary
				@click="run()"
				><i :class="icon('ph-play')"></i
			></MkButton>
		</div>

		<MkContainer :foldable="true" class="_gap">
			<template #header>{{ i18n.ts.output }}</template>
			<div class="bepmlvbi">
				<div
					v-for="log in logs"
					:key="log.id"
					class="log"
					:class="{ print: log.print }"
				>
					{{ log.text }}
				</div>
			</div>
		</MkContainer>

		<div class="_gap">
			{{ i18n.ts.scratchpadDescription }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { Interpreter, Parser, utils } from "@syuilo/aiscript";
import MkContainer from "@/components/MkContainer.vue";
import MkButton from "@/components/MkButton.vue";
import { createAiScriptEnv } from "@/scripts/aiscript/api";
import * as os from "@/os";
import { me } from "@/me";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const code = ref("");
const logs = ref<any[]>([]);

const parser = new Parser();

const saved = localStorage.getItem("scratchpad");
if (saved) {
	code.value = saved;
}

watch(code, () => {
	localStorage.setItem("scratchpad", code.value);
});

async function run() {
	logs.value = [];
	const aiscript = new Interpreter(
		createAiScriptEnv({
			storageKey: "scratchpad",
			token: me?.token,
		}),
		{
			in: (q) => {
				return new Promise((ok) => {
					os.inputText({
						title: q,
					}).then(({ canceled, result: a }) => {
						ok(a);
					});
				});
			},
			out: (value) => {
				logs.value.push({
					id: Math.random(),
					text: value.type === "str" ? value.value : utils.valToString(value),
					print: true,
				});
			},
			log: (type, params) => {
				switch (type) {
					case "end":
						logs.value.push({
							id: Math.random(),
							text: utils.valToString(params.val, true),
							print: false,
						});
						break;
					default:
						break;
				}
			},
		},
	);

	let ast;
	try {
		ast = parser.parse(code.value);
	} catch (error) {
		os.alert({
			type: "error",
			text: `Syntax error : ${error}`,
		});
		return;
	}
	try {
		await aiscript.exec(ast);
	} catch (error: any) {
		os.alert({
			type: "error",
			text: error.message,
		});
	}
}

function highlighter(code) {
	return highlight(code, languages.js, "javascript");
}

definePageMetadata({
	title: i18n.ts.scratchpad,
	icon: `${icon("ph-terminal-window")}`,
});
</script>

<style lang="scss" scoped>
.iltifgqe {
	padding: 16px;

	> .editor {
		position: relative;
	}
}

.bepmlvbi {
	padding: 16px;

	> .log {
		&:not(.print) {
			opacity: 0.7;
		}
	}
}
</style>
