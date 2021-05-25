import getErisClient from "./getErisClient";
import Command from "../cmd/Command";
import GuildConfig from "../db/Models/GuildConfig";
import UserConfig from "../db/Models/UserConfig";
import { ProvidedClientExtra } from "../@types/General";
import Database from "../db";
import Eris from "eris";

export default class ExtendedMessage<
	C extends ProvidedClientExtra,
	UC extends UserConfig = UserConfig,
	GC extends GuildConfig = GuildConfig,
	CH extends Eris.TextableChannel = Eris.GuildTextableChannel
	// eslint-disable-next-line @typescript-eslint/indent
	> extends Eris.Message<CH> {
	// these are defined inside the load function
	client!: C;
	slash!: boolean;
	slashInfo!: {
		id: string;
		token: string;
	} | null;
	gConfig!: GC;
	uConfig!: UC;
	args!: Array<string>;
	cmd!: Command<C, UC, GC> | null;
	declare prefix: string;
	dashedArgs!: {
		value: Array<string>;
		keyValue: Record<string, string>;
	};
	// thanks Eris
	declare channel: CH;
	constructor(data: Eris.BaseData, client: C, slash?: boolean, slashInfo?: ExtendedMessage<C, UC, GC, CH>["slashInfo"]) {
		super(data, getErisClient(client));
		this.client = client;
		this.slash = slash ?? false;
		this.slashInfo = slashInfo ?? null;
	}

	get mentionList() {
		return {
			channels: this.channelMentions.map((c) => this.channel instanceof Eris.GuildChannel  ? this.channel.guild.channels.get(c) || null : null).filter(Boolean),
			channelsRaw: this.channelMentions,
			roles: this.roleMentions.map((r) => this.channel instanceof Eris.GuildChannel ? this.channel.guild.roles.get(r) || null : null).filter(Boolean),
			rolesRaw: this.roleMentions,
			users: this.mentions,
			usersRaw: this.mentions.map((u) => u.id),
			members: this.mentions.map((m) => this.channel instanceof Eris.GuildChannel  ? this.channel.guild.members.get(m.id) || null : null).filter(Boolean),
			membersRaw: this.mentions.map((m) => m.id)
		};
	}

	async load(db: typeof Database) {
		if (!(this.channel instanceof Eris.GuildChannel)) throw new TypeError("ExtendedMessage#load called on non-guild channel.");
		const g = this.gConfig = await db.getGuild(this.channel.guild.id).then((v) => v.fix()) as GC,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			u = this.uConfig = await db.getUser(this.author.id).then((v) => v.fix()) as UC,
			// eslint-disable-next-line no-useless-escape
			p = new RegExp(`(${g.prefix.map((v) => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")).join("|")}|<@!?${getErisClient(this.client).user.id}>)(?:\s+)*`, "i").exec(this.content);
		if (!p || p.length === 0) return false;
		const prefix = this.prefix = p[1].toLowerCase();
		if (!this.content.toLowerCase().startsWith(prefix)) return false;
		if (!g.prefix.includes(this.prefix)) this.prefix = g.prefix[0];
		const args = this.args = this.content.slice(prefix.length).split(" ").filter((a) => a.length > 0 && !/^--(.{1,})(?:=(.*))?$/.exec(a));
		const c = args.splice(0, 1)[0]?.toLowerCase();
		// constraint bs
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.cmd = !c ? null : this.client.cmd.getCommand(c).cmd;
		this.dashedArgs = {
			value: this.content.slice(prefix.length).split(" ").map((a) => new RegExp("^--([^=].{1,})$").exec(a)).map((a) => !a || !a[1] ? null : a[1]).filter((a) => a !== null) as Array<string>,
			keyValue: this.content.slice(prefix.length).split(" ").map((a) => new RegExp("^--(.{1,})=(.*)$").exec(a)).map((a) => !a || a.length < 3 ? null : ({ [a[1]]: a[2] })).filter((a) => a !== null).reduce((a, b) => ({ ...a, ...b }), {}) as { [k: string]: string; }
		};
		return true;
	}


	async getUserFromArgs(argPos = 0, useMentions = true, mentionPos = argPos): Promise<Eris.User | null> {
		if (useMentions && this.mentionList.users[mentionPos]) return this.mentionList.users[mentionPos];
		if (!this.args || !this.args[argPos]) return null;
		const t = this.args[argPos].toLowerCase();
		const username = getErisClient(this.client).users.find((u) => u.username.toLowerCase() === t);
		const tag = getErisClient(this.client).users.find((u) => `${u.username}#${u.discriminator}`.toLowerCase() === t);
		const [, a, b] = /(?:<@!?([0-9]{15,21})>|([0-9]{15,21}))/.exec(t) ?? [];
		const id = (a || b) && "getUser" in this.client ? this.client.getUser!(a || b).catch(() => null) : null;
		return username || tag || id || null;
		return null;
	}

	async getMemberFromArgs(argPos = 0, useMentions = true, mentionPos = argPos): Promise<Eris.Member | null> {
		if (!(this.channel instanceof Eris.GuildChannel)) throw new TypeError("ExtendedMessage#getMemberFromArgs called on non-guild channel.");
		if (useMentions && this.mentionList.members[mentionPos]) return this.mentionList.members[mentionPos];
		if (!this.args || !this.args[argPos]) return null;
		const t = this.args[argPos].toLowerCase(),

			username = this.channel.guild.members.find((m) => m.username.toLowerCase() === t),
			tag = this.channel.guild.members.find((m) => `${m.username}#${m.discriminator}`.toLowerCase() === t);
		let id: Eris.Member | null = null;
		if (/[0-9]{15,21}/.test(t)) {
			id = this.channel.guild.members.find((m) => m.id === this.args[argPos]) ?? null;
			if (id === null) {
				id = await this.channel.guild.getRESTMember(t).catch(() => null);
				if (id) this.channel.guild.members.add(id);
			}
		}

		return username || tag || id || null;
	}

	async getChannelFromArgs<T extends Eris.GuildChannel = Eris.TextChannel>(argPos = 0, useMentions = true, mentionPos = argPos, caseSensitive = false, type: number | null = null): Promise<T | null> {
		if (!(this.channel instanceof Eris.GuildChannel)) throw new TypeError("ExtendedMessage#getChannelFromArgs called on non-guild channel.");
		if (useMentions && this.mentionList.channels[mentionPos]) return this.mentionList.channels[mentionPos] as T;
		if (!this.args || !this.args[argPos]) return null;
		const t = caseSensitive ? this.args[argPos] : this.args[argPos].toLowerCase();
		const f = (ch: Eris.GuildChannel) => type === null ? true : ch.type === type;
		const name = this.channel.guild.channels.filter(f).find((c) => (caseSensitive ? c.name : c.name.toLowerCase()) === t) as T;
		let id: T | null = null;
		if (/[0-9]{15,21}/.test(t)) {
			id = this.channel.guild.channels.filter(f).find((c) => c.id === this.args[argPos]) as T ?? null;
			if (id === null) id = await getErisClient(this.client).getRESTChannel(t).catch(() => null) as T;
		}

		return name || id || null;
	}

	async getRoleFromArgs(argPos = 0, useMentions = true, mentionPos = argPos): Promise<Eris.Role | null> {
		if (!(this.channel instanceof Eris.GuildChannel)) throw new TypeError("ExtendedMessage#getRoleFromArgs called on non-guild channel.");
		if (useMentions && this.mentionList.roles[mentionPos]) return this.mentionList.roles[mentionPos];
		if (!this.args || !this.args[argPos]) return null;
		const t = this.args[argPos].toLowerCase(),

			name = this.channel.guild.roles.find((r) => r.name.toLowerCase() === t),
			id = /[0-9]{15,21}/.test(t) ? this.channel.guild.roles.find((r) => r.id === this.args[argPos]) ?? null : null;
		// because this one isn't async, and I want them to all be the same
		return Promise.resolve(name || id || null);
	}

	async getReplyText(content: Eris.MessageContent, type: "mention" | "quote" | "new" = "new", id?: string) {
		if (!id) id = this.id;
		switch (type) {
			case "mention": {
				if (typeof content === "string") {
					content = {
						content: `<@!${this.author.id}>, ${content}`
					};
				} else content.content = `<@!${this.author.id}>${!content.content ? "" : `, ${content.content}`}`;
				break;
			}

			case "quote": {
				const m: Eris.Message | null = this.channel.messages.get(id) || await this.channel.getMessage(id).catch(() => null);
				if (!id || m === null) throw new TypeError("Invalid message id provided.");
				if (typeof content === "string") {
					content = {
						content: `> ${m.content}\n<@!${m.author.id}>, ${content}`
					};
				} else content.content = `> ${m.content}\n<@!${m.author.id}>, ${content.content || ""}`;
				break;
			}

			case "new": {
				if (!id) throw new TypeError("Invalid message id provided.");
				if (typeof content === "string") {
					content = {
						content
					};
				}
				content.messageReference = {
					messageID: id
				};

				break;
			}
		}

		return content;
	}

	async reply(content: Eris.MessageContent, type?: "mention" | "quote" | "new") {

		/* if (this.slash) {
			if (type === "new") type = "mention";
			const text = await this.getReplyText(content, type, this.id);
			return this.client.h.createInteractionResponse(this.slashInfo.id, this.slashInfo.token, InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE)
		}
		else { */
		if (this.slash) return this.channel.createMessage(content);
		const text = await this.getReplyText(content, type, this.id);
		return this.channel.createMessage(text);
		/* } */
	}
}
