import { EventEmitter } from "eventemitter3";
import ReconnectingWebsocket from "reconnecting";
import type { BroadcastEvents, Channels } from "./streaming.types.js";

function autobind(instance: any): void {
	const prototype = Object.getPrototypeOf(instance);

	const propertyNames = Object.getOwnPropertyNames(prototype);

	for (const key of propertyNames) {
		const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

		if (typeof descriptor?.value === "function" && key !== "constructor") {
			Object.defineProperty(instance, key, {
				value: instance[key].bind(instance),
				enumerable: descriptor.enumerable,
				configurable: descriptor.configurable,
				writable: descriptor.writable,
			});
		}
	}
}

export function urlQuery(
	obj: Record<string, string | number | boolean | undefined>,
): string {
	const params = Object.entries(obj)
		.filter(([, v]) => (Array.isArray(v) ? v.length : v !== undefined))
		.reduce(
			// biome-ignore lint/suspicious/noAssignInExpressions: <Used for key assigning>
			// biome-ignore lint/style/noNonNullAssertion: <>
			// biome-ignore lint/style/noCommaOperator: <>
			(a, [k, v]) => ((a[k] = v!), a),
			{} as Record<string, string | number | boolean>,
		);

	return Object.entries(params)
		.map((e) => `${e[0]}=${encodeURIComponent(e[1])}`)
		.join("&");
}

type AnyOf<T extends Record<any, any>> = T[keyof T];

type StreamEvents = {
	_connected_: void;
	_disconnected_: void;
} & BroadcastEvents;

/**
 * Maria stream connection
 */
export default class Stream extends EventEmitter<StreamEvents> {
	public stream: ReconnectingWebsocket;
	public state: "initializing" | "reconnecting" | "connected" = "initializing";
	private sharedConnectionPools: Pool[] = [];
	private sharedConnections: SharedConnection[] = [];
	private nonSharedConnections: NonSharedConnection[] = [];
	private idCounter = 0;

	constructor(
		origin: string,
		user: { token: string } | null,
		options?: {
			WebSocket?: any;
		},
	) {
		super();
		autobind(this);
		options = options || {};

		const query = urlQuery({
			i: user?.token,

			// To prevent cache of an HTML such as error screen
			_t: Date.now(),
		});

		const wsOrigin = origin
			.replace("http://", "ws://")
			.replace("https://", "wss://");

		this.stream = new ReconnectingWebsocket(
			`${wsOrigin}/streaming?${query}`,
			"",
			{
				WebSocket: options.WebSocket,
			},
		);
		this.stream.addEventListener("open", this.onOpen);
		this.stream.addEventListener("close", this.onClose);
		this.stream.addEventListener("message", this.onMessage);
	}

	private genId(): string {
		return (++this.idCounter).toString();
	}

	public useChannel<C extends keyof Channels>(
		channel: C,
		params?: Channels[C]["params"],
		name?: string,
	): Connection<Channels[C]> {
		if (params) {
			return this.connectToChannel(channel, params);
		} else {
			return this.useSharedConnection(channel, name);
		}
	}

	private useSharedConnection<C extends keyof Channels>(
		channel: C,
		name?: string,
	): SharedConnection<Channels[C]> {
		let pool = this.sharedConnectionPools.find((p) => p.channel === channel);

		if (pool == null) {
			pool = new Pool(this, channel, this.genId());
			this.sharedConnectionPools.push(pool);
		}

		const connection = new SharedConnection(this, channel, pool, name);
		this.sharedConnections.push(connection);
		return connection;
	}

	public removeSharedConnection(connection: SharedConnection): void {
		this.sharedConnections = this.sharedConnections.filter(
			(c) => c !== connection,
		);
	}

	public removeSharedConnectionPool(pool: Pool): void {
		this.sharedConnectionPools = this.sharedConnectionPools.filter(
			(p) => p !== pool,
		);
	}

	private connectToChannel<C extends keyof Channels>(
		channel: C,
		params: Channels[C]["params"],
	): NonSharedConnection<Channels[C]> {
		const connection = new NonSharedConnection(
			this,
			channel,
			this.genId(),
			params,
		);
		this.nonSharedConnections.push(connection);
		return connection;
	}

	public disconnectToChannel(connection: NonSharedConnection): void {
		this.nonSharedConnections = this.nonSharedConnections.filter(
			(c) => c !== connection,
		);
	}

	/**
	 * Callback of when open connection
	 */
	private onOpen(): void {
		const isReconnect = this.state === "reconnecting";

		this.state = "connected";
		this.emit("_connected_");

		// チャンネル再接続
		if (isReconnect) {
			for (const p of this.sharedConnectionPools) p.connect();
			for (const c of this.nonSharedConnections) c.connect();
		}
	}

