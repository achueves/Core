import Eris from "eris";
import Command from "../cmd/Command";
import CoreClient from "../CoreClient";
import { db } from "../db";
import GuildConfig from "../db/Models/GuildConfig";
import UserConfig from "../db/Models/UserConfig";

export default class ExtendedMessage<C extends CoreClient = CoreClient, T extends Eris.GuildTextableChannel = Eris.GuildTextableChannel> extends Eris.Message<T> {
	client: C;
	slash: boolean;
	slashInfo: {
		id: string;
		token: string;
	} | null;
	gConfig: GuildConfig;
	uConfig: UserConfig;
	args: string[];
	cmd: Command<C> | null;
	prefix: string;
	dashedArgs: {
		value: string[];
		keyValue: Record<string, string>;
	};
	constructor(msg: Eris.Message<Eris.TextableChannel>, client: C, slash?: boolean, slashInfo?: ExtendedMessage["slashInfo"]) {
		if (!("guild" in msg.channel)) return;
		else {
			super({
				channel_id: msg.channel.id,
				guild_id: msg.channel.guild.id,
				mention_everyone: msg.mentionEveryone,
				mention_roles: msg.roleMentions,
				...msg,
				mentions: msg.mentions.map(v => v.id),
				timestamp: new Date(msg.timestamp).toISOString()
			}, client);
		}

		this.client = client;
		this.slash = slash ?? false;
		this.slashInfo = slashInfo ?? null;
	}

	get mentionList() {
		return {
			channels: this.channelMentions.map(c => this.channel.guild.channels.get(c) || null).filter(c => c),
			channelsRaw: this.channelMentions,
			roles: this.roleMentions.map(r => this.channel.guild.roles.get(r) || null).filter(r => r),
			rolesRaw: this.roleMentions,
			users: this.mentions,
			usersRaw: this.mentions.map(u => u.id),
			members: this.mentions.map(m => this.channel.guild.members.get(m.id) || null).filter(m => m),
			membersRaw: this.mentions.map(m => m.id)
		};
	}

	async load() {
		const g = this.gConfig = await db.getGuild(this.channel.guild.id).then(v => v.fix());
		const u = this.uConfig = await db.getUser(this.author.id).then(v => v.fix());
		const p = this.content.match(new RegExp(`(${g.prefix.map(v => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")).join("|")}|<@!?${this.client.user.id}>)(?:\s+)*`, "i"));
		if (!p || p.length === 0) return false;
		const prefix = this.prefix = p[1].toLowerCase();
		if (!this.content.toLowerCase().startsWith(prefix)) return false;
		if (!g.prefix.includes(this.prefix)) this.prefix = g.prefix[0];
		const args = this.args = this.content.slice(prefix.length).split(" ").filter(a => a.length > 0 && !a.match(/^--(.{1,})(?:=(.*))?$/));
		const c = args.splice(0, 1)[0]?.toLowerCase();
		const cmd = this.cmd = !c ? null : this.client.cmd.getCommand(c).cmd;
		const d = this.dashedArgs = {
			value: this.content.slice(prefix.length).split(" ").map(a => a.match(new RegExp("^--([^=].{1,})$"))).map(a => !a || !a[1] ? null : a[1]).filter(a => a !== null) as string[],
			keyValue: this.content.slice(prefix.length).split(" ").map(a => a.match(new RegExp("^--(.{1,})=(.*)$"))).map(a => !a || a.length < 3 ? null : ({ [a[1]]: a[2] })).filter(a => a !== null).reduce((a, b) => ({ ...a, ...b }), {}) as { [k: string]: string; }
		};
		return true;
	}
}
