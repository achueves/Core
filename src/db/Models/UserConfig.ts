import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";
import { MaybeId, ConfigDataTypes, ConfigEditTypes } from "../../@types/db";
import { db, mdb } from "..";
import { Utility } from "@uwu-codes/utils";

export default abstract class UserConfig {
	id: string;
	constructor(id: string, data: MaybeId<ConfigDataTypes<UserConfig, "id">>) {
		this.id = id;
		this.load.call(this, data);
	}

	private load(data: MaybeId<ConfigDataTypes<UserConfig, "id">>) {
		if (!db.client?.cnf) throw new TypeError("Database has not been initialized.");
		if ("_id" in data) delete (data as any)._id;
		Object.assign(this, Utility.mergeObjects(data, db.client.cnf.defaults.config.guild));
		return this;
	}

	async reload() {
		const r = await mdb.collection("users").findOne({ id: this.id });
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = ConfigEditTypes<this>>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		const j = await mdb.collection<T>("users").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<UserConfig, "id">) {
		await mdb.collection("users").findOneAndUpdate({
			id: this.id
		}, {
			$set: Utility.mergeObjects(data, this)
		});

		return this.reload();
	}

	async create() {
		if (!db.client?.cnf) throw new TypeError("Database has not been initialized.");
		const e = await mdb.collection("users").findOne({
			id: this.id
		});
		if (!e) await mdb.collection("users").insertOne({
			id: this.id,
			...db.client.cnf.defaults.config.guild
		});

		return this;
	}

	async delete() {
		await mdb.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	abstract fix(): Promise<this>;

	abstract checkPremium(checkBoost?: boolean): Promise<{
		remainingMonths: number | "BOOSTER";
		activationTime: number | null;
		active: boolean;
	}>;
}
