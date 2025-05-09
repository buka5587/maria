<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="900">
			<div class="uqshojas">
				<div v-for="ad in ads" class="_panel _formRoot ad">
					<MkAd v-if="ad.url" :specify="ad" />
					<MkInput v-model="ad.url" type="url" class="_formBlock">
						<template #label>URL</template>
					</MkInput>
					<MkInput v-model="ad.imageUrl" class="_formBlock">
						<template #label>{{ i18n.ts.imageUrl }}</template>
					</MkInput>
					<FormRadios v-model="ad.place" class="_formBlock">
						<template #label>Form</template>
						<option value="widget">widget</option>
						<option value="inline">inline</option>
						<option value="inline-big">inline-big</option>
					</FormRadios>
					<FormSplit>
						<MkInput
							v-model="ad.ratio"
							:disabled="ad.place === 'widget'"
							type="number"
						>
							<template #label>{{ i18n.ts.ratio }}</template>
						</MkInput>
						<MkInput v-model="ad.expiresAt" type="date">
							<template #label>{{ i18n.ts.expiration }}</template>
						</MkInput>
					</FormSplit>
					<MkTextarea v-model="ad.memo" class="_formBlock">
						<template #label>{{ i18n.ts.memo }}</template>
					</MkTextarea>
					<div class="buttons _formBlock">
						<MkButton
							class="button"
							inline
							primary
							style="margin-inline-end: 12px"
							@click="save(ad)"
							><i :class="icon('ph-floppy-disk-back')"></i>
							{{ i18n.ts.save }}</MkButton
						>
						<MkButton
							class="button"
							inline
							danger
							@click="remove(ad)"
							><i :class="icon('ph-trash')"></i>
							{{ i18n.ts.remove }}</MkButton
						>
					</div>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/form/input.vue";
import MkTextarea from "@/components/form/textarea.vue";
import FormRadios from "@/components/form/radios.vue";
import FormSplit from "@/components/form/split.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { formatDateTimeString } from "@/scripts/format-time-string";
import icon from "@/scripts/icon";

const ads = ref([]);

os.api("admin/ad/list").then((adsResponse) => {
	ads.value = adsResponse;
	// The date format should be changed to yyyy-MM-dd in order to be properly displayed
	for (const i in ads.value) {
		ads.value[i].expiresAt = ads.value[i].expiresAt.substring(0, 10);
	}
});

function add() {
	const tomorrow = formatDateTimeString(
		new Date(new Date().setDate(new Date().getDate() + 1)),
		"yyyy-MM-dd",
	);
	ads.value.unshift({
		id: null,
		memo: "",
		place: "widget",
		priority: "middle",
		ratio: 1,
		url: "",
		imageUrl: null,
		expiresAt: tomorrow,
	});
}

function remove(ad) {
	os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: ad.url }),
	}).then(({ canceled }) => {
		if (canceled) return;
		ads.value = ads.value.filter((x) => x !== ad);
		os.apiWithDialog("admin/ad/delete", {
			id: ad.id,
		});
	});
}

function save(ad) {
	if (ad.id == null) {
		os.apiWithDialog("admin/ad/create", {
			...ad,
			expiresAt: new Date(ad.expiresAt).getTime(),
		});
	} else {
		os.apiWithDialog("admin/ad/update", {
			...ad,
			expiresAt: new Date(ad.expiresAt).getTime(),
		});
	}
}

const headerActions = computed(() => [
	{
		asFullButton: true,
		icon: `${icon("ph-plus")}`,
		text: i18n.ts.add,
		handler: add,
	},
]);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.ads,
	icon: `${icon("ph-money")}`,
});
</script>

<style lang="scss" scoped>
.uqshojas {
	> .ad {
		padding: 32px;

		&:not(:last-child) {
			margin-block-end: var(--margin);
		}
	}
}
</style>
