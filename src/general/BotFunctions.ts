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
import Eris, { EmbedOptions, Role } from "eris";
import { AnyObject,  ModuleImport,  Variables } from "@uwu-codes/utils";
import * as fs from "fs-extra";
import * as https from "node:https";
import path from "node:path";

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
	 * @returns {Promise<Discord.Oauth2Info>}
	 * @memberof BotFunctions
	 * @example BotFunctions.authorizeOAuth("someCodeFromDiscord, "clientId", "clientSecret", "https://example.com", ["bot]");
	 */
	static async authorizeOAuth(code: string, clientId: string, clientSecret: string, redirectURL: string, scopes: Array<string>): Promise<Discord.Oauth2Info> {
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
	 * @memberof BotFunctions
	 * @example BotFunctions.getSelfUser("discordBearerToken");
	 */
	static async getSelfUser(auth: string): Promise<Discord.APISelfUser & { getGuilds: () => Array<Discord.APIGuild>;}> {
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
						.on("end", () => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							const v = JSON.parse(Buffer.concat(data).toString());
							Object.defineProperty(v, "getGuilds", {
								value: BotFunctions.getSelfGuilds.bind(BotFunctions, auth)
							});
							return a(v);
						});
				})
				.end()
		);
	}

	/**
	 * Get the user behind a Discord authorization token.
	 *
	 * @static
	 * @param {string} auth - The bearer token.
	 * @returns
	 * @memberof BotFunctions
	 * @example BotFunctions.getSelfUser("discordBearerToken");
	 */
	static async getSelfGuilds(auth: string): Promise<Array<Discord.APIGuild>> {
		return new Promise((a, b) =>
			https
				.request({
					method: "GET",
					host: "discord.com",
					path: "/api/v8/users/@me/guilds",
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
	 * @memberof BotFunctions
	 * @example BotFunctions.genErrorEmbed("en", "INVALID_USER");
	 * @example BotFunctions.genErrorEmbed("en", "INVALID_MEMBER", true);
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
	 * @memberof BotFunctions
	 * @example BotFunctions.numberToEmoji(1);
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
	 * @memberof BotFunctions
	 * @example BotFunctions.loadCommands("/opt/FurryBot/src/commands/developer", <Category>);
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

	static getMessageFlags(msg: Eris.Message) {
		return Object.entries(Eris.Constants.MessageFlags).map(([f, v]) => ({
			[f]: ((msg.flags ?? 0) & v) === v
		})).reduce((a, b) => ({ ...a, ...b }), {}) as {
			[K in keyof typeof Eris.Constants.MessageFlags]: boolean;
		};
	}

	/**
	 * Extra argument parsing for some commands.
	 *
	 * @static
	 * @param {ExtendedMessage} msg - The message instance.
	 * @returns {string}
	 * @memberof BotFunctions
	 * @example BotFunctions.extraArgParsing(<ExtendedMessage>);
	 */
	static extraArgParsing<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(msg: ExtendedMessage<C, UC, GC>, str = msg.args.join(" ")) {
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
	 * @memberof BotFunctions
	 * @example BotFunctions.mentionOrIdToUsername(<ExtendedMessage>);
	 */
	static mentionOrIdToUsername<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(msg: ExtendedMessage<C, UC, GC>, str = msg.args.join(" ")) {
		(str
			.split(" ")
			.map(k => /(?:<@!?)?([0-9]{15,21})>?/i.exec(k))
			.filter(v => v !== null) as Array<RegExpExecArray>)
			.map(([k, id]) => [k, msg.channel.guild.members.get(id)?.nick || (getErisClient(msg.client).users.get(id) || msg.channel.guild.members.get(id))?.username])
			.filter(([, v]) => v !== undefined)
			.map(([k, u]) => str = str.replace(k!, u!));

		return str;
	}

	static memeArgParsing<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig>(msg: ExtendedMessage<C, UC, GC>, str = msg.args.join(" ")) {
		return this.mentionOrIdToUsername(msg, this.extraArgParsing(msg, str));
	}

	/**
	 * @typedef {object} CompareResult
	 * @prop {boolean} higher
	 * @prop {boolean} same
	 * @prop {boolean} lower
	 */

	/**
	 * @typedef {object} CompareMembersResult
	 * @prop {CompareResult} member1
	 * @prop {CompareResult} member2
	 */

	/**
	 * Compare one member with another.
	 *
	 * @static
	 * @param {Eris.Member} member1 - The first member of the comparison.
	 * @param {Eris.Member} member2 - The second member of the comparison.
	 * @returns {CompareMembersResult}
	 * @memberof BotFunctions
	 * @example BotFunctions.compareMembers(<Member1>, <Member2>);
	 */
	static compareMembers(member1: Eris.Member, member2: Eris.Member) {
		const g = member1.guild;
		const m1r = member1.roles.map(r => g.roles.get(r)!.position).sort((a, b) => b - a)[0] || 0;
		const m2r = member2.roles.map(r => g.roles.get(r)!.position).sort((a, b) => b - a)[0] || 0;
		if (member1.id === g.ownerID) return {
			member1: {
				higher: true,
				same: false,
				lower: false
			},
			member2: {
				higher: false,
				same: false,
				lower: true
			}
		};

		if (member2.id === g.ownerID || m1r < m2r) return {
			member1: {
				higher: false,
				same: false,
				lower: true
			},
			member2: {
				higher: true,
				same: false,
				lower: false
			}
		};

		if (m1r > m2r) return {
			member1: {
				higher: true,
				same: false,
				lower: false
			},
			member2: {
				higher: false,
				same: false,
				lower: true
			}
		};

		if (member1.id === member2.id || m1r === m2r) return {
			member1: {
				higher: false,
				same: true,
				lower: false
			},
			member2: {
				higher: false,
				same: true,
				lower: false
			}
		};

		return {
			member1: {
				higher: false,
				same: false,
				lower: false
			},
			member2: {
				higher: false,
				same: false,
				lower: false
			}
		};
	}

	/**
	 * Compare a member with a role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to compare.
	 * @param {Eris.Role} role - The role to compare.
	 * @returns {CompareResult}
	 * @memberof BotFunctions
	 * @example BotFunctions.compareMemberWithRole(<Member>, <Role>);
	 */
	static compareMemberWithRole(member: Eris.Member, role: Eris.Role) {
		const g = member.guild;
		const mr = member.roles.map(r => g.roles.get(r)!.position).sort((a, b) => b - a)[0] || 0;

		if (member.id === g.ownerID || mr > role.position) return {
			higher: true,
			same: false,
			lower: false
		};

		if (mr < role.position) return {
			higher: false,
			same: false,
			lower: true
		};

		if (mr === role.position) return {
			higher: false,
			same: true,
			lower: false
		};

		return {
			higher: false,
			same: false,
			lower: false
		};
	}

	/**
	 * Get a member's top role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to get the top role of.
	 * @param {(value: Eris.Role, index: number, array: Array<Eris.Role>) => boolean} [filter] - Filter roles.
	 * @returns {(Eris.Role | undefined)}
	 * @memberof BotFunctions
	 * @example BotFunctions.getTopRole(<Member>);
	 * @example BotFunctions.getTopRole(<Member>, (role) => role.id !== "someId");
	 */
	static getTopRole(member: Eris.Member, f?: (value: Eris.Role, index: number, array: Array<Eris.Role>) => boolean) {
		if (!f) f = () => true;
		return member.roles.map(r => member.guild.roles.get(r)!).filter(f).sort((a, b) => b.position - a.position)[0];
	}

	/**
	 * Get a member's color role.
	 *
	 * @static
	 * @param {Eris.Member} member - The member to get the color role of.
	 * @returns {Eris.Role}
	 * @memberof BotFunctions
	 * @example BotFunctions.getColorRole(<Member>);
	 */
	static getColorRole(member: Eris.Member) {
		return this.getTopRole(member, (role) => role.color !== 0);
	}
}
