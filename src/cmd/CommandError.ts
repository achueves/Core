import Category from "./Category";
import Command from "./Command";
import { ProvidedClientExtra } from "../@types/General";
import { Strings } from "@uwu-codes/utils";

export default class CommandError<C extends ProvidedClientExtra> extends Error {
	cmd: Command<C>;
	// defined in super
	message!: "INVALID_USAGE";
	extra: string;
	constructor(type: "INVALID_USAGE", cmd: Command<C>, extra?: string) {
		super(type);
		this.name = "CommandError";
		this.cmd = cmd;
		this.extra = extra ?? "";
	}
}

export class ReloadError<T extends ("command" | "category"), C extends ProvidedClientExtra> extends Error {
	type: T;
	info: T extends "command" ? Command<C> : Category<C>;
	constructor(message: string, type: T, info: ReloadError<T, C>["info"]) {
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
