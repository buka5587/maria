<template>
	<div class="_formRoot">
		<FormInfo warn class="_formBlock">{{
			i18n.ts._accountDelete.mayTakeTime
		}}</FormInfo>
		<FormInfo class="_formBlock">{{
			i18n.ts._accountDelete.sendEmail
		}}</FormInfo>
		<FormButton
			v-if="!me!.isDeleted"
			danger
			class="_formBlock"
			@click="deleteAccount"
			>{{ i18n.ts._accountDelete.requestAccountDelete }}</FormButton
		>
		<FormButton v-else disabled>{{
			i18n.ts._accountDelete.inProgress
		}}</FormButton>
	</div>
</template>

<script lang="ts" setup>
import FormInfo from "@/components/MkInfo.vue";
import FormButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { signOut } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";
import { me } from "@/me";

async function deleteAccount() {
	{
		const { canceled } = await os.confirm({
			type: "warning",
			text: i18n.ts.deleteAccountConfirm,
		});
		if (canceled) return;
	}

	const { canceled, result: password } = await os.inputText({
		title: i18n.ts.password,
		type: "password",
	});
	if (canceled) return;

	await os.apiWithDialog("i/delete-account", {
		password,
	});

	await os.alert({
		title: i18n.ts._accountDelete.started,
	});

	await signOut();
}

definePageMetadata({
	title: i18n.ts._accountDelete.accountDelete,
	icon: `${icon("ph-warning")}`,
});
</script>
