import { MaybeId, ConfigDataTypes, ConfigEditTypes } from "../../@types/db";
import { db, mdb } from "..";
import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";
import { AnyObject, Utility } from "@uwu-codes/utils";

export default abstract class GuildConfig {
	id: string;
	settings!: {
		// this can't be hardcoded on this side due to the way Language works
		lang: string;
	};
	prefix!: Array<string>;
	constructor(id: string, data: MaybeId<ConfigDataTypes<GuildConfig, "id">>) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: MaybeId<ConfigDataTypes<GuildConfig, "id">>) {
		if (!db.client?.cnf) throw new TypeError("Database has not been initialized.");
		// eslint-disable-next-line no-underscore-dangle
		if ("_id" in data) delete (data as AnyObject)._id;
		Object.assign(this, Utility.mergeObjects(data, db.client.cnf.defaults.config.guild));
		return this;
	}

	async reload() {
		const r = await mdb.collection<Parameters<GuildConfig["load"]>[0]>("guilds").findOne({ id: this.id });
		if (r === null) throw new TypeError("unexpected null GuildConfig on reload");
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = ConfigEditTypes<this>>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const j = await mdb.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<this, "id">) {
		await mdb.collection("guilds").findOneAndUpdate({
			id: this.id
		}, {
			$set: Utility.mergeObjects(data, this as AnyObject)
		});

		return this.reload();
	}

	async create() {
		if (!db.client?.cnf) throw new TypeError("Database has not been initialized.");
		const e = await mdb.collection<ConfigDataTypes<GuildConfig>>("guilds").findOne({
			id: this.id
		});
		if (e === null) {
			await mdb.collection("guilds").insertOne({
				id: this.id,
				...db.client.cnf.defaults.config.guild
			});
		}

		return this;
	}

	async delete() {
		await mdb.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	abstract fix(): Promise<this>;
}
