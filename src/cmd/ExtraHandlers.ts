import Command from "./Command";
import EmbedBuilder from "../general/EmbedBuilder";
import Language, { Languages } from "../general/Language";
import CommandError from "./CommandError";
import defaultEmojis from "../general/defaultEmojis.json";
import CoreClient from "../CoreClient";
import ExtendedMessage from "../general/ExtendedMessage";
import { Colors } from "../general/Constants";
import { Time } from "@uwu-codes/utils";

export default class ExtraHandlers<C extends CoreClient = CoreClient> {
	constructor() { }

	async checkPermissions(client: C, msg: ExtendedMessage, cmd: Command<C>, developers: string[], lang: Languages) {
		if (!("guild" in msg.channel)) return;
		const bot = msg.channel.guild.me;

		const userMissing: ErisPermissions[] = [];
		const botMissing: ErisPermissions[] = [];

		if (!developers.includes(msg.author.id)) for (const perm of cmd.permissions.user) if (!msg.member!.permissions.has(perm)) userMissing.push(perm);
		for (const perm of cmd.permissions.bot) if (!bot.permissions.has(perm)) botMissing.push(perm);

		if (userMissing.length > 0) {
			const v = await cmd.runOverride("permissionError", client, msg, cmd, "user", userMissing);
			if (v === "DEFAULT") {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle(`{lang:other.commandChecks.permission.user.title|${userMissing.length === 1 ? "" : "s"}}`)
						.setDescription(`{lang:other.commandChecks.permission.user.description|${userMissing.length === 1 ? "" : "s"}|${userMissing.join(", ")}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.setFooter("NPM loves you, and so do we.", client.user.avatarURL)
						.toJSON()
				});
			}

			return false;
		}

		if (botMissing.length > 0) {
			const v = await cmd.runOverride("permissionError", client, msg, cmd, "bot", userMissing);
			if (v === "DEFAULT") {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle(`{lang:other.commandChecks.permission.bot.title|${botMissing.length === 1 ? "" : "s"}}`)
						.setDescription(`{lang:other.commandChecks.permission.bot.description|${botMissing.length === 1 ? "" : "s"}|${botMissing.join(", ")}}`)
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.setFooter("NPM loves you, and so do we.", client.user.avatarURL)
						.toJSON()
				});
			}

			return false;
		}

		return true;
	}

	async runHelp(client: C, msg: ExtendedMessage, cmd: Command<C>) {
		const v = await cmd.runOverride("help", client, msg, cmd);

		if (v === "DEFAULT") {
			const u = cmd.usage || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.usage`);
			await msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTitle("\u274c {lang:other.words.command$ucwords$} {lang:other.words.help$ucwords$}")
					.setDescription([
						"**{lang:other.words.info$ucwords$}**",
						"**{lang:other.words.restrictions$ucwords$}**",
						"{lang:other.help.green}",
						"{lang:other.help.red}",
						"```diff",
						...Object.values(client.cmd.restrictions).map(r =>
							`${cmd.restrictions.includes(r.Label) ? "+" : "-"} {lang:other.commandChecks.restrictions.${r.Label}.name}`
						).sort((a, b) => a.startsWith("-") ? 1 : -1),
						"```",
						"",
						"**{lang:other.words.bot$ucwords$} {lang:other.words.permissions$ucwords$}**",
						"```bf",
						...(cmd.permissions.bot.length === 0 ? ["> {lang:other.words.none$upper$}"] : cmd.permissions.bot.map(p => `> {lang:other.permissions.${p}}`)),
						"```",
						"",
						"**{lang:other.words.user$ucwords$} {lang:other.words.permissions$ucwords$}**",
						"```bf",
						...(cmd.permissions.user.length === 0 ? ["> {lang:other.words.none$upper$}"] : cmd.permissions.user.map(p => `> {lang:other.permissions.${p}}`)),
						"```",
						"",
						"**{lang:other.words.extra$ucwords$}**",
						`{lang:other.words.usage$ucwords$}: \`${msg.prefix}${cmd.triggers[0]}${!u ? "" : ` ${u}`}\``,
						`{lang:other.words.aliases$ucwords$}: ${cmd.triggers.slice(1).join(", ") || "**{lang:other.words.none$upper$}**"}`,
						`{lang:other.words.normal$ucwords$} {lang:other.words.cooldown$ucwords$}: ${Time.ms(cmd.cooldown, true)}`,
						`{lang:other.words.donator$ucwords$} {lang:other.words.cooldown$ucwords$}: ${Time.ms(cmd.donatorCooldown, true)}`,
						`{lang:other.words.category$ucwords$}: ${cmd.category.name}`
					].join("\n"))
					.setColor(Colors.red)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		}

		return true;
	}

	async runInvalidUsage(client: C, msg: ExtendedMessage, cmd: Command<C>, err: CommandError<"ERR_INVALID_USAGE">) {
		// remove cooldown on invalid usage
		client.cmd.cool.removeCooldown(msg.author.id, cmd);
		const v = await cmd.runOverride("invalidUsage", client, msg, cmd, err);

		if (v === "DEFAULT") {
			const u = cmd.usage || Language.get(msg.gConfig.settings.lang, `${cmd.lang}.usage`);
			await msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTitle("\u274c {lang:other.words.invalid$ucwords$} {lang:other.words.usage$ucwords$}")
					.setDescription([
						"**{lang:other.words.info$ucwords$}**",
						`${defaultEmojis.dot} {lang:other.words.command$ucwords$}: **${cmd.triggers[0]}**`,
						`${defaultEmojis.dot} {lang:other.words.usage$ucwords$}: \`${msg.prefix}${cmd.triggers[0]}${!u ? "" : ` ${u}`}\``,
						`${defaultEmojis.dot} {lang:other.words.description$ucwords$}: ${cmd.description || `{lang:${cmd.lang}.description}`}`,
						`${defaultEmojis.dot} {lang:other.words.category$ucwords$}: **${cmd.category.name}**`,
						`${defaultEmojis.dot} {lang:other.words.provided$ucwords$} {lang:other.words.arguments$ucwords$}:** ${msg.args.join(" ") || "{lang:other.words.none$upper$}"}**`
					].join("\n"))
					.setColor(Colors.red)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		}

		return true;
	}
}
