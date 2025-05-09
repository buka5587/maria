<template>
	<form class="mk-setup" @submit.prevent="submit()">
		<h1>Welcome to Maria!</h1>
		<div class="_formRoot">
			<p>{{ i18n.ts.intro }}</p>
			<MkInput
				v-model="username"
				pattern="^[a-zA-Z0-9_]{1,20}$"
				:spellcheck="false"
				required
				data-cy-admin-username
				class="_formBlock"
			>
				<template #label>{{ i18n.ts.username }}</template>
				<template #prefix>@</template>
				<template #suffix>@{{ host }}</template>
			</MkInput>
			<MkInput
				v-model="password"
				type="password"
				data-cy-admin-password
				class="_formBlock"
			>
				<template #label>{{ i18n.ts.password }}</template>
				<template #prefix><i :class="icon('ph-lock')"></i></template>
			</MkInput>
			<div class="bottom _formBlock">
				<MkButton
					gradate
					type="submit"
					:disabled="submitting"
					data-cy-admin-ok
				>
					{{ submitting ? i18n.ts.processing : i18n.ts.done
					}}<MkEllipsis v-if="submitting" />
				</MkButton>
			</div>
		</div>
	</form>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import { host } from "@/config";
import * as os from "@/os";
import { signIn } from "@/account";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const username = ref("");
const password = ref("");
const submitting = ref(false);

function submit() {
	if (submitting.value) return;
	submitting.value = true;
	os.api("admin/accounts/create", {
		username: username.value,
		password: password.value,
	})
		.then((res) => {
			os.api("admin/accounts/hosted").then((res) => {
				if (res != null && res === true) {
					os.alert({
						type: "success",
						title: "Thank you!",
						text: "Your hosting provider has set your settings for you. Enjoy your new instance!",
					});
				}
			});
			return signIn(res?.token);
		})
		.catch(() => {
			submitting.value = false;
			os.alert({
				type: "error",
				text: i18n.ts.somethingHappened,
			});
		});
}
</script>

<style lang="scss" scoped>
.mk-setup {
	border-radius: var(--radius);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	max-inline-size: 500px;
	margin-block: 32px;
	margin-inline: auto;

	> h1 {
		margin: 0;
		font-size: 1.5em;
		text-align: center;
		padding: 32px;
		background: var(--accent);
		color: #fff;
	}

	> div {
		padding: 32px;
		background: var(--panel);

		> p {
			margin-block-start: 0;
		}

		> .bottom {
			> * {
				margin-block: 0;
				margin-inline: auto;
			}
		}
	}
}
</style>
