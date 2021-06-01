import Category from "./Category";
import Command from "./Command";
import { ProvidedClientExtra } from "../@types/General";
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import { Strings } from "utilities";

export default class CommandError<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig> extends Error {
	cmd: Command<C, UC, GC>;
	extra: string;
	constructor(type: "INVALID_USAGE", cmd: Command<C, UC, GC>, extra?: string) {
		super(type);
		this.name = "CommandError";
		this.cmd = cmd;
		this.extra = extra ?? "";
	}
}

export class ReloadError<T extends ("command" | "category"), C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig> extends Error {
	type: T;
	info: T extends "command" ? Command<C, UC, GC> : Category<C, UC, GC>;
	constructor(message: string, type: T, info: ReloadError<T, C, UC, GC>["info"]) {
		super(message);
		this.name = `ReloadError[${Strings.ucwords(type)}]`;
		this.type = type;
		this.info = info;
	}

	get file() {
		return this.info.file;
	}
	get tsFile() {
		return this.info.tsFile;
	}
}
