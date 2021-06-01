/* eslint-disable @typescript-eslint/unified-signatures */
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import { DeepUnion } from "../db";
import { DeepPartial, WithoutFunctions } from "utilities";
import { WriteResult } from "rethinkdb";

declare namespace DatabaseTypes {
	type ConfigDataTypes<T, O extends (string | number) = never> = Omit<WithoutFunctions<{ [K in keyof T]: T[K]; }>, O>;
	type ConfigEditTypes<T, O extends (string | number) = never> = DeepPartial<ConfigDataTypes<T, O>>;
	interface Modifiers {
		$pull?: Record<string, unknown | Array<unknown>>;
		$push?: Record<string, unknown | Array<unknown>>;
	}

	interface DBLike {
		get<T = GuildConfig>(table: "guilds", id: string, raw: true, db?: string): Promise<ConfigDataTypes<T, never> | null>;
		get<T = GuildConfig>(table: "guilds", id: string, raw?: false, db?: string): Promise<T | null>;
		get<T = UserConfig>(table: "users", id: string, raw: true, db?: string): Promise<ConfigDataTypes<T, never> | null>;
		get<T = UserConfig>(table: "users", id: string, raw?: false, db?: string): Promise<T | null>;
		get<T = unknown>(table: string, id: string, raw?: true, db?: string): Promise<ConfigDataTypes<T, never> | null>;

		filter<T = GuildConfig>(table: "guilds", filter: DeepPartial<ConfigDataTypes<T, never>>, db?: string): Promise<Array<ConfigDataTypes<T, never>>>;
		filter<T = UserConfig>(table: "users", filter: DeepPartial<ConfigDataTypes<T, never>>, db?: string): Promise<Array<ConfigDataTypes<T, never>>>;
		filter<T = unknown>(table: string, filter: DeepPartial<ConfigDataTypes<T, never>>,db?: string): Promise<Array<ConfigDataTypes<T, never>>>;

		update<T = GuildConfig>(table: "guilds", id: string, data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
		update<T = GuildConfig>(table: "guilds", id: string, data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		update<T = UserConfig>(table: "users", id: string, data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
		update<T = UserConfig>(table: "users", id: string, data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		update<T = unknown>(table: string, id: string, data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: true, db?: string): Promise<WriteResult>;

		replace<T = GuildConfig>(table: "guilds", id: string, data: Omit<DeepUnion<T, undefined>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
		replace<T = GuildConfig>(table: "guilds", id: string, data: Omit<DeepUnion<T, undefined>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		replace<T = UserConfig>(table: "users", id: string, data: Omit<DeepUnion<T, undefined>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
		replace<T = UserConfig>(table: "users", id: string, data: Omit<DeepUnion<T, undefined>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		replace<T = unknown>(table: string, id: string, data: Omit<DeepUnion<T, undefined>, "id"> & Modifiers, raw?: true, db?: string): Promise<WriteResult>;

		insert<T = GuildConfig>(table: "guilds", id: string, data: T, raw: true, db?: string): Promise<WriteResult>;
		insert<T = GuildConfig>(table: "guilds", id: string, data: T, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		insert<T = UserConfig>(table: "users", id: string, data: T, raw: true, db?: string): Promise<WriteResult>;
		insert<T = UserConfig>(table: "users", id: string, data: T, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
		insert<T = unknown>(table: string, id: string, data: T, raw?: true, db?: string): Promise<WriteResult>;

		delete(table: string, id: string, db?: string): Promise<WriteResult>;
	}
}

export = DatabaseTypes;
