import Eris from "eris";

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
				return this.members.get(this._client.user.id);
			}
		});

		this.apply(Eris.Guild.prototype, "owner", {
			get(this: Eris.Guild) {
				return this.members.get(this.ownerID);
			}
		});

		this.apply(Eris.Client.prototype, "typing", {
			value: {}
		});

		const per = 7;
		this.apply(Eris.TextChannel.prototype, "startTyping", {
			value: async function (this: Eris.TextChannel, rounds = 6) {
				let r = 1;
				await this.client.sendChannelTyping(this.id);
				this.client.typing[this.id] = setInterval(async () => {
					r++;
					await this.client.sendChannelTyping(this.id);
					if (r >= rounds) this.stopTyping();
				}, per * 1e3);
			}
		});

		this.apply(Eris.TextChannel.prototype, "stopTyping", {
			value: async function (this: Eris.TextChannel) {
				clearInterval(this.client.typing[this.id]);
				delete this.client.typing[this.id];
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
