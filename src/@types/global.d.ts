import "node";
import Eris from "eris";

declare global {
	type ThenReturnType<T extends (...args: any[]) => any> = ReturnType<T> extends Promise<infer U> ? U : never;
	type ArrayOneOrMore<T> = T[] & {
		0: T;
	};
	type KnownKeys<T> = {
		[K in keyof T]: string extends K ? never : number extends K ? never : K
	} extends { [_ in keyof T]: infer U } ? U : never;
	type ErisPermissions = KnownKeys<typeof Eris.Constants.Permissions>;

	type CommandRestrictions = "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer";
	type CategoryRestrictions = "beta" | "developer";
}
