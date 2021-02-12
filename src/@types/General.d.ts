import "node";
import Eris from "eris";
import { KnownKeys } from "@uwu-codes/utils";

declare namespace General {
	type ErisPermissions = KnownKeys<typeof Eris.Constants.Permissions>;

	type CommandRestrictions = "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer";
	type CategoryRestrictions = "beta" | "developer";
}

export = General;
