<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="800">
			<MkPagination
				ref="paginationEl"
				v-slot="{ items }"
				:pagination="pagination"
				class="ruryvtyk _gaps_m"
			>
				<section
					v-for="announcement in items"
					:key="announcement.id"
					class="announcement _panel"
				>
					<div class="_title">
						<h3>
							<span v-if="isSignedIn(me) && !announcement.isRead">
								🆕&nbsp;
							</span>
							{{ announcement.title }}
						</h3>
						<MkTime :time="announcement.createdAt" />
						<div v-if="announcement.updatedAt">
							{{ i18n.ts.updatedAt }}:
							<MkTime :time="announcement.createdAt" />
						</div>
					</div>
					<hr class="_seperator" />
					<div class="_content">
						<Mfm :text="announcement.text" />
						<img
							v-if="announcement.imageUrl"
							:src="announcement.imageUrl"
						/>
					</div>
					<div
						v-if="isSignedIn(me) && !announcement.isRead"
						class="_footer"
					>
						<MkButton primary @click="read(announcement.id)"
							><i :class="icon('ph-check')"></i>
							{{ i18n.ts.gotIt }}</MkButton
						>
					</div>
				</section>
			</MkPagination>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import MkPagination from "@/components/MkPagination.vue";
import type { MkPaginationType } from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";
import { isSignedIn, me } from "@/me";

const pagination = {
	endpoint: "announcements" as const,
	limit: 10,
};

const paginationEl = ref<MkPaginationType<"announcements"> | null>(null);
function read(id: string) {
	if (!paginationEl.value) return;
	paginationEl.value.updateItem(id, (announcement) => {
		announcement.isRead = true;
		return announcement;
	});
	os.api("i/read-announcement", { announcementId: id });
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.announcements,
	icon: `${icon("ph-megaphone-simple")}`,
});
</script>

<style lang="scss" scoped>
.ruryvtyk {
	> .announcement {
		&:not(:last-child) {
			margin-block-end: var(--margin);
		}

		> ._title {
			padding: 0.5rem 2rem !important;
		}

		> ._seperator {
			margin: 1rem;
		}

		> ._content {
			padding: 0 2rem !important;

			> img {
				display: block;
				max-block-size: 300px;
				max-inline-size: 100%;
				border-radius: 10px;
				margin-block-start: 1rem;
			}
		}
	}
}
</style>