	/**
	 * Callback of when close connection
	 */
	private onClose(): void {
		if (this.state === "connected") {
			this.state = "reconnecting";
			this.emit("_disconnected_");
		}
	}

	/**
	 * Callback of when received a message from connection
	 */
	private onMessage(message: { data: string }): void {
		const { type, body } = JSON.parse(message.data);

		if (type === "channel") {
			const id = body.id;

			let connections: Connection[];

			connections = this.sharedConnections.filter((c) => c.id === id);

			if (connections.length === 0) {
				const found = this.nonSharedConnections.find((c) => c.id === id);
				if (found) {
					connections = [found];
				}
			}

			for (const c of connections) {
				c.emit(body.type, body.body);
				c.inCount++;
			}
		} else {
			this.emit(type, body);
		}
	}

	/**
	 * Send a message to connection
	 */
	public send(typeOrPayload: any, payload?: any): void {
		const data =
			payload === undefined
				? typeOrPayload
				: {
						type: typeOrPayload,
						body: payload,
					};

		this.stream.send(JSON.stringify(data));
	}

	/**
	 * Close this connection
	 */
	public close(): void {
		this.stream.close();
	}
}

// TODO: これらのクラスを Stream クラスの内部クラスにすれば余計なメンバをpublicにしないで済むかも？
// もしくは @internal を使う？ https://www.typescriptlang.org/tsconfig#stripInternal
class Pool {
	public channel: keyof Channels;
	public id: string;
	protected stream: Stream;
	public users = 0;
	private disposeTimerId: any;
	private isConnected = false;

	constructor(stream: Stream, channel: keyof Channels, id: string) {
		this.channel = channel;
		this.stream = stream;
		this.id = id;

		this.stream.on("_disconnected_", this.onStreamDisconnected);
	}

	private onStreamDisconnected(): void {
		this.isConnected = false;
	}

	public inc(): void {
		if (this.users === 0 && !this.isConnected) {
			this.connect();
		}

		this.users++;

		// タイマー解除
		if (this.disposeTimerId) {
			clearTimeout(this.disposeTimerId);
			this.disposeTimerId = null;
		}
	}

	public dec(): void {
		this.users--;

		// そのコネクションの利用者が誰もいなくなったら
		if (this.users === 0) {
			// また直ぐに再利用される可能性があるので、一定時間待ち、
			// 新たな利用者が現れなければコネクションを切断する
			this.disposeTimerId = setTimeout(() => {
				this.disconnect();
			}, 3000);
		}
	}

	public connect(): void {
		if (this.isConnected) return;
		this.isConnected = true;
		this.stream.send("connect", {
			channel: this.channel,
			id: this.id,
		});
	}

	private disconnect(): void {
		this.stream.off("_disconnected_", this.onStreamDisconnected);
		this.stream.send("disconnect", { id: this.id });
		this.stream.removeSharedConnectionPool(this);
	}
}

export abstract class Connection<
	Channel extends AnyOf<Channels> = any,
> extends EventEmitter<Channel["events"]> {
	public channel: keyof Channels;
	protected stream: Stream;
	public abstract id: string;

	public name?: string; // for debug
	public inCount = 0; // for debug
	public outCount = 0; // for debug

	constructor(stream: Stream, channel: keyof Channels, name?: string) {
		super();

		this.stream = stream;
		this.channel = channel;
		this.name = name;
	}

	public send<T extends keyof Channel["receives"]>(
		type: T,
		body: Channel["receives"][T],
	): void {
		this.stream.send("ch", {
			id: this.id,
			type: type,
			body: body,
		});

		this.outCount++;
	}

	public abstract dispose(): void;
}

class SharedConnection<
	Channel extends AnyOf<Channels> = any,
> extends Connection<Channel> {
	private pool: Pool;

	public get id(): string {
		return this.pool.id;
	}

	constructor(
		stream: Stream,
		channel: keyof Channels,
		pool: Pool,
		name?: string,
	) {
		super(stream, channel, name);

		this.pool = pool;
		this.pool.inc();
	}

	public dispose(): void {
		this.pool.dec();
		this.removeAllListeners();
		this.stream.removeSharedConnection(this);
	}
}

class NonSharedConnection<
	Channel extends AnyOf<Channels> = any,
> extends Connection<Channel> {
	public id: string;
	protected params: Channel["params"];

	constructor(
		stream: Stream,
		channel: keyof Channels,
		id: string,
		params: Channel["params"],
	) {
		super(stream, channel);

		this.params = params;
		this.id = id;

		this.connect();
	}

	public connect(): void {
		this.stream.send("connect", {
			channel: this.channel,
			id: this.id,
			params: this.params,
		});
	}

	public dispose(): void {
		this.removeAllListeners();
		this.stream.send("disconnect", { id: this.id });
		this.stream.disconnectToChannel(this);
	}
}
