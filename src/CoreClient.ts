import { CommandHelper } from "@uwu-codes/discord-slash-commands";
import Eris from "eris";
import CommandHandler from "./cmd/CommandHandler";
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
	constructor(token: string, options?: Eris.ClientOptions) {
		super(token, options);
		this.w = new WebhookStore(this);
		this.h = new CommandHelper(this.token!, this.user.id);
		this.cmd = new CommandHandler();
		this.events = new Map();
		this.col = new MessageCollector(this);
	}
}

export { CoreClient, ConfigLike };
