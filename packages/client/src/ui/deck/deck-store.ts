import { throttle } from "throttle-debounce";
import { markRaw } from "vue";
import type { notificationTypes } from "firefish-js";
import { Storage } from "../../pizzax";
import { api } from "@/os";
import { deepClone } from "@/scripts/clone";

interface ColumnWidget {
	name: string;
	id: string;
	data: Record<string, any>;
}

export interface Column {
	id: string;
	type:
		| "main"
		| "widgets"
		| "notifications"
		| "tl"
		| "antenna"
		| "channel"
		| "list"
		| "mentions"
		| "direct";
	name: string | null;
	width: number;
	widgets?: ColumnWidget[];
	active?: boolean;
	flexible?: boolean;
	antennaId?: string;
	channelId?: string;
	listId?: string;
	includingTypes?: (typeof notificationTypes)[number][];
	tl?: "home" | "local" | "social" | "recommended" | "global";
}

export const deckStore = markRaw(
	new Storage("deck", {
		profile: {
			where: "deviceAccount",
			default: "default",
		},
		columns: {
			where: "deviceAccount",
			default: [] as Column[],
		},
		layout: {
			where: "deviceAccount",
			default: [] as Column["id"][][],
		},
		columnAlign: {
			where: "deviceAccount",
			default: "left" as "left" | "right" | "center",
		},
		alwaysShowMainColumn: {
			where: "deviceAccount",
			default: true,
		},
		navWindow: {
			where: "deviceAccount",
			default: true,
		},
	}),
);

export const loadDeck = async () => {
	let deck;

	try {
		deck = await api("i/registry/get", {
			scope: ["client", "deck", "profiles"],
			key: deckStore.state.profile,
		});
	} catch (err) {
		if (err.code === "NO_SUCH_KEY") {
			// 後方互換性のため
			if (deckStore.state.profile === "default") {
				saveDeck();
				return;
			}

			deckStore.set("columns", []);
			deckStore.set("layout", []);
			return;
		}
		throw err;
	}

	deckStore.set("columns", deck.columns);
	deckStore.set("layout", deck.layout);
};

// TODO: deckがloadされていない状態でsaveすると意図せず上書きが発生するので対策する
export const saveDeck = throttle(1000, () => {
	api("i/registry/set", {
		scope: ["client", "deck", "profiles"],
		key: deckStore.state.profile,
		value: {
			columns: deckStore.reactiveState.columns.value,
			layout: deckStore.reactiveState.layout.value,
		},
	});
});

export async function getProfiles(): Promise<string[]> {
	return await api("i/registry/keys", {
		scope: ["client", "deck", "profiles"],
	});
}

export async function deleteProfile(key: string): Promise<any> {
	return await api("i/registry/remove", {
		scope: ["client", "deck", "profiles"],
		key,
	});
}

export async function renameProfile(oldKey: string, newKey: string) {
	if (oldKey === newKey) return;

	await api("i/registry/set", {
		scope: ["client", "deck", "profiles"],
		key: newKey,
		value: {
			columns: deckStore.state.columns,
			layout: deckStore.state.layout,
		},
	});
	deckStore.set("profile", newKey);
	saveDeck();

	deleteProfile(oldKey);
}

export function addColumn(column: Column) {
	if (column.name === undefined) column.name = null;
	deckStore.push("columns", column);
	deckStore.push("layout", [column.id]);
	saveDeck();
}

export function removeColumn(id: Column["id"]) {
	deckStore.set(
		"columns",
		deckStore.state.columns.filter((c) => c.id !== id),
	);
	deckStore.set(
		"layout",
		deckStore.state.layout
			.map((ids) => ids.filter((_id) => _id !== id))
			.filter((ids) => ids.length > 0),
	);
	saveDeck();
}

export function swapColumn(a: Column["id"], b: Column["id"]) {
	const aX = deckStore.state.layout.findIndex((ids) => ids.includes(a));
	const aY = deckStore.state.layout[aX].findIndex((id) => id === a);
	const bX = deckStore.state.layout.findIndex((ids) => ids.includes(b));
	const bY = deckStore.state.layout[bX].findIndex((id) => id === b);
	const layout = deepClone(deckStore.state.layout);
	layout[aX][aY] = b;
	layout[bX][bY] = a;
	deckStore.set("layout", layout);
	saveDeck();
}

export function swapLeftColumn(id: Column["id"]) {
	const layout = deepClone(deckStore.state.layout);
	deckStore.state.layout.some((ids, i) => {
		if (ids.includes(id)) {
			const left = deckStore.state.layout[i - 1];
			if (left) {
				layout[i - 1] = deckStore.state.layout[i];
				layout[i] = left;
				deckStore.set("layout", layout);
			}
			return true;
		}
	});
	saveDeck();
}

