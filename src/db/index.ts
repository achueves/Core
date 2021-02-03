import { MongoClient, Collection, MongoClientOptions } from "mongodb";
import UserConfig from "./Models/UserConfig";
import GuildConfig from "./Models/GuildConfig";
import { Timers } from "@uwu-codes/utils";
import deasync from "deasync";
import CoreClient from "../CoreClient";

abstract class Database {
	private static mainDB: string;
	static connection: MongoClient;
	static client: CoreClient;

	static setClient(client: CoreClient) {
		this.client = client;
	}

	static init(host: string, port: number, options: MongoClientOptions, main: string) {
		this.mainDB = main;
		try {
			const t = new Timers(false);
			t.start("connect");
			console.debug("Database", `Connecting to mongodb://${host}:${port}?retryWrites=true&w=majority (SSL: ${options.ssl ? "Yes" : "No"})`);
			this.connection = deasync(MongoClient.connect)(`mongodb://${host}:${port}/?retryWrites=true&w=majority`, options);
			t.end("connect");
			console.debug("Database", `Connected to mongodb://${host}:${port}?retryWrites=true&w=majority (SSL: ${options.ssl ? "Yes" : "No"}) in ${t.calc("connect")}ms`);
		} catch (e) {
			console.error("Database", `Error connecting to MongoDB instance (mongodb://${host}:${port}?retryWrites=true&w=majority, SSL: ${options.ssl ? "Yes" : "No"})\nReason: ${e.stack || e}`);
			return; // don't need to rethrow it as it's already logged
		}
	}

	static collection<T = any>(col: string): Collection<T>;
	static collection(col: string) {
		return this.mdb.collection(col);
	}

	static get mongo() { return this.connection; }
	static get mdb() { return this.mongo.db(this.mainDB); }
	static get connected() { return this.connection?.isConnected?.() ?? false; }

	static getUser: (id: string) => Promise<UserConfig>;
	static getGuild: (id: string) => Promise<GuildConfig>
}

const { mongo, mdb } = Database;

export {
	Database as db,
	mdb,
	mongo
};
export default Database;
