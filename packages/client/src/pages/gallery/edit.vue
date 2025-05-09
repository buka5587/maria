<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="800" :margin-min="16" :margin-max="32">
			<FormSuspense :p="init">
				<FormInput v-model="title">
					<template #label>{{ i18n.ts.title }}</template>
				</FormInput>

				<FormTextarea v-model="description" :max="500">
					<template #label>{{ i18n.ts.description }}</template>
				</FormTextarea>

				<div class="">
					<div
						v-for="file in files"
						:key="file.id"
						class="wqugxsfx"
						:style="{
							backgroundImage: file
								? `url(${file.thumbnailUrl})`
								: null,
						}"
					>
						<div class="name">{{ file.name }}</div>
						<button
							v-tooltip="i18n.ts.remove"
							class="remove _button"
							:aria-label="i18n.ts.remove"
							@click="remove(file)"
						>
							<i :class="icon('ph-x')"></i>
						</button>
					</div>
					<FormButton primary @click="selectFile"
						><i :class="icon('ph-plus')"></i>
						{{ i18n.ts.attachFile }}</FormButton
					>
				</div>

				<FormSwitch
					v-if="!markLocalFilesNsfwByDefault"
					v-model="isSensitive"
					>{{ i18n.ts.markAsSensitive }}</FormSwitch
				>

				<FormButton v-if="postId" primary @click="save"
					><i :class="icon('ph-floppy-disk-back')"></i>
					{{ i18n.ts.save }}</FormButton
				>
				<FormButton v-else primary @click="save"
					><i :class="icon('ph-floppy-disk-back')"></i>
					{{ i18n.ts.publish }}</FormButton
				>

				<FormButton v-if="postId" danger @click="del"
					><i :class="icon('ph-trash')"></i>
					{{ i18n.ts.delete }}</FormButton
				>
			</FormSuspense>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import FormButton from "@/components/MkButton.vue";
import FormInput from "@/components/form/input.vue";
import FormTextarea from "@/components/form/textarea.vue";
import FormSwitch from "@/components/form/switch.vue";
import FormSuspense from "@/components/form/suspense.vue";
import { selectFiles } from "@/scripts/select-file";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { getInstanceInfo } from "@/instance";
import { i18n } from "@/i18n";
import icon from "@/scripts/icon";

const router = useRouter();

const props = defineProps<{
	postId?: string;
}>();

const init = ref(null);
const files = ref([]);
const description = ref(null);
const title = ref(null);
const isSensitive = ref(false);

const { markLocalFilesNsfwByDefault } = getInstanceInfo();

function selectFile(evt) {
	selectFiles(evt.currentTarget ?? evt.target, null).then((selected) => {
		files.value = files.value.concat(selected);
	});
}

function remove(file) {
	files.value = files.value.filter((f) => f.id !== file.id);
}

async function save() {
	if (props.postId) {
		await os.apiWithDialog("gallery/posts/update", {
			postId: props.postId,
			title: title.value,
			description: description.value,
			fileIds: files.value.map((file) => file.id),
			isSensitive: isSensitive.value,
		});
		router.push(`/gallery/${props.postId}`);
	} else {
		const created = await os.apiWithDialog("gallery/posts/create", {
			title: title.value,
			description: description.value,
			fileIds: files.value.map((file) => file.id),
			isSensitive: isSensitive.value,
		});
		router.push(`/gallery/${created?.id}`);
	}
}

async function del() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.ts.deleteConfirm,
	});
	if (canceled) return;
	await os.apiWithDialog("gallery/posts/delete", {
		postId: props.postId,
	});
	router.push("/gallery");
}

watch(
	() => props.postId,
	() => {
		init.value = () =>
			props.postId
				? os
						.api("gallery/posts/show", {
							postId: props.postId,
						})
						.then((post) => {
							files.value = post.files;
							title.value = post.title;
							description.value = post.description;
							isSensitive.value = post.isSensitive;
						})
				: Promise.resolve(null);
	},
	{ immediate: true },
);

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		props.postId
			? {
					title: i18n.ts.toEdit,
					icon: `${icon("ph-pencil")}`,
				}
			: {
					title: i18n.ts.postToGallery,
					icon: `${icon("ph-pencil")}`,
				},
	),
);
</script>

<style lang="scss" scoped>
.wqugxsfx {
	block-size: 200px;
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	position: relative;

	> .name {
		position: absolute;
		inset-block-start: 8px;
		inset-inline-start: 9px;
		padding: 8px;
		background: var(--panel);
	}

	> .remove {
		position: absolute;
		inset-block-start: 8px;
		inset-inline-end: 9px;
		padding: 8px;
		background: var(--panel);
	}
}
</style>
