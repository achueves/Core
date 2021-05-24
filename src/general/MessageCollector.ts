import getErisClient from "./getErisClient";
import { ProvidedClient, ProvidedClientExtra } from "../@types/General";
import Eris from "eris";
import { AnyFunction } from "utilities";

export default class MessageCollector<C extends ProvidedClient | ProvidedClientExtra> {
	client: C;
	collectors: Array<{
		channel: string;
		filter: (msg: Eris.Message<Eris.TextableChannel>) => boolean;
		resolve: (value: Array<Eris.Message<Eris.TextableChannel>> | Eris.Message<Eris.TextableChannel>) => void;
		limit: number;
		messages: Array<Eris.Message<Eris.TextableChannel>>;
		timeout: number;
		i: NodeJS.Timeout;
	}>;
	constructor(client: C) {
		this.client = client;
		this.collectors = [];
		getErisClient(this.client).on("messageCreate", this.processMessage.bind(this));
	}

	processMessage(msg: Eris.Message<Eris.TextableChannel>) {
		if (msg.author.bot) return;
		const collectors = this.collectors.filter((col) => col.channel === msg.channel.id);
		for (const c of collectors) {
			if (c && c.filter(msg)) c.messages.push(msg);
			if (c.messages.length >= c.limit) {
				clearTimeout(c.i);
				c.resolve(c.limit === 1 ? c.messages[0] : c.messages);
			}
		}
	}

	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter: (msg: Eris.Message<Eris.TextableChannel>) => boolean, limit: number): Promise<Array<Eris.Message<T>>>;
	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter?: (msg: Eris.Message<Eris.TextableChannel>) => boolean, limit?: 1): Promise<Eris.Message<T> | null>;
	async awaitMessages<T extends Eris.TextableChannel = Eris.GuildTextableChannel>(channelId: string, timeout: number, filter?: (msg: Eris.Message<Eris.TextableChannel>) => boolean, limit?: number): Promise<Array<Eris.Message<T>> | Eris.Message<T> | null> {
		return new Promise((a) => {
			this.collectors.push({
				channel: channelId,
				filter: filter ?? (() => true),
				resolve: a as AnyFunction,
				limit: limit || 1,
				messages: [],
				timeout,
				i: setTimeout(a.bind(null, [undefined, 1].includes(limit) ? null : []), timeout)
			});
		});
	}
}

export { MessageCollector };
