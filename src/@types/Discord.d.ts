declare namespace Discord {
	interface Oauth2Info {
		access_token: string;
		expires_in: number;
		refresh_token: string;
		scope: string;
		token_type: string;
	}

	interface APISelfUser {
		id: string;
		username: string;
		avatar: string;
		discriminator: string;
		locale: string;
		mfa_enabled: boolean;
		flags: number;
		premium_type: number;
	}

	interface APIGuild {
		id: string;
		name: string;
		icon: string;
		owner: boolean;
		permissions: number;
		features: Array<string>;
		permissions_new: string;
	}
}

export = Discord;
