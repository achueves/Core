import Eris from "eris";
import CoreClient from "../CoreClient";
import { db } from "../db";
import GuildConfig from "../db/Models/GuildConfig";
import UserConfig from "../db/Models/UserConfig";

export default class ExtendedMessage<T extends Eris.GuildTextableChannel = Eris.GuildTextableChannel> extends Eris.Message<T> {
	client: CoreClient;
	slash: boolean;
	slashInfo: {
		id: string;
		token: string;
	} | null;
	gConfig: GuildConfig;
	uConfig: UserConfig;
	args: string[];
	constructor(msg: Eris.Message<Eris.TextableChannel>, client: CoreClient, slash?: boolean, slashInfo?: ExtendedMessage["slashInfo"]) {
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
	}
}
