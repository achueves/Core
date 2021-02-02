import Eris from "eris";
import CoreClient from "../CoreClient";

export class Webhook implements WebhookConfig {
	client: CoreClient;
	id: string;
	token: string;
	avatar?: string;
	username?: string;
	constructor(client: CoreClient, data: WebhookConfig) {
		this.client = client;
		this.id = data.id;
		this.token = data.token;
		this.avatar = data.avatar;
		this.username = data.username;
	}

	async fetch() {
		return this.client.getWebhook(this.id, this.token);
	}
	async delete(reason?: string) {
		return this.client.deleteWebhook(this.id, this.token, reason);
	}
	async execute(payload: Omit<Eris.WebhookPayload, "wait">) {
		const data: Eris.WebhookPayload & { wait: true; } = {
			...payload,
			wait: true
		};

		if (this.avatar && !payload.avatarURL) data.avatarURL = this.avatar;
		if (this.username && !payload.username) data.username = this.username;
		return this.client.executeWebhook(this.id, this.token, data);
	}
}

export interface WebhookConfig {
	id: string;
	token: string;
	avatar?: string;
	username?: string;
}

export default class WebhookStore {
	private webhooks: Map<string, Webhook>;
	client: CoreClient;
	constructor(client: CoreClient) {
		this.client = client;
		this.webhooks = new Map();
	}

	addHook(name: string, info: WebhookConfig) {
		this.webhooks.set(name, new Webhook(this.client, info));
	}

	addBulk(list: Record<string, WebhookConfig>) {
		Object.entries<WebhookConfig>(list).map(([name, info]) =>
			this.webhooks.set(
				name,
				new Webhook(this.client, info)
			)
		);
	}

	get(name: string) {
		return this.webhooks.get(name) ?? null;
	}
}
