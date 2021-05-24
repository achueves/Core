import "node";
import CommandHandler from "../cmd/CommandHandler";
import Eris from "eris";
import { KnownKeys } from "utilities";
import { BaseCluster } from "clustering";

declare namespace General {
	type ErisPermissions = KnownKeys<typeof Eris.Constants.Permissions>;

	type CommandRestrictions = "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer";
	type CategoryRestrictions = "beta" | "developer";

	type ProvidedClient = Eris.Client | BaseCluster;
	type ProvidedClientExtra = ProvidedClient & {
		// fuck you
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cmd: CommandHandler<any, any, any>;
		getUser?(id: string): Promise<Eris.User | null>;
		getGuild?(id: string): Promise<Eris.Guild | null>;
		typing?: Record<string, NodeJS.Timeout>;
	};

	interface ConfigLike {
		beta: boolean;
		developers: Array<string>;
		client: {
			supportServerId: string;
		};
	}
}

export = General;
