import { MaybeId, ConfigDataTypes, ConfigEditTypes } from "../../@types/db";
import Database from "..";
import { UpdateQuery, FindOneAndUpdateOption, MatchKeysAndValues } from "mongodb";
import { AnyObject, Utility } from "utilities";

export default abstract class UserConfig {
	private DEFAULTS: AnyObject;
	protected db: typeof Database;
	id: string;
	constructor(id: string, data: MaybeId<ConfigDataTypes<UserConfig, "id">>, def: AnyObject, db: typeof Database) {
		if (def === undefined) throw new TypeError("No defaults provided");
		if (db === undefined) throw new TypeError("Invalid database provided.");
		this.id = id;
		this.DEFAULTS = def;
		this.db = db;
		this.load.call(this, data);
	}

	private load(data: MaybeId<ConfigDataTypes<UserConfig, "id">>) {
		if (this.DEFAULTS === undefined) throw new TypeError("No defaults provided");
		if (this.db === undefined) throw new TypeError("Invalid database.");
		// eslint-disable-next-line no-underscore-dangle
		if ("_id" in data) delete (data as AnyObject)._id;
		if (this.DEFAULTS) Object.assign(this, Utility.mergeObjects(data, this.DEFAULTS));
		return this;
	}

	async reload() {
		const r = await this.db.collection<Parameters<UserConfig["load"]>[0]>("users").findOne({ id: this.id });
		if (r === null) throw new TypeError("unexpected null UserConfig on reload");
		this.load.call(this, r);
		return this;
	}

	async edit<T = ConfigEditTypes<this>>(d: MatchKeysAndValues<T>, opt?: FindOneAndUpdateOption<T>) {
		await this.mongoEdit({
			$set: d,
			...(opt ?? {})
		});
		return this;
	}

	async mongoEdit<T = ConfigEditTypes<this>>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await this.db.collection<T>("users").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return this;
	}

	async create() {
		const e = await this.db.collection<ConfigDataTypes<UserConfig>>("users").findOne({
			id: this.id
		});
		if (!e) {
			await this.db.collection<Partial<ConfigDataTypes<UserConfig>>>("users").insertOne({
				id: this.id,
				...(this.DEFAULTS ?? {})
			});
		}

		return this;
	}

	async delete() {
		await this.db.collection("users").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	abstract fix(): Promise<this>;

	abstract checkPremium?(checkBoost?: boolean): Promise<{
		remainingMonths: number | "BOOSTER";
		activationTime: number | null;
		active: boolean;
	}>;
}
