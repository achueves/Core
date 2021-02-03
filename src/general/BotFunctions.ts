import EmbedBuilder from "./EmbedBuilder";
import { Languages } from "./Language";
import { Variables } from "@uwu-codes/utils";
import { EmbedOptions } from "eris";
import * as https from "https";
import defaultEmojis from "./defaultEmojis.json";
import Discord from "../@types/Discord";
import { Colors } from "./Constants";
import { Category, Command } from "../..";
import CoreClient from "../CoreClient";
import * as fs from "fs-extra";
import path from "path";

export default class BotFunctions {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Authorize with Discord's OAuth.
	 * @static
	 * @param {string} code - The code of the authorization.
	 * @param {string} [redirectURL] - The redirect URL used.
	 * @returns {Promise<Discord.Oauth2Token>}
	 * @memberof Internal
	 * @example Internal.authorizeOAuth("someCodeFromDiscord, "clientId", "clientSecret", "https://example.com", ["bot]");
	 */
	static async authorizeOAuth(code: string, clientId: string, clientSecret: string, redirectURL: string, scopes: string[]): Promise<Discord.Oauth2Token> {
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
				const data: Buffer[] = [];

				res
					.on("error", b)
					.on("data", (d) => data.push(d))
					.on("end", () => a(JSON.parse(Buffer.concat(data).toString())))
			});
			req.write(`client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${code}&redirect_uri=${redirectURL}&scope=${scopes.join("+")}`);
			req.end();
		});
	}

	/**
	 * Get the user behind a Discord authorization token.
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
					const data: Buffer[] = [];

					res
						.on("error", b)
						.on("data", (d) => data.push(d))
						.on("end", () => a(JSON.parse(Buffer.concat(data).toString())))
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
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json: true): EmbedOptions;
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: false): EmbedBuilder;
	static genErrorEmbed(lang: Languages, type: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL", json?: boolean) {
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
		Object.keys(m).map(v => num = num.toString().replace(new RegExp(v.toString(), "g"), (m as any)[v]));
		return num;
	}

	/**
	 * Load commands in a directory into a category.
	 *
	 * @static
	 * @param {string} dir - The directory to laod from.
	 * @param {Category} cat - The category to add on to.
	 * @memberof Internal
	 * @example Internal.loadCommands("/opt/NPMBot/src/commands/developer", <Category>);
	 */
	static loadCommands<C extends CoreClient = CoreClient>(dir: string, cat: Category<C>) {
		const ext = __filename.split(".").slice(-1)[0];
		fs.readdirSync(dir).filter(f => !fs.lstatSync(`${dir}/${f}`).isDirectory() && f.endsWith(ext) && f !== `index.${ext}`).map(f => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			let c = require(`${dir}/${f}`);
			if (c.default) c = c.default;
			if (c instanceof Command) cat.addCommand(c);
			else throw new TypeError(`Invalid command in file "${path.resolve(`${dir}/${f}`)}"`);
		});
	}
}
