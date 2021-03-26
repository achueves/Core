import UserConfig from "./Models/UserConfig";
import GuildConfig from "./Models/GuildConfig";
import { ProvidedClient, ProvidedClientExtra } from "../@types/General";
import { MongoClient, Collection, MongoClientOptions } from "mongodb";
import { Timers } from "@uwu-codes/utils";
import deasync from "deasync";

abstract class Database {
	private static mainDB: string;
	static connection: MongoClient;
	static client: ProvidedClient | ProvidedClientExtra;

	static setClient(client: ProvidedClient | ProvidedClientExtra) {
		this.client = client;
	}

	static init(host: string, port: number, options: MongoClientOptions, main: string) {
		this.mainDB = main;
		try {
			const t = new Timers(false);
			t.start("connect");
			console.debug("Database", `Connecting to mongodb://${host}:${port}?retryWrites=true&w=majority (SSL: ${options.ssl ? "Yes" : "No"})`);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			this.connection = deasync(MongoClient.connect)(`mongodb://${host}:${port}/?retryWrites=true&w=majority`, options) as MongoClient;
			t.end("connect");
			console.debug("Database", `Connected to mongodb://${host}:${port}?retryWrites=true&w=majority (SSL: ${options.ssl ? "Yes" : "No"}) in ${t.calc("connect")}ms`);
		} catch (e) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			console.error("Database", `Error connecting to MongoDB instance (mongodb://${host}:${port}?retryWrites=true&w=majority, SSL: ${options.ssl ? "Yes" : "No"})\nReason: ${"stack" in e ? (e as { stack: string; }).stack : e}`);
			return; // don't need to rethrow it as it's already logged
		}
	}

	static collection<T = unknown>(col: string): Collection<T> {
		return this.mdb.collection<T>(col);
	}

	static get mongo() {
		return this.connection;
	}
	static get mdb() {
		return this.mongo.db(this.mainDB);
	}
	static get connected() {
		return this.connection?.isConnected?.() ?? false;
	}

	static getUser: (id: string) => Promise<UserConfig>;
	static getGuild: (id: string) => Promise<GuildConfig>;
}

const { mongo, mdb } = Database;

export {
	Database as db,
	mdb,
	mongo
};
export default Database;
