<template>
	<div class="_formRoot">
		<FormSection style="border: none !important">
			<template #label>{{ i18n.ts.password }}</template>
			<MkButton primary @click="change()">{{
				i18n.ts.changePassword
			}}</MkButton>
		</FormSection>

		<X2fa />

		<FormSection>
			<template #label>{{ i18n.ts.signinHistory }}</template>
			<MkPagination :pagination="pagination" disable-auto-load>
				<template #default="{ items }">
					<div>
						<div
							v-for="item in items"
							:key="item.id"
							v-panel
							class="timnmucd"
						>
							<header>
								<i
									v-if="item.success"
									:class="icon('ph-check icon succ')"
								></i>
								<i
									v-else
									:class="
										icon('ph-circle-wavy-warning icon fail')
									"
								></i>
								<code class="ip _monospace">{{ item.ip }}</code>
								<MkTime :time="item.createdAt" class="time" />
							</header>
						</div>
					</div>
				</template>
			</MkPagination>
		</FormSection>

		<FormSection>
			<FormSlot>
				<MkButton danger @click="regenerateToken"
					><i :class="icon('ph-arrows-clockwise')"></i>
					{{ i18n.ts.regenerateLoginToken }}</MkButton
				>
				<template #caption>{{
					i18n.ts.regenerateLoginTokenDescription
				}}</template>
			</FormSlot>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import X2fa from "./2fa.vue";
import FormSection from "@/components/form/section.vue";
import FormSlot from "@/components/form/slot.vue";
import MkButton from "@/components/MkButton.vue";
import MkPagination from "@/components/MkPagination.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const pagination = {
	endpoint: "i/signin-history" as const,
	limit: 5,
};

async function change() {
	const { canceled: canceled1, result: currentPassword } = await os.inputText({
		title: i18n.ts.currentPassword,
		type: "password",
		autocomplete: "current-password",
	});
	if (canceled1) return;

	const { canceled: canceled2, result: newPassword } = await os.inputText({
		title: i18n.ts.newPassword,
		type: "password",
		autocomplete: "new-password",
	});
	if (canceled2) return;

	const { canceled: canceled3, result: newPassword2 } = await os.inputText({
		title: i18n.ts.newPasswordRetype,
		type: "password",
		autocomplete: "new-password",
	});
	if (canceled3) return;

	if (newPassword !== newPassword2) {
		os.alert({
			type: "error",
			text: i18n.ts.retypedNotMatch,
		});
		return;
	}

	os.apiWithDialog("i/change-password", {
		currentPassword,
		newPassword,
	});
}

function regenerateToken() {
	os.inputText({
		title: i18n.ts.password,
		type: "password",
	}).then(({ canceled, result: password }) => {
		if (canceled) return;
		os.api("i/regenerate-token", {
			password,
		});
	});
}

definePageMetadata({
	title: i18n.ts.security,
	icon: `${icon("ph-lock")}`,
});
</script>

<style lang="scss" scoped>
.timnmucd {
	padding: 12px;

	&:first-child {
		border-start-start-radius: 6px;
		border-start-end-radius: 6px;
	}

	&:last-child {
		border-end-start-radius: 6px;
		border-end-end-radius: 6px;
	}

	&:not(:last-child) {
		border-block-end: solid 0.5px var(--divider);
	}

	> header {
		display: flex;
		align-items: center;

		> .icon {
			inline-size: 1em;
			margin-inline-end: 0.75em;

			&.succ {
				color: var(--success);
			}

			&.fail {
				color: var(--error);
			}
		}

		> .ip {
			flex: 1;
			min-inline-size: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-inline-end: 12px;
		}

		> .time {
			margin-inline-start: auto;
			opacity: 0.7;
		}
	}
}
</style>
