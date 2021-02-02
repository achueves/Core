import Category from "./Category";
import Command from "./Command";
import * as Restrictions from "./Restrictions";
import ExtraHandlers from "./ExtraHandlers";
import CooldownHandler from "./CooldownHandler";
import AntiSpam from "./AntiSpam";
import path from "path";
import CoreClient from "../CoreClient";


export default class CommandHandler<C extends CoreClient = CoreClient> {
	#cats: Category<C>[];
	#extra: ExtraHandlers<C>;
	#cool: CooldownHandler<C>;
	#anti: AntiSpam;
	constructor() {
		this.#cats = [];
		this.#extra = new ExtraHandlers<C>();
		this.#cool = new CooldownHandler<C>();
		this.#anti = new AntiSpam();
	}

	get handlers() {
		return this.#extra;
	}
	get cool() {
		return this.#cool;
	}
	get anti() {
		return this.#anti;
	}
	get restrictions() {
		return Restrictions;
	}
	get categories() {
		return [...this.#cats];
	}
	get commands(): Command<C>[] {
		return [...this.#cats.reduce((a, b) => a.concat(b.commands), [] as Command<C>[])];
	}
	get triggers(): Array<ArrayOneOrMore<string>> {
		return [...this.#cats.reduce((a, b) => a.concat(b.commands.reduce((c, d) => c.concat(d.triggers), [] as Array<ArrayOneOrMore<string>>)), [] as Array<ArrayOneOrMore<string>>)];
	}
	get categoryNames() {
		return this.#cats.map(c => c.name);
	}

	getCategory(data: string) {
		if (!data) throw new TypeError("Missing category.");
		return this.#cats.find(c => c.name === data) || null;
	}

	addCategory(data: Category<C>) {
		if (!data) throw new TypeError("Missing category.");
		if (this.categoryNames.includes(data.name)) throw new TypeError(`Duplicate category "${data.name}" in file "${data.file}" (duplicate: ${this.#cats.find(c => c.name === data.name)!.file})`);
		for (const cmd of data.commands) {
			for (const cmd2 of this.commands) {
				if (cmd2.triggers.some(t => cmd.triggers.includes(t))) throw new TypeError(`Duplicate command "${cmd.triggers[0]}" (file: ${cmd.file}), duplicate file: ${cmd2.file}`);
			}
		}
		console.debug(["Command Handler"], `Added the category ${data.name} with ${data.commands.length} command${data.commands.length === 1 ? "" : "s"}.`);
		this.#cats.push(data);
		return true;
	}

	removeCategory(data: Category<C> | string) {
		if (!data) throw new TypeError("Missing category.");
		if (typeof data === "string") data = this.#cats.find(c => c.name === data)!;
		if (!data || !this.#cats.includes(data)) return false;
		console.debug(["Command Handler"], `Remove the category ${data.name}.`);
		this.#cats.splice(this.#cats.indexOf(data), 1);
		return true;
	}

	getCommand(data: Command<C> | string) {
		if (!data) throw new TypeError("Missing command.");
		const cmd = this.commands.find(c => c.triggers.some(t => data instanceof Command ? data.triggers.includes(t) : data === t));

		if (!cmd) return {
			cmd: null,
			cat: null
		};

		return {
			cmd,
			cat: cmd.category
		};
	}

	reloadCategory(cat: string | Category<C>) {
		if (typeof cat !== "string") cat = cat.name;

		const c = this.getCategory(cat);
		if (!c) return false;

		this.removeCategory(c.name);

		let i = 0;

		Object.keys(require.cache)
			.filter(k => k.startsWith(c.file.split(path.sep.replace(/\\/, "\\\\")).slice(0, -1).join(path.sep.replace(/\\/, "\\\\")))) // because windows
			.map(f => (i++, delete require.cache[require.resolve(f)]));

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const f = require(c.file).default;

		this.addCategory(f);

		return true;
	}
}
