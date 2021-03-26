import { ProvidedClientExtra } from "../@types/General";
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
				// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
				return this.members.get((this as any)._client.user.id);
			}
		});

		this.apply(Eris.Guild.prototype, "owner", {
			get(this: Eris.Guild) {
				return this.members.get(this.ownerID);
			}
		});

		const per = 7;
		this.apply(Eris.TextChannel.prototype, "startTyping", {
			async value (this: Eris.TextChannel & { client: ProvidedClientExtra; }, rounds = 6) {
				if (typeof this.client.typing === "undefined") this.client.typing = {};
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
			async value (this: Eris.TextChannel & { client: ProvidedClientExtra; }) {
				if (typeof this.client.typing === "undefined") this.client.typing = {};
				clearInterval(this.client.typing[this.id]);
				delete this.client.typing[this.id];
			}
		});

		// they finally merged my pr for this
		// https://github.com/abalabahaha/eris/pull/1110
		/* const ou = Eris.GuildChannel.prototype.update.bind(Eris.GuildChannel);
		Eris.GuildChannel.prototype.update = (function (data) {
			ou.call(this, data);
			this.nsfw = Boolean(data.nsfw);
		}); */

		this.apply(Eris.Client.prototype, "getUser", {
			async value(this: Eris.Client, id: string) {
				if (this.users.has(id)) return this.users.get(id)!;
				const user: Eris.User | null = await this.getRESTUser(id).catch(() => null);
				if (user !== null) this.users.set(id, user);
				return user;
			}
		});

		this.apply(Eris.Client.prototype, "getGuild", {
			async value(this: Eris.Client, id: string) {
				if (this.guilds.has(id)) return this.guilds.get(id)!;
				const guild: Eris.Guild | null = await this.getRESTGuild(id).catch(() => null);
				return guild || null;
			}
		});

	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	static apply<O extends object>(proto: O, prop: string, value: PropertyDescriptor & ThisType<O>) {
		if ("prop" in proto) return false;
		else {
			Object.defineProperty(proto, prop, value);
			return true;
		}
	}
}
