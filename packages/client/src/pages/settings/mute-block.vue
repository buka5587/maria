<template>
	<div class="_formRoot">
		<MkTab v-model="tab" style="margin-block-end: var(--margin)">
			<option value="mute">{{ i18n.ts.mutedUsers }}</option>
			<option value="block">{{ i18n.ts.blockedUsers }}</option>
		</MkTab>
		<div v-if="tab === 'mute'">
			<MkPagination :pagination="mutingPagination" class="muting">
				<template #empty
					><FormInfo>{{ i18n.ts.noUsers }}</FormInfo></template
				>
				<template #default="{ items }" class="_formlinks">
					<FormLink
						v-for="mute in items"
						:key="mute.id"
						:to="userPage(mute.mutee)"
					>
						<MkAcct :user="mute.mutee" />
					</FormLink>
				</template>
			</MkPagination>
		</div>
		<div v-if="tab === 'block'">
			<MkPagination :pagination="blockingPagination" class="blocking">
				<template #empty
					><FormInfo>{{ i18n.ts.noUsers }}</FormInfo></template
				>
				<template #default="{ items }" class="_formlinks">
					<FormLink
						v-for="block in items"
						:key="block.id"
						:to="userPage(block.blockee)"
					>
						<MkAcct :user="block.blockee" />
					</FormLink>
				</template>
			</MkPagination>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import MkPagination from "@/components/MkPagination.vue";
import MkTab from "@/components/MkTab.vue";
import FormInfo from "@/components/MkInfo.vue";
import FormLink from "@/components/form/link.vue";
import { userPage } from "@/filters/user";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import icon from "@/scripts/icon";

const tab = ref("mute");

const mutingPagination = {
	endpoint: "mute/list" as const,
	limit: 10,
};

const blockingPagination = {
	endpoint: "blocking/list" as const,
	limit: 10,
};

definePageMetadata({
	title: i18n.ts.muteAndBlock,
	icon: `${icon("ph-prohibit")}`,
});
</script>