export function swapRightColumn(id: Column["id"]) {
	const layout = deepClone(deckStore.state.layout);
	deckStore.state.layout.some((ids, i) => {
		if (ids.includes(id)) {
			const right = deckStore.state.layout[i + 1];
			if (right) {
				layout[i + 1] = deckStore.state.layout[i];
				layout[i] = right;
				deckStore.set("layout", layout);
			}
			return true;
		}
	});
	saveDeck();
}

export function swapUpColumn(id: Column["id"]) {
	const layout = deepClone(deckStore.state.layout);
	const idsIndex = deckStore.state.layout.findIndex((ids) => ids.includes(id));
	const ids = deepClone(deckStore.state.layout[idsIndex]);
	ids.some((x, i) => {
		if (x === id) {
			const up = ids[i - 1];
			if (up) {
				ids[i - 1] = id;
				ids[i] = up;

				layout[idsIndex] = ids;
				deckStore.set("layout", layout);
			}
			return true;
		}
	});
	saveDeck();
}

export function swapDownColumn(id: Column["id"]) {
	const layout = deepClone(deckStore.state.layout);
	const idsIndex = deckStore.state.layout.findIndex((ids) => ids.includes(id));
	const ids = deepClone(deckStore.state.layout[idsIndex]);
	ids.some((x, i) => {
		if (x === id) {
			const down = ids[i + 1];
			if (down) {
				ids[i + 1] = id;
				ids[i] = down;

				layout[idsIndex] = ids;
				deckStore.set("layout", layout);
			}
			return true;
		}
	});
	saveDeck();
}

export function stackLeftColumn(id: Column["id"]) {
	let layout = deepClone(deckStore.state.layout);
	const i = deckStore.state.layout.findIndex((ids) => ids.includes(id));
	layout = layout.map((ids) => ids.filter((_id) => _id !== id));
	layout[i - 1].push(id);
	layout = layout.filter((ids) => ids.length > 0);
	deckStore.set("layout", layout);
	saveDeck();
}

export function popRightColumn(id: Column["id"]) {
	let layout = deepClone(deckStore.state.layout);
	const i = deckStore.state.layout.findIndex((ids) => ids.includes(id));
	const affected = layout[i];
	layout = layout.map((ids) => ids.filter((_id) => _id !== id));
	layout.splice(i + 1, 0, [id]);
	layout = layout.filter((ids) => ids.length > 0);
	deckStore.set("layout", layout);

	const columns = deepClone(deckStore.state.columns);
	for (const column of columns) {
		if (affected.includes(column.id)) {
			column.active = true;
		}
	}
	deckStore.set("columns", columns);

	saveDeck();
}

export function addColumnWidget(id: Column["id"], widget: ColumnWidget) {
	const columns = deepClone(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex((c) => c.id === id);
	const column = deepClone(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	if (column.widgets == null) column.widgets = [];
	column.widgets.unshift(widget);
	columns[columnIndex] = column;
	deckStore.set("columns", columns);
	saveDeck();
}

export function removeColumnWidget(id: Column["id"], widget: ColumnWidget) {
	const columns = deepClone(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex((c) => c.id === id);
	const column = deepClone(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = column.widgets.filter((w) => w.id !== widget.id);
	columns[columnIndex] = column;
	deckStore.set("columns", columns);
	saveDeck();
}

export function setColumnWidgets(id: Column["id"], widgets: ColumnWidget[]) {
	const columns = deepClone(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex((c) => c.id === id);
	const column = deepClone(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = widgets;
	columns[columnIndex] = column;
	deckStore.set("columns", columns);
	saveDeck();
}

export function updateColumnWidget(
	id: Column["id"],
	widgetId: string,
	widgetData: any,
) {
	const columns = deepClone(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex((c) => c.id === id);
	const column = deepClone(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = column.widgets.map((w) =>
		w.id === widgetId
			? {
					...w,
					data: widgetData,
				}
			: w,
	);
	columns[columnIndex] = column;
	deckStore.set("columns", columns);
	saveDeck();
}

export function updateColumn(id: Column["id"], column: Partial<Column>) {
	const columns = deepClone(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex((c) => c.id === id);
	const currentColumn = deepClone(deckStore.state.columns[columnIndex]);
	if (currentColumn == null) return;
	for (const [k, v] of Object.entries(column)) {
		currentColumn[k] = v;
	}
	columns[columnIndex] = currentColumn;
	deckStore.set("columns", columns);
	saveDeck();
}
