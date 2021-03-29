import EmbedBuilder from "./EmbedBuilder";
import defaultEmojis from "./defaultEmojis.json";
import { Colors } from "./Constants";
import getErisClient from "./getErisClient";
import Discord from "../@types/Discord";
import Category from "../cmd/Category";
import { ProvidedClientExtra } from "../@types/General";
import UserConfig from "../db/Models/UserConfig";
import GuildConfig from "../db/Models/GuildConfig";
import Command from "../cmd/Command";
import { ExtendedMessage } from "..";
import Eris, { EmbedOptions } from "eris";
import { AnyObject,  ModuleImport,  Variables } from "@uwu-codes/utils";
import * as fs from "fs-extra";
import * as https from "https";
import path from "path";

export default class BotFunctions {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Authorize with Discord's OAuth.
	 *
	 * @static
	 * @param {string} code - The code of the authorization.
	 * @param {string} [redirectURL] - The redirect URL used.
	 * @returns {Promise<Discord.Oauth2Token>}
	 * @memberof Internal
	 * @example Internal.authorizeOAuth("someCodeFromDiscord, "clientId", "clientSecret", "https://example.com", ["bot]");
	 */
	static async authorizeOAuth(code: string, clientId: string, clientSecret: string, redirectURL: string, scopes: Array<string>): Promise<Discord.Oauth2Token> {
		return new Promise((a, b) => {
			const req = https.request({
				method: "GET",
				host: "discord.com",
				path: "/api/oauth2/token",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"User-Agent": Variables.USER_AGENT
				}
			}, (res) => {
				const data: Array<Buffer> = [];

				res
					.on("error", b)
					.on("data", (d) => data.push(d))
					.on("end", () => a(JSON.parse(Buffer.concat(data).toString())));
			});
			req.write(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${code}&redirect_uri=${redirectURL}&scope=${scopes.join("+")}`);
			req.end();
		});
	}

	/**
	 * Get the user behind a Discord authorization token.
	 *
	 * @static
	 * @param {string} auth - The bearer token.
	 * @returns
	 * @memberof Internal
	 * @example Internal.getSelfUser("discordBearerToken");
	 */
	static async getSelfUser(auth: string): Promise<Discord.APISelfUser> {
		return new Promise((a, b) =>
			https
				.request({
					method: "GET",
					host: "discord.com",
					path: "/api/v8/users/@me",
					headers: {
						"Authorization": `Bearer ${auth}`,
						"User-Agent": Variables.USER_AGENT
					}
				}, (res) => {
					const data: Array<Buffer> = [];

					res
						.on("error", b)
						.on("data", (d) => data.push(d))
						.on("end", () => a(JSON.parse(Buffer.concat(data).toString())));
				})
				.end()
		);
	}

	/**
	 * Generate an error embed.
	 *
	 * @static
	 * @param {Languages} lang - The language for the embed.
	 * @param {("INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL")} type - The type of the embed.
	 * @param {boolean} [json=false] - If json or {@link Eris#EmbedOptions} should be returned.
	 * @returns {string | Eris.EmbedOptions}
	 * @memberof Utility
	 * @example Utility.genErrorEmbed("en", "INVALID_USER");
	 * @example Utility.genErrorEmbed("en", "INVALID_MEMBER", true);
	 */
	static genErrorEmbed(lang: string, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json: true): EmbedOptions;
	static genErrorEmbed(lang: string, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: false): EmbedBuilder;
	static genErrorEmbed(lang: string, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: boolean) {
		const e = new EmbedBuilder(lang)
			.setTitle(`{lang:other.errorEmbed.${type}.title}`)
			.setDescription(`{lang:other.errorEmbed.${type}.description}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.red);
		return json ? e.toJSON() : e;
	}

	/**
	 * Conver a number into an emoji (single digit only).
	 *
	 * @static
	 * @param {(number | string)} num - The number to convert.
	 * @returns {string}
	 * @memberof Utility
	 * @example Utility.numberToEmoji(1);
	 */
	static numberToEmoji(num: number | string) {
		if (typeof num === "number") num = num.toString();
		const m = {
			0: defaultEmojis.numbers.zero,
			1: defaultEmojis.numbers.one,
			2: defaultEmojis.numbers.two,
			3: defaultEmojis.numbers.three,
			4: defaultEmojis.numbers.four,
			5: defaultEmojis.numbers.five,
			6: defaultEmojis.numbers.six,
			7: defaultEmojis.numbers.seven,
			8: defaultEmojis.numbers.eight,
			9: defaultEmojis.numbers.nine
		};
		Object.keys(m).map((v) => num = num.toString().replace(new RegExp(v.toString(), "g"), (m as AnyObject<string>)[v]));
		return num;
	}

	/**
	 * Load commands in a directory into a category.
	 *
	 * @static
	 * @param {string} dir - The directory to laod from.
	 * @param {Category} cat - The category to add on to.
	 * @memberof Internal
	 * @example Internal.loadCommands("/opt/FurryBot/src/commands/developer", <Category>);
	 */
	static loadCommands<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(dir: string, cat: Category<C, UC, GC>, ext = __filename.split(".").slice(-1)[0]) {
		fs.readdirSync(dir).filter((f) => !fs.lstatSync(`${dir}/${f}`).isDirectory() && f.endsWith(ext) && f !== `index.${ext}`).map((f) => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { default: c } = require(`${dir}/${f}`) as ModuleImport<Command<C, UC, GC>>;
			if (c instanceof Command) cat.addCommand(c);
			else throw new TypeError(`Invalid command in file "${path.resolve(`${dir}/${f}`)}"`);
		});
	}

	static getUserFlags(user: Eris.User) {
		return Object.entries(Eris.Constants.UserFlags).map(([f, v]) => ({
			[f]: ((user.publicFlags ?? 0) & v) === v
		})).reduce((a, b) => ({ ...a, ...b }), {}) as {
			[K in keyof typeof Eris.Constants.UserFlags]: boolean;
		};
	}

	/**
	 * Extra argument parsing for some commands.
	 *
	 * @static
	 * @param {ExtendedMessage} msg - The message instance.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.extraArgParsing(<ExtendedMessage>);
	 */
	static extraArgParsing<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(msg: ExtendedMessage<C, UC, GC>) {
		let str = msg.args.join(" ");

		(str
			.split(" ")
			// throw away mentions
			.filter(k => !/(?:<@!?)([0-9]{15,21})>/i.exec(k))
			.map(k => /([0-9]{15,21})/i.exec(k))
			.filter(v => v !== null) as Array<RegExpExecArray>)
			.map(([k, id]) => [k, `<@!${id}>`])
			.map(([k, u]) => str = str.replace(k, u));

		str
			.split(" ")
			// throw away mentions & ids
			.filter(k => !/(?:<@!?)?([0-9]{15,21})>?/i.exec(k))
			.map(v => [v, msg.channel.guild.members.find(m => Boolean(
				m.username.toLowerCase() === v.toLowerCase() ||
				m.tag.toLowerCase() === v.toLowerCase() ||
				(m.nick && m.nick.toLowerCase() === v.toLowerCase())
			))] as const)
			.filter(([, v]) => v !== undefined)
			.map(([k, u]) => str = str.replace(k, `<@!${u!.id}>`));

		return str;
	}

	/**
	 * Parsing for mention/id to username.
	 *
	 * @static
	 * @param {ExtendedMessage} msg - The message instance.
	 * @returns {string}
	 * @memberof Internal
	 * @example Internal.mentionOrIdToUsername(<ExtendedMessage>);
	 */
	static mentionOrIdToUsername<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(msg: ExtendedMessage<C, UC, GC>) {
		let str = msg.args.join(" ");

		(str
			.split(" ")
			.map(k => /(?:<@!?)?([0-9]{15,21})>?/i.exec(k))
			.filter(v => v !== null) as Array<RegExpExecArray>)
			.map(([k, id]) => [k, (getErisClient(msg.client).users.get(id) || msg.channel.guild.members.get(id))?.username])
			.filter(([, v]) => v !== undefined)
			.map(([k, u]) => str = str.replace(k!, u!));

		return str;
	}
}
