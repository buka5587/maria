<template>
	<MkStickyContainer>
		<template #header><MkPageHeader /></template>
		<MkSpacer :content-max="800">
			<MkPagination ref="pagingComponent" :pagination="pagination">
				<template #empty>
					<div class="_fullinfo">
						<img
							src="/static-assets/badges/info.webp"
							class="_ghost"
							alt="Info"
						/>
						<div>{{ i18n.ts.noNotes }}</div>
					</div>
				</template>

				<template #default="{ items }">
					<XList
						v-slot="{ item }"
						:items="items"
						:direction="'down'"
						:no-gap="false"
						:ad="false"
					>
						<XNote
							:key="item.id"
							:note="item.note"
							:class="$style.note"
						/>
					</XList>
				</template>
			</MkPagination>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import MkPagination from "@/components/MkPagination.vue";
import type { MkPaginationType } from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const pagination = {
	endpoint: "i/favorites" as const,
	limit: 10,
};

const pagingComponent = ref<MkPaginationType<
	typeof pagination.endpoint
> | null>(null);

definePageMetadata({
	title: i18n.ts.favorites,
	icon: `${icon("ph-bookmark-simple")}`,
});
</script>

<style lang="scss" module>
.note {
	background: var(--panel);
	border-radius: var(--radius);
}
</style>
