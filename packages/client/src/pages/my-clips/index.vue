<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="700">
			<div class="qtcaoidl">
				<MkPagination
					ref="pagingComponent"
					:pagination="pagination"
					class="list"
				>
					<template #empty>
						<MkInfo :icon="'paperclip'" :card="true">
							<p>{{ i18n.ts.clipsDesc }}</p>
						</MkInfo>
					</template>
					<template #default="{ items }">
						<MkA
							v-for="item in items"
							:key="item.id"
							:to="`/clips/${item.id}`"
							class="item _panel _gap"
						>
							<b>{{ item.name }}</b>
							<div v-if="item.description" class="description">
								{{ item.description }}
							</div>
						</MkA>
					</template>
				</MkPagination>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import MkPagination, {
	type MkPaginationType,
} from "@/components/MkPagination.vue";
import MkInfo from "@/components/MkInfo.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const pagination = {
	endpoint: "clips/list" as const,
	limit: 10,
};

const pagingComponent = ref<MkPaginationType<
	typeof pagination.endpoint
> | null>(null);

async function create() {
	const { canceled, result } = await os.form(i18n.ts.createNewClip, {
		name: {
			type: "string",
			label: i18n.ts.name,
		},
		description: {
			type: "string",
			required: false,
			multiline: true,
			label: i18n.ts.description,
		},
		isPublic: {
			type: "boolean",
			label: i18n.ts.public,
			default: false,
		},
	});
	if (canceled) return;

	os.apiWithDialog("clips/create", result);

	pagingComponent.value.reload();
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.clip,
	icon: `${icon("ph-paperclip")}`,
	action: {
		icon: `${icon("ph-plus")}`,
		handler: create,
	},
});
</script>

<style lang="scss" scoped>
.qtcaoidl {
	> .list {
		> .item {
			display: block;
			padding: 16px;

			> .description {
				margin-block-start: 8px;
				padding-block-start: 8px;
				border-block-start: solid 0.5px var(--divider);
			}
		}
	}
}
</style>
