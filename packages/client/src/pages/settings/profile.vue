<template>
	<div class="_formRoot">
		<div v-if="saveButton == true">
			<MkButton primary @click="save">{{ i18n.ts.save }}</MkButton>
		</div>
		<br />
		<div
			class="llvierxe"
			:style="{
				backgroundImage: me.bannerUrl ? `url(${me.bannerUrl})` : null,
			}"
		>
			<div class="avatar">
				<MkAvatar
					class="avatar"
					:user="me"
					:disable-link="true"
					@click="changeAvatar"
				/>
				<MkButton
					primary
					rounded
					class="avatarEdit"
					@click="changeAvatar"
					>{{ i18n.ts._profile.changeAvatar }}</MkButton
				>
			</div>
			<MkButton
				primary
				rounded
				class="bannerEdit"
				@click="changeBanner"
				>{{ i18n.ts._profile.changeBanner }}</MkButton
			>
		</div>

		<FormInput
			v-model="profile.name"
			:max="30"
			manual-save
			class="_formBlock"
		>
			<template #label>{{ i18n.ts._profile.name }}</template>
		</FormInput>

		<FormTextarea
			v-model="profile.description"
			:max="500"
			tall
			manual-save
			class="_formBlock"
		>
			<template #label>{{ i18n.ts._profile.description }}</template>
			<template #caption>{{
				i18n.ts._profile.youCanIncludeHashtags
			}}</template>
		</FormTextarea>

		<FormInput v-model="profile.location" manual-save class="_formBlock">
			<template #label>{{ i18n.ts.location }}</template>
			<template #prefix><i :class="icon('ph-map-pin')"></i></template>
			<template #caption>{{
				i18n.ts._profile.locationDescription
			}}</template>
		</FormInput>

		<FormInput
			v-model="profile.birthday"
			type="date"
			manual-save
			class="_formBlock"
		>
			<template #label>{{ i18n.ts.birthday }}</template>
			<template #prefix><i :class="icon('ph-cake')"></i></template>
		</FormInput>

		<FormSlot class="_formBlock">
			<FormFolder>
				<template #icon><i :class="icon('ph-dir ph-table')"></i></template>
				<template #label>{{ i18n.ts._profile.metadataEdit }}</template>

				<div class="_formRoot">
					<FormSplit
						v-for="(record, i) in fields"
						:min-width="250"
						class="_formBlock"
					>
						<FormInput v-model="record.name" small>
							<template #label
								>{{ i18n.ts._profile.metadataLabel }} #{{
									i + 1
								}}</template
							>
						</FormInput>
						<FormInput v-model="record.value" small>
							<template #label
								>{{ i18n.ts._profile.metadataContent }} #{{
									i + 1
								}}</template
							>
						</FormInput>
					</FormSplit>
					<MkButton
						:disabled="fields.length >= 16"
						inline
						style="margin-inline-end: 8px"
						@click="addField"
						><i :class="icon('ph-plus')"></i>
						{{ i18n.ts.add }}</MkButton
					>
					<MkButton inline primary @click="saveFields"
						><i :class="icon('ph-check')"></i>
						{{ i18n.ts.save }}</MkButton
					>
				</div>
			</FormFolder>
			<template #caption>{{
				i18n.t("_profile.metadataDescription", {
					a: "\<a\>",
					l: "\<a\>",
					rel: `rel="me" href="https://${host}/@${me.username}"`,
				})
			}}</template>
		</FormSlot>

		<FormSwitch v-model="profile.isCat" class="_formBlock"
			>{{ i18n.ts.flagAsCat
			}}<template #caption>{{
				i18n.ts.flagAsCatDescription
			}}</template></FormSwitch
		>
		<FormSwitch
			v-if="profile.isCat"
			v-model="profile.speakAsCat"
			class="_formBlock"
			>{{ i18n.ts.flagSpeakAsCat
			}}<template #caption>{{
				i18n.ts.flagSpeakAsCatDescription
			}}</template></FormSwitch
		>
		<FormSwitch v-model="profile.isBot" class="_formBlock"
			>{{ i18n.ts.flagAsBot
			}}<template #caption>{{
				i18n.ts.flagAsBotDescription
			}}</template></FormSwitch
		>
		<div v-if="saveButton == true">
			<MkButton primary @click="save">{{ i18n.ts.save }}</MkButton>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import MkButton from "@/components/MkButton.vue";
