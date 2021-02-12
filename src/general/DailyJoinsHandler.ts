import CoreClient from "../CoreClient";
import { Redis } from "@uwu-codes/utils";

export default class DailyJoinsHandler {
	static async run<C extends CoreClient>(client: C) {
		if (client.cnf === null) throw new TypeError("Client has not been initialized");
		const d = new Date((Date.now() - 6e4)),
			id = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
		let k: string | number = await Redis.get(`stats:dailyJoins:${id}`).then((v) => !v ? 0 : client.guilds.size - Number(v));
		if (!k) k = "Unknown.";
		else k = (client.guilds.size - Number(k)).toString();
		console.log("Daily Joins", `Daily joins for ${id}: ${k}`);
		const w = client.w.get("dailyjoins");
		if (w === null) console.warn("Daily Joins", "No daily joins webhook.");

		w!.execute({
			embeds: [
				{
					title: `Daily Joins for ${id}`,
					description: [
						`Total Servers Joined Today: ${k}`,
						`Total Servers: ${client.guilds.size}`
					].join("\n"),
					timestamp: new Date().toISOString()
				}
			],
			username: `Daily Joins${client.cnf.beta ? " - Beta" : ""}`,
			avatarURL: "https://i.furry.bot/furry.png"
		}).catch(console.error);
	}
}
