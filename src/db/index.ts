import UserConfig from "./Models/UserConfig";
import GuildConfig from "./Models/GuildConfig";
import { ProvidedClient, ProvidedClientExtra } from "../@types/General";
import { MongoClient, Collection, MongoClientOptions } from "mongodb";
import { Timers } from "@uwu-codes/utils";
import deasync from "deasync";
import IORedis from "ioredis";

export interface DBOptions {
	host: string;
	port: number;
	options: MongoClientOptions;
	main: string;
}

export interface RedisOptions {
	host: string;
	port: number;
	password: string;
	db: number;
	name: string;
}

abstract class Database {
	private static mainDB: string;
	static r: IORedis.Redis;
	static connection: MongoClient;
	static client: ProvidedClient | ProvidedClientExtra;

	static setClient(client: ProvidedClient | ProvidedClientExtra) {
		this.client = client;
	}

	static init(db: DBOptions, redis: RedisOptions) {
		this.mainDB = db.main;

		const r = this.r = new IORedis(redis.port, redis.host, {
			password: redis.password,
			db: redis.db,
			enableReadyCheck: true,
			autoResendUnfulfilledCommands: true,
			connectionName: redis.name
		});

		r
			.on("connect", () => console.debug("Redis", `Connected to redis://${redis.host}:${redis.port} (db: ${redis.db})`));

		const dbString = `mongodb://${db.host}:${db.port}?retryWrites=true&w=majority`;
		try {
			const t = new Timers(false);
			t.start("connect");
			console.debug("Database", `Connecting to ${dbString} (SSL: ${db.options.ssl ? "Yes" : "No"})`);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			this.connection = deasync(MongoClient.connect)(dbString, db.options) as MongoClient;
			t.end("connect");
			console.debug("Database", `Connected to ${dbString} (SSL: ${db.options.ssl ? "Yes" : "No"}) in ${t.calc("connect")}ms`);
		} catch (e) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			console.error("Database", `Error connecting to MongoDB instance (${dbString}, SSL: ${db.options.ssl ? "Yes" : "No"})\nReason: ${"stack" in e ? (e as { stack: string; }).stack : e}`);
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
	static get Redis() {
		return this.r;
	}

	static getUser: (id: string) => Promise<UserConfig>;
	static getGuild: (id: string) => Promise<GuildConfig>;

	static isDb(value: unknown): value is Database {
		return value instanceof Database;
	}
}

export default Database;
