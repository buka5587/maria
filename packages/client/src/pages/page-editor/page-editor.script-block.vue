<template>
	<XContainer
		:removable="removable"
		:error="error"
		:warn="warn"
		:draggable="draggable"
		@remove="() => $emit('remove')"
	>
		<template #header
			><i v-if="icon" :class="icon"></i>
			<template v-if="title"
				>{{ title }}
				<span v-if="typeText" class="turmquns"
					>({{ typeText }})</span
				></template
			><template v-else-if="typeText">{{ typeText }}</template></template
		>
		<template #func>
			<button class="_button" @click="changeType()">
				<i :class="iconify('ph-pencil')"></i>
			</button>
		</template>

		<section
			v-if="modelValue.type === null"
			class="pbglfege"
			@click="changeType()"
		>
			{{ i18n.ts._pages.script.emptySlot }}
		</section>
		<section v-else-if="modelValue.type === 'text'" class="tbwccoaw">
			<input v-model="modelValue.value" />
		</section>
		<section
			v-else-if="modelValue.type === 'multiLineText'"
			class="tbwccoaw"
		>
			<textarea v-model="modelValue.value"></textarea>
		</section>
		<section v-else-if="modelValue.type === 'textList'" class="tbwccoaw">
			<textarea
				v-model="modelValue.value"
				:placeholder="i18n.ts._pages.script.blocks._textList.info"
			></textarea>
		</section>
		<section v-else-if="modelValue.type === 'number'" class="tbwccoaw">
			<input v-model="modelValue.value" type="number" />
		</section>
		<section v-else-if="modelValue.type === 'ref'" class="hpdwcrvs">
			<select v-model="modelValue.value">
				<option
					v-for="v in hpml
						.getVarsByType(
							getExpectedType ? getExpectedType() : null,
						)
						.filter((x) => x.name !== name)"
					:value="v.name"
				>
					{{ v.name }}
				</option>
				<optgroup :label="i18n.ts._pages.script.argVariables">
					<option v-for="v in fnSlots" :value="v.name">
						{{ v.name }}
					</option>
				</optgroup>
				<optgroup :label="i18n.ts._pages.script.pageVariables">
					<option
						v-for="v in hpml.getPageVarsByType(
							getExpectedType ? getExpectedType() : null,
						)"
						:value="v"
					>
						{{ v }}
					</option>
				</optgroup>
				<optgroup :label="i18n.ts._pages.script.enviromentVariables">
					<option
						v-for="v in hpml.getEnvVarsByType(
							getExpectedType ? getExpectedType() : null,
						)"
						:value="v"
					>
						{{ v }}
					</option>
				</optgroup>
			</select>
		</section>
		<section v-else-if="modelValue.type === 'aiScriptVar'" class="tbwccoaw">
			<input v-model="modelValue.value" />
		</section>
		<section
			v-else-if="modelValue.type === 'fn'"
			class=""
			style="padding: 0 16px 16px 16px"
		>
			<MkTextarea v-model="slots">
				<template #label>{{
					i18n.ts._pages.script.blocks._fn.slots
				}}</template>
				<template #caption>{{
					i18n.t("_pages.script.blocks._fn.slots-info")
				}}</template>
			</MkTextarea>
			<XV
				v-if="modelValue.value.expression"
				v-model="modelValue.value.expression"
				:title="i18n.ts._pages.script.blocks._fn.arg1"
				:get-expected-type="() => null"
				:hpml="hpml"
				:fn-slots="modelValue.value.slots"
				:name="name"
			/>
		</section>
		<section
			v-else-if="modelValue.type.startsWith('fn:')"
			class=""
			style="padding: 16px"
		>
			<XV
				v-for="(x, i) in modelValue.args"
				:key="i"
				v-model="modelValue.args[i]"
				:title="
					hpml.getVarByName(modelValue.type.split(':')[1]).value
						.slots[i].name
				"
				:get-expected-type="() => null"
				:hpml="hpml"
				:name="name"
			/>
		</section>
		<section v-else class="" style="padding: 16px">
			<XV
				v-for="(x, i) in modelValue.args"
				:key="i"
				v-model="modelValue.args[i]"
				:title="
					i18n.t(
						`_pages.script.blocks._${modelValue.type}.arg${i + 1}`,
					)
				"
				:get-expected-type="() => _getExpectedType(i)"
				:hpml="hpml"
				:name="name"
				:fn-slots="fnSlots"
			/>
		</section>
	</XContainer>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import { v4 as uuid } from "uuid";
import XContainer from "./page-editor.container.vue";
import MkTextarea from "@/components/form/textarea.vue";
import { blockDefs } from "@/scripts/hpml/index";
import * as os from "@/os";
import { isLiteralValue } from "@/scripts/hpml/expr";
import { funcDefs } from "@/scripts/hpml/lib";
import { i18n } from "@/i18n";
import iconify from "@/scripts/icon";

