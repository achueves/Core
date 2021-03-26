import "node";
import { CommandHandler } from "../..";
import Eris from "eris";
import { KnownKeys } from "@uwu-codes/utils";
import { BaseClusterWorker } from "eris-fleet";

declare namespace General {
	type ErisPermissions = KnownKeys<typeof Eris.Constants.Permissions>;

	type CommandRestrictions = "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer";
	type CategoryRestrictions = "beta" | "developer";

	type ProvidedClient = Eris.Client | BaseClusterWorker;
	type ProvidedClientExtra = ProvidedClient & {
		// fuck you
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cmd: CommandHandler<any>;
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
