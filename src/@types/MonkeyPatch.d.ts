import "eris";

declare module "eris" {
	export interface Permission {
		has(permission: ErisPermissions): boolean;
	}

	interface User {
		/**
		 * combination of username#discriminator
		 * @type {string}
		 * @memberof User
		 */
		readonly tag: string;
	}

	interface Member {
		/**
		 * combination of username#discriminator
		 * @type {string}
		 * @memberof Member
		 */
		readonly tag: string;
	}

	interface Guild {
		/**
		 * The client's Member instance in the guild
		 * @type {Eris.Member}
		 * @memberof Guild
		 */
		readonly me: Member;
		/**
		 * The Member instance of the guild owner
		 * @type {Eris.Member}
		 * @memberof Guild
		 */
		readonly owner: Member;
	}

	interface GuildChannel {
		update(data: any): void;
	}

	interface TextChannel {
		startTyping(rounds?: number): void;
		stopTyping(): void;
	}
}
