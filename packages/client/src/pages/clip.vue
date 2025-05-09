<template>
	<MkStickyContainer>
		<template #header><MkPageHeader :actions="headerActions" /></template>
		<MkSpacer :content-max="800">
			<div v-if="clip">
				<div class="okzinsic _panel">
					<div v-if="clip.description" class="description">
						<Mfm
							:text="clip.description"
							:is-note="false"
							:i="me"
						/>
					</div>
					<div class="user">
						<MkAvatar
							:user="clip.user"
							class="avatar"
							:show-indicator="true"
						/>
						<MkUserName :user="clip.user" :nowrap="false" />
					</div>
				</div>

				<XNotes :pagination="pagination" :detail="true" />
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, provide, ref, watch } from "vue";
import type { entities } from "firefish-js";
import XNotes from "@/components/MkNotes.vue";
import { isSignedIn, me } from "@/me";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const props = defineProps<{
	clipId: string;
}>();

const clip = ref<entities.Clip>();
const pagination = {
	endpoint: "clips/notes" as const,
	limit: 10,
	params: computed(() => ({
		clipId: props.clipId,
	})),
};

const isOwned: boolean | null = computed<boolean | null>(
	() => isSignedIn(me) && clip.value && me.id === clip.value.userId,
);

watch(
	() => props.clipId,
	async () => {
		clip.value = await os.api("clips/show", {
			clipId: props.clipId,
		});
	},
	{
		immediate: true,
	},
);

provide("currentClipPage", clip);

const headerActions = computed(() =>
	clip.value && isOwned.value
		? [
				{
					icon: `${icon("ph-pencil")}`,
					text: i18n.ts.toEdit,
					handler: async (): Promise<void> => {
						const { canceled, result } = await os.form(clip.value!.name, {
							name: {
								type: "string",
								label: i18n.ts.name,
								default: clip.value!.name,
							},
							description: {
								type: "string",
								required: false,
								multiline: true,
								label: i18n.ts.description,
								default: clip.value!.description,
							},
							isPublic: {
								type: "boolean",
								label: i18n.ts.public,
								default: clip.value!.isPublic,
							},
						});
						if (canceled) return;

						os.apiWithDialog("clips/update", {
							clipId: clip.value!.id,
							...result,
						});
					},
				},
				{
					icon: `${icon("ph-trash")}`,
					text: i18n.ts.delete,
					danger: true,
					handler: async (): Promise<void> => {
						const { canceled } = await os.confirm({
							type: "warning",
							text: i18n.t("deleteAreYouSure", {
								x: clip.value.name,
							}),
						});
						if (canceled) return;

						await os.apiWithDialog("clips/delete", {
							clipId: clip.value.id,
						});
					},
				},
			]
		: null,
);

definePageMetadata(
	computed(() =>
		clip.value
			? {
					title: clip.value.name,
					icon: `${icon("ph-paperclip")}`,
				}
			: null,
	),
);
</script>

<style lang="scss" scoped>
.okzinsic {
	position: relative;
	margin-block-end: var(--margin);

	> .description {
		padding: 16px;
	}

	> .user {
		$height: 32px;
		padding: 16px;
		border-block-start: solid 0.5px var(--divider);
		line-height: $height;

		> .avatar {
			inline-size: $height;
			block-size: $height;
		}
	}
}
</style>
