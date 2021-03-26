import { MaybeId, ConfigDataTypes, ConfigEditTypes } from "../../@types/db";
import db from "..";
import { UpdateQuery, FindOneAndUpdateOption } from "mongodb";
import { AnyObject, Utility } from "@uwu-codes/utils";

export default abstract class UserConfig {
	private DEFAULTS: AnyObject;
	id: string;
	constructor(id: string, data: MaybeId<ConfigDataTypes<UserConfig, "id">>, def: AnyObject) {
		this.id = id;
		this.load.call(this, data);
		this.DEFAULTS = def;
	}

	private load(data: MaybeId<ConfigDataTypes<UserConfig, "id">>) {
		// eslint-disable-next-line no-underscore-dangle
		if ("_id" in data) delete (data as AnyObject)._id;
		if (this.DEFAULTS) Object.assign(this, Utility.mergeObjects(data, this.DEFAULTS));
		return this;
	}

	async reload() {
		const r = await db.collection<Parameters<UserConfig["load"]>[0]>("users").findOne({ id: this.id });
		if (r === null) throw new TypeError("unexpected null UserConfig on reload");
		this.load.call(this, r);
		return this;
	}

	async mongoEdit<T = ConfigEditTypes<this>>(d: UpdateQuery<T>, opt?: FindOneAndUpdateOption<T>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const j = await db.collection<T>("users").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async edit(data: ConfigEditTypes<this, "id">) {
		await db.collection("users").findOneAndUpdate({
			id: this.id
		}, {
			$set: Utility.mergeObjects(data, this as AnyObject)
		});

		return this.reload();
	}

	async create() {
		const e = await db.collection<ConfigDataTypes<UserConfig>>("users").findOne({
			id: this.id
		});
		if (!e) {
			await db.collection<Partial<ConfigDataTypes<UserConfig>>>("users").insertOne({
				id: this.id,
				...(this.DEFAULTS ?? {})
			});
		}

		return this;
	}

	async delete() {
		await db.collection("users").findOneAndDelete({ id: this.id });
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

	abstract getLevel?(g: string): number;
	abstract checkVote?(): Promise<Record<"voted" | "weekend", boolean>>;
	abstract getBadges?<ID extends string = string>(): Promise<Array<{
		category: string;
		emoji: string;
		id: ID;
	}>>;
}