export default defineComponent({
	components: {
		XContainer,
		MkTextarea,
		XV: defineAsyncComponent(() => import("./page-editor.script-block.vue")),
	},

	inject: ["getScriptBlockList"],

	props: {
		getExpectedType: {
			required: false,
			default: null,
		},
		modelValue: {
			required: true,
		},
		title: {
			required: false,
		},
		removable: {
			required: false,
			default: false,
		},
		hpml: {
			required: true,
		},
		name: {
			required: true,
		},
		fnSlots: {
			required: false,
		},
		draggable: {
			required: false,
			default: false,
		},
	},

	data() {
		return {
			error: null,
			warn: null,
			slots: "",
			i18n,
			iconify,
		};
	},

	computed: {
		icon(): any {
			if (this.modelValue.type === null) return null;
			if (this.modelValue.type.startsWith("fn:")) return "ph-plug ph-lg";
			return blockDefs.find((x) => x.type === this.modelValue.type).icon;
		},
		typeText(): any {
			if (this.modelValue.type === null) return null;
			if (this.modelValue.type.startsWith("fn:"))
				return this.modelValue.type.split(":")[1];
			return i18n.t(`_pages.script.blocks.${this.modelValue.type}`);
		},
	},

	watch: {
		slots: {
			handler() {
				this.modelValue.value.slots = this.slots.split("\n").map((x) => ({
					name: x,
					type: null,
				}));
			},
			deep: true,
		},
	},

	created() {
		if (this.modelValue.value == null) this.modelValue.value = null;

		if (this.modelValue.value && this.modelValue.value.slots)
			this.slots = this.modelValue.value.slots.map((x) => x.name).join("\n");

		this.$watch(
			() => this.modelValue.type,
			(t) => {
				this.warn = null;

				if (this.modelValue.type === "fn") {
					const id = uuid();
					this.modelValue.value = {
						slots: [],
						expression: { id, type: null },
					};
					return;
				}

				if (this.modelValue.type && this.modelValue.type.startsWith("fn:")) {
					const fnName = this.modelValue.type.split(":")[1];
					const fn = this.hpml.getVarByName(fnName);

					const empties = [];
					for (let i = 0; i < fn.value.slots.length; i++) {
						const id = uuid();
						empties.push({ id, type: null });
					}
					this.modelValue.args = empties;
					return;
				}

				if (isLiteralValue(this.modelValue)) return;

				const empties = [];
				for (let i = 0; i < funcDefs[this.modelValue.type].in.length; i++) {
					const id = uuid();
					empties.push({ id, type: null });
				}
				this.modelValue.args = empties;

				for (let i = 0; i < funcDefs[this.modelValue.type].in.length; i++) {
					const inType = funcDefs[this.modelValue.type].in[i];
					if (typeof inType !== "number") {
						if (inType === "number") this.modelValue.args[i].type = "number";
						if (inType === "string") this.modelValue.args[i].type = "text";
					}
				}
			},
		);

		this.$watch(
			() => this.modelValue.args,
			(args) => {
				if (args == null) {
					this.warn = null;
					return;
				}
				const emptySlotIndex = args.findIndex((x) => x.type === null);
				if (emptySlotIndex !== -1 && emptySlotIndex < args.length) {
					this.warn = {
						slot: emptySlotIndex,
					};
				} else {
					this.warn = null;
				}
			},
			{
				deep: true,
			},
		);

		this.$watch(
			() => this.hpml.variables,
			() => {
				if (this.type != null && this.modelValue) {
					this.error = this.hpml.typeCheck(this.modelValue);
				}
			},
			{
				deep: true,
			},
		);
	},

	methods: {
		async changeType() {
			const { canceled, result: type } = await os.select({
				title: i18n.ts._pages.selectType,
				groupedItems: this.getScriptBlockList(
					this.getExpectedType ? this.getExpectedType() : null,
				),
			});
			if (canceled) return;
			this.modelValue.type = type;
		},

		_getExpectedType(slot: number) {
			return this.hpml.getExpectedType(this.modelValue, slot);
		},
	},
});
</script>

<style lang="scss" scoped>
.turmquns {
	opacity: 0.7;
}

.pbglfege {
	opacity: 0.5;
	padding: 16px;
	text-align: center;
	cursor: pointer;
	color: var(--fg);
}

.tbwccoaw {
	> input,
	> textarea {
		display: block;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		inline-size: 100%;
		max-inline-size: 100%;
		min-inline-size: 100%;
		border: none;
		box-shadow: none;
		padding: 16px;
		font-size: 16px;
		background: transparent;
		color: var(--fg);
		box-sizing: border-box;
	}

	> textarea {
		min-block-size: 100px;
	}
}

.hpdwcrvs {
	padding: 16px;

	> select {
		display: block;
		padding: 4px;
		font-size: 16px;
		inline-size: 100%;
	}
}
</style>
