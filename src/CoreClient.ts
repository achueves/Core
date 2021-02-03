import { CommandHelper } from "@uwu-codes/discord-slash-commands";
import Eris from "eris";
import CommandHandler from "./cmd/CommandHandler";
import db from "./db";
import ClientEvent from "./general/ClientEvent";
import MessageCollector from "./general/MessageCollector";
import WebhookStore from "./general/WebhookStore";
interface ConfigLike {
	beta: boolean;
	developers: string[];
	defaults: {
		config: Record<"user" | "guild", any>;
	};
	client: {
		supportServerId: string;
	};
}

export default abstract class CoreClient extends Eris.Client {
	abstract cnf: ConfigLike | null = null;
	w: WebhookStore;
	h: CommandHelper;
	cmd: CommandHandler<this>;
	events: Map<string, {
		handler: (...args: any[]) => void;
		event: ClientEvent<CoreClient>;
	}>;
	col: MessageCollector;
	typing: Map<string, NodeJS.Timeout>;
	constructor(token: string, options?: Eris.ClientOptions) {
		super(token, options);
		this.w = new WebhookStore(this);
		this.h = new CommandHelper(this.token!, this.user.id);
		this.cmd = new CommandHandler();
		this.events = new Map();
		this.col = new MessageCollector(this);
		this.typing = new Map();
		db.setClient(this);
	}

	async getUser(id: string) {
		if (this.users.has(id)) return this.users.get(id)!;
		const user = await this.getRESTUser(id).catch(() => null);
		if (user !== null) this.users.set(id, user);
		return user;
	}

	async getGuild(id: string) {
		if (this.guilds.has(id)) return this.guilds.get(id)!;
		const guild = await this.getRESTGuild(id).catch(() => null);
		return guild;
	}

	async startTyping(id: string, rounds = 6) {
		const per = 7;
		let r = 1;
		await this.sendChannelTyping(id);
		this.typing.set(id, setInterval(async () => {
			r++;
			await this.sendChannelTyping(id);
			if (r >= rounds) this.stopTyping(id);
		}, per * 1e3));
	}

	async stopTyping(id: string) {
		clearInterval(this.typing.get(id)!);
		this.typing.delete(id);
	}
}

export { CoreClient, ConfigLike };
