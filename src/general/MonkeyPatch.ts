import Eris from "eris";
import CoreClient from "../CoreClient";

export default class MonkeyPatch {
	static init() {
		this.apply(Eris.User.prototype, "tag", {
			get(this: Eris.User) {
				return `${this.username}#${this.discriminator}`;
			}
		});

		this.apply(Eris.Member.prototype, "tag", {
			get(this: Eris.Member) {
				return `${this.username}#${this.discriminator}`;
			}
		});

		this.apply(Eris.Guild.prototype, "me", {
			get(this: Eris.Guild) {
				return this.members.get((this as any)._client.user.id);
			}
		});

		this.apply(Eris.Guild.prototype, "owner", {
			get(this: Eris.Guild) {
				return this.members.get(this.ownerID);
			}
		});

		this.apply(Eris.TextChannel.prototype, "startTyping", {
			get(this: Eris.TextChannel & { client: CoreClient; }) {
				return this.client.startTyping.bind(this.client, this.id);
			}
		});

		this.apply(Eris.TextChannel.prototype, "stopTyping", {
			get(this: Eris.TextChannel & { client: CoreClient; }) {
				return this.client.stopTyping.bind(this.client, this.id);
			}
		});

		const ou = Eris.GuildChannel.prototype.update;
		Eris.GuildChannel.prototype.update = (function (data) {
			ou.call(this, data);
			this.nsfw = data.nsfw;
		});

		this.apply(Eris.Client.prototype, "getUser", {
			async value(this: Eris.Client, id: string) {
				if (this.users.has(id)) return this.users.get(id)!;
				const user: Eris.User | null = await this.getRESTUser(id).catch(err => null);
				if (user !== null) this.users.set(id, user);
				return user;
			}
		});

		this.apply(Eris.Client.prototype, "getGuild", {
			async value(this: Eris.Client, id: string) {
				if (this.guilds.has(id)) return this.guilds.get(id)!;
				const guild: Eris.Guild | null = await this.getRESTGuild(id).catch(err => null);
				return guild || null;
			}
		});

	}

	static apply<O extends object>(proto: O, prop: string, value: PropertyDescriptor & ThisType<O>) {
		if ("prop" in proto) return false;
		else {
			Object.defineProperty(proto, prop, value);
			return true;
		}
	}
}
