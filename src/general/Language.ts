import * as fs from "fs-extra";
import dot from "dot-object";
import JSON5 from "json5";
import { AnyObject, Strings } from "@uwu-codes/utils";
import p from "path";

/*
FORMAT (parsing):
Normal - {lang:some.language.location}
Formatting - {lang:some.language.location|arg} (use {0} and up for arg locations)
Modifiers - {lang:some.language.location$ucwords$}
Both formatting and modifiers can be combined. Order does not matter, prefer formatting then modifiers.
*/

export class LanguageError extends Error {
	constructor(name: string, message: string) {
		super(message);
		if (!name.toLowerCase().endsWith("error")) name += "Error";
		this.name = name;
	}
}

export type Languages = typeof Language["LANGUAGES"][number];
export default class Language {
	static DIR: string | null = null;
	// this shouldn't really be hardcoded but typings
	static LANGUAGES = [
		"en"
	] as const;
	static MODIFIERS = {
		ucwords: (str: string) => Strings.ucwords(str),
		upper: (str: string) => str.toUpperCase(),
		lower: (str: string) => str.toLowerCase(),
		italic: (str: string) => `*${str}*`,
		bold: (str: string) => `**${str}**`
	};

	static setDir(dir: string) {
		this.DIR = dir;
	}

	static get(lang: Languages, path: string, formatArgs: Array<string | number>, nullOnNotFound: true, random: true, returnPathOnly?: boolean): string | null;
	static get(lang: Languages, path: string, formatArgs?: Array<string | number>, nullOnNotFound?: false, random?: true, returnPathOnly?: boolean): string;
	static get(lang: Languages, path: string, formatArgs: Array<string | number>, nullOnNotFound: true, random?: false, returnPathOnly?: boolean): Array<string> | null;
	static get(lang: Languages, path: string, formatArgs: Array<string | number>, nullOnNotFound?: false, random?: false, returnPathOnly?: boolean): Array<string>;
	static get(lang: Languages, path: string, formatArgs?: Array<string | number>, nullOnNotFound?: boolean, random?: boolean, returnPathOnly?: boolean): string | Array<string> | null {
		if (this.DIR === null) throw new TypeError("Language.DIR was not set.");
		if (!fs.existsSync(`${this.DIR}/${lang}`)) throw new TypeError(`Directory "${p.resolve(`${this.DIR}/${lang}`)}" for language "${lang}" does not exist.`);
		function loop(dir: string, parts: Array<string>): string | Array<string> | null {
			if (fs.existsSync(`${dir}/${parts[0]}.json`)) {
				const f = JSON5.parse<AnyObject>(fs.readFileSync(`${dir}/${parts[0]}.json`).toString()),
					v = dot.pick(parts.slice(1).join("."), f) as string;
				if (v) return v;
			}

			if (!fs.existsSync(`${dir}/${parts[0]}`)) {
				if (!fs.existsSync(`${dir}/${parts[0]}.json`)) return null;
				const f = JSON5.parse<AnyObject>(fs.readFileSync(`${dir}/${parts[0]}.json`).toString());
				return dot.pick(parts.slice(1).join("."), f) as string ?? null;
			} else return loop(`${dir}/${parts[0]}`, parts.slice(1));
		}

		let str = loop(`${this.DIR}/${lang}`, path.split("."));
		if (str === null) return nullOnNotFound ? null : returnPathOnly ? path : `{lang:${path}}`;

		if (Array.isArray(str)) {
			if (random === true) {
				str = str[Math.floor(Math.random() * str.length)];
				if (formatArgs) str = Strings.formatString(str, formatArgs);
			} else
			if (formatArgs) str.map((s, i) => ((str as Array<string>)[i]) = Strings.formatString(s, formatArgs));


			return str;
		} else {
			if (formatArgs) str = Strings.formatString(str, formatArgs);
			return str;
		}
	}

	static parseString(lang: Languages, str: string): string {
		if (!str) return "";
		const a = /{lang:(.*?)}/.exec(str);
		if (!a) return str;
		const b = a[0];
		let c = a[1];
		const mods: Array<(r: string) => string> = [];
		(c.match(/\$(.*?)\$/g) || []).map((mod) => {
			mod = mod.replace(/\$/g, "");
			c = c.replace(`$${mod}$`, "");
			const j = this.MODIFIERS[mod as keyof typeof Language["MODIFIERS"]];
			if (!j) {
				const e = new LanguageError("UnknownModifierError", `Unknown modifier "${mod}"`).stack;
				// would be Logger but circular dependencies suck
				console.warn(e);
			} else mods.push(j);
		});
		const d = c.split("|");
		let l = this.get(lang, d[0], d.slice(1), true, true);
		if (l === null) {
			l = b.replace(":", "\u200b:").split("|")[0].split("$")[0];
			if (!l.replace("\u200b", "").startsWith("{lang:")) l = `{lang:\u200b${l}`;
			if (!l.endsWith("}")) l += "}";
		} else mods.map((mod) => l = mod(l!));
		str = str.replace(b, l);
		return this.parseString(lang, str);
	}
}
