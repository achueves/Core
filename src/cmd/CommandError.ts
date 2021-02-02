import { Strings } from "@uwu-codes/utils";
import Eris from "eris";
import CoreClient from "../CoreClient";
import Category from "./Category";
import Command from "./Command";

export default class CommandError<N extends "ERR_INVALID_USAGE" = any, C extends CoreClient = CoreClient> extends Error {
	cmd: Command<C>;
	message: N;
	extra: string;
	constructor(type: N, cmd: Command<C>, extra?: string) {
		super(type);
		this.name = "CommandError";
		this.cmd = cmd;
		this.extra = extra ?? "";
	}
}

export class ReloadError<T extends ("command" | "category"), C extends CoreClient = CoreClient> extends Error {
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
