import getErisClient from "./getErisClient";
import { ProvidedClient, ProvidedClientExtra } from "../@types/General";
import Eris from "eris";

export class Webhook<C extends ProvidedClient | ProvidedClientExtra> implements WebhookConfig {
	client: C;
	id: string;
	token: string;
	avatar?: string;
	username?: string;
	constructor(client: C, data: WebhookConfig) {
		this.client = client;
		this.id = data.id;
		this.token = data.token;
		this.avatar = data.avatar;
		this.username = data.username;
	}

	async fetch() {
		return getErisClient(this.client).getWebhook(this.id, this.token);
	}
	async delete(reason?: string) {
		return getErisClient(this.client).deleteWebhook(this.id, this.token, reason);
	}
	async execute(payload: Omit<Eris.WebhookPayload, "wait">) {
		const data: Eris.WebhookPayload & { wait: true; } = {
			...payload,
			wait: true
		};

		if (this.avatar && !payload.avatarURL) data.avatarURL = this.avatar;
		if (this.username && !payload.username) data.username = this.username;
		return getErisClient(this.client).executeWebhook(this.id, this.token, data);
	}
}

export interface WebhookConfig {
	id: string;
	token: string;
	avatar?: string;
	username?: string;
}

export default class WebhookStore<C extends ProvidedClient = ProvidedClient, K extends string = string> {
	private webhooks = new Map<K, Webhook<C>>();
	client: C;
	constructor(client: C) {
		this.client = client;
	}

	addHook(name: K, info: WebhookConfig) {
		this.webhooks.set(name, new Webhook<C>(this.client, info));
		return this;
	}

	addBulk(list: Record<K, WebhookConfig>) {
		Object.entries<WebhookConfig>(list).map(([name, info]) =>
			this.webhooks.set(
				name as K,
				new Webhook(this.client, info)
			)
		);
		return this;
	}

	get(name: K) {
		return this.webhooks.get(name) ?? null;
	}
}
