// / <reference path="../@types/global.d.ts" />
import Command from "./Command";
import { ReloadError } from "./CommandError";
import { CategoryRestrictions, ProvidedClientExtra } from "../@types/General";
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import * as fs from "fs-extra";
import { ModuleImport } from "@uwu-codes/utils";
import path from "path";

export default class Category<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig> {
	name: string;
	displayName: string;
	description: string;
	restrictions: Array<CategoryRestrictions>;
	file: string;
	commands: Array<Command<C, UC, GC>>;
	constructor(name: string, file: string) {
		this.name = name;
		this.displayName = "";
		this.file = file;
		this.commands = [];
		this.description = "";
		this.restrictions = [];

	}

	get triggers(): Array<string> {
		return this.commands.reduce((a, b) => a.concat(b.triggers), [] as Array<string>);
	}

	get tsFile() {
		return `${path.dirname(this.file).replace(/build(\\|\/)/, "")}/${path.basename(this.file).replace(/.js/, ".ts")}`;
	}

	setDisplayName(data: Category<C, UC, GC>["displayName"]) {
		this.displayName = data;
		return this;
	}

	setRestrictions(data: Category<C, UC, GC>["restrictions"]) {
		this.restrictions = data ?? [];
		return this;
	}

	setDescription(data: Category<C, UC, GC>["description"]) {
		this.description = data;
		return this;
	}

	addCommand(data: Command<C, UC, GC>) {
		if (!data) throw new TypeError("Missing command.");
		// I could do this differently but nah
		for (const t of data.triggers) if (this.triggers.includes(t)) throw new TypeError(`Duplicate trigger "${t}" in command "${data.tsFile}" (duplicate: ${this.commands.find((c) => c.triggers.includes(t))!.tsFile})`);
		data.setCategory(this);
		this.commands.push(data);
		return true;
	}

	removeCommand(data: Command<C, UC, GC> | string) {
		if (typeof data === "string") data = this.commands.find((c) => c.triggers.includes(data as string))!;
		if (!data || !this.commands.includes(data)) return false;
		this.commands.splice(this.commands.indexOf(data), 1);
		return true;
	}

	async reloadCommand(cmd: string | Command<C, UC, GC>, force?: boolean) {
		if (cmd instanceof Command) cmd = cmd.triggers[0];
		const c = this.commands.find((d) => d.triggers.includes(cmd as string));
		if (!c) return false;
		if (!force) {
			if (!fs.existsSync(c.file)) throw new ReloadError("The JS command file does not exist, refusing to reload.", "command", c);
			if (!fs.existsSync(c.tsFile)) throw new ReloadError<"command", C, UC, GC>("The TS command file does not exist, refusing to reload.", "command", c);
		}
		delete require.cache[require.resolve(c.file)];
		const { default: f } = await import(c.file) as ModuleImport<Command<C, UC, GC>>;
		this.removeCommand(cmd);
		this.addCommand(f);
		return true;
	}
}