import FormInput from "@/components/form/input.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormSplit from "@/components/form/split.vue";
import FormFolder from "@/components/form/folder.vue";
import FormSlot from "@/components/form/slot.vue";
import { selectFile } from "@/scripts/select-file";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { me } from "@/me";
import { definePageMetadata } from "@/scripts/page-metadata";
import { host } from "@/config";
import icon from "@/scripts/icon";

const profile = reactive({
	name: me?.name,
	description: me?.description,
	location: me?.location,
	birthday: me?.birthday,
	isBot: me?.isBot,
	isCat: me?.isCat,
	speakAsCat: me?.speakAsCat,
});

const props = withDefaults(
	defineProps<{
		saveButton?: boolean;
	}>(),
	{},
);

const saveButton = ref(props.saveButton ?? false);

watch(
	() => profile,
	() => {
		save();
	},
	{
		deep: true,
	},
);

const fields = reactive(
	me.fields.map((field) => ({ name: field.name, value: field.value })),
);

function addField() {
	fields.push({
		name: "",
		value: "",
	});
}

while (fields.length < 4) {
	addField();
}

function saveFields() {
	os.apiWithDialog("i/update", {
		fields: fields.filter((field) => field.name !== "" && field.value !== ""),
	});
}

const convertEmptyStringToNull = (x) =>
	x === "" ? null : x == null ? undefined : x;

function save() {
	os.apiWithDialog("i/update", {
		name: convertEmptyStringToNull(profile.name),
		description: convertEmptyStringToNull(profile.description),
		location: convertEmptyStringToNull(profile.location),
		birthday: convertEmptyStringToNull(profile.birthday),
		isBot: !!profile.isBot,
		isCat: !!profile.isCat,
		speakAsCat: profile.isCat ? !!profile.speakAsCat : undefined,
	});
}

function changeAvatar(ev) {
	selectFile(ev.currentTarget ?? ev.target, i18n.ts.avatar).then(
		async (file) => {
			let originalOrCropped = file;

			const { canceled } = await os.yesno({
				type: "question",
				text: i18n.ts.cropImageAsk,
			});

			if (!canceled) {
				originalOrCropped = await os.cropImage(file, {
					aspectRatio: 1,
				});
			}

			const i = await os.apiWithDialog("i/update", {
				avatarId: originalOrCropped.id,
			});
			me.avatarId = i.avatarId;
			me.avatarUrl = i.avatarUrl;
		},
	);
}

function changeBanner(ev) {
	selectFile(ev.currentTarget ?? ev.target, i18n.ts.banner).then(
		async (file) => {
			let originalOrCropped = file;

			const { canceled } = await os.yesno({
				type: "question",
				text: i18n.ts.cropImageAsk,
			});

			if (!canceled) {
				originalOrCropped = await os.cropImage(file, {
					aspectRatio: 2,
				});
			}

			const i = await os.apiWithDialog("i/update", {
				bannerId: originalOrCropped.id,
			});
			me.bannerId = i.bannerId;
			me.bannerUrl = i.bannerUrl;
		},
	);
}

definePageMetadata({
	title: i18n.ts.profile,
	icon: `${icon("ph-user")}`,
});
</script>

<style lang="scss" scoped>
.llvierxe {
	position: relative;
	background-size: cover;
	background-position: center;
	border: solid 1px var(--divider);
	border-radius: 10px;
	overflow: clip;

	> .avatar {
		display: inline-block;
		text-align: center;
		padding: 16px;

		> .avatar {
			display: inline-block;
			inline-size: 72px;
			block-size: 72px;
			margin-block-start: 0;
			margin-inline-end: auto;
			margin-block-end: 16px;
			margin-inline-start: auto;
		}
	}

	> .bannerEdit {
		position: absolute;
		inset-block-start: 16px;
		inset-inline-end: 16px;
	}
}
</style>
