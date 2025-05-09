<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="700">
			<div class="mk-list-page">
				<transition
					:name="defaultStore.state.animation ? 'zoom' : ''"
					mode="out-in"
				>
					<div v-if="list" class="_section">
						<div class="_content">
							<MkButton inline @click="addUser()">{{
								i18n.ts.addUser
							}}</MkButton>
							<MkButton inline @click="renameList()">{{
								i18n.ts.rename
							}}</MkButton>
							<MkButton inline @click="deleteList()">{{
								i18n.ts.delete
							}}</MkButton>
						</div>
					</div>
				</transition>

				<transition
					:name="defaultStore.state.animation ? 'zoom' : ''"
					mode="out-in"
				>
					<div v-if="list" class="_section members _gap">
						<div class="_title">{{ i18n.ts.members }}</div>
						<div class="_content">
							<div class="users">
								<div
									v-for="user in users"
									:key="user.id"
									class="user _panel"
								>
									<MkAvatar
										:user="user"
										class="avatar"
										:show-indicator="true"
									/>
									<div class="body">
										<MkUserName :user="user" class="name" />
										<MkAcct :user="user" class="acct" />
									</div>
									<div class="action">
										<button
											class="_button"
											:aria-label="i18n.ts.removeMember"
											@click="removeUser(user)"
										>
											<i :class="icon('ph-x')"></i>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</transition>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import MkButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { mainRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import icon from "@/scripts/icon";

const props = defineProps<{
	listId: string;
}>();

const list = ref<any>(null);
const users = ref([]);

function fetchList() {
	os.api("users/lists/show", {
		listId: props.listId,
	}).then((_list) => {
		list.value = _list;
		os.api("users/show", {
			userIds: list.value.userIds,
		}).then((_users) => {
			users.value = _users;
		});
	});
}

function addUser() {
	os.selectUser().then((user) => {
		os.apiWithDialog("users/lists/push", {
			listId: list.value.id,
			userId: user.id,
		}).then(() => {
			users.value.push(user);
		});
	});
}

function removeUser(user) {
	os.api("users/lists/pull", {
		listId: list.value.id,
		userId: user.id,
	}).then(() => {
		users.value = users.value.filter((x) => x.id !== user.id);
	});
}

async function renameList() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.enterListName,
		default: list.value.name,
	});
	if (canceled) return;

	await os.api("users/lists/update", {
		listId: list.value.id,
		name,
	});

	list.value.name = name;
}

async function deleteList() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: list.value.name }),
	});
	if (canceled) return;

	await os.api("users/lists/delete", {
		listId: list.value.id,
	});
	os.success();
	mainRouter.push("/my/lists");
}

watch(() => props.listId, fetchList, { immediate: true });

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(
	computed(() =>
		list.value
			? {
					title: list.value.name,
					icon: `${icon("ph-list-bullets ph-dir")}`,
				}
			: null,
	),
);
</script>

<style lang="scss" scoped>
.mk-list-page {
	> .members {
		> ._content {
			> .users {
				> .user {
					display: flex;
					align-items: center;
					padding: 16px;
					margin-block-start: 10px;
					margin-inline: 0;
					margin-block-end: auto;

					> .avatar {
						inline-size: 50px;
						block-size: 50px;
					}

					> .body {
						flex: 1;
						padding: 8px;

						> .name {
							display: block;
							font-weight: bold;
						}

						> .acct {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}
}
</style>
