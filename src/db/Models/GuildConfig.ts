import { MaybeId, ConfigDataTypes, ConfigEditTypes } from "../../@types/db";
import Database from "..";
import { UpdateQuery, FindOneAndUpdateOption, MatchKeysAndValues } from "mongodb";
import { AnyObject, Utility } from "utilities";

export default abstract class GuildConfig<L extends string = string> {
	private DEFAULTS!: AnyObject;
	protected db!: typeof Database;
	private ref!: GuildConfig;
	id: string;
	settings!: {
		// this can't be hardcoded on this side due to the way Language works
		lang: L;
	};
	prefix!: Array<string>;
	constructor(id: string, data: MaybeId<ConfigDataTypes<GuildConfig, "id">>, def: AnyObject, db: typeof Database) {
		if (def === undefined) throw new TypeError("No defaults provided");
		if (db === undefined) throw new TypeError("Invalid database provided.");
		this.id = id;
		Object.defineProperties(this, {
			DEFAULTS: {
				writable: false,
				enumerable: false,
				value: def
			},
			db: {
				writable: false,
				enumerable: false,
				value: db
			}
		});
	}

	protected setRef(ref: GuildConfig) {
		Object.defineProperty(this, "ref", {
			writable: false,
			enumerable: false,
			value: ref
		});
	}

	protected load(data: MaybeId<ConfigDataTypes<GuildConfig, "id">>) {
		if (this.DEFAULTS === undefined) throw new TypeError("No defaults provided");
		if (this.db === undefined) throw new TypeError("Invalid database.");
		// eslint-disable-next-line no-underscore-dangle
		if ("_id" in data) delete (data as AnyObject)._id;
		if (this.DEFAULTS) Object.assign(this.ref, Utility.mergeObjects(data, this.DEFAULTS));
		return this;
	}

	async reload() {
		const r = await this.db.collection<Parameters<GuildConfig["load"]>[0]>("guilds").findOne({ id: this.id });
		if (r === null) throw new TypeError("unexpected null GuildConfig on reload");
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
		const j = await this.db.collection<T>("guilds").findOneAndUpdate({ id: this.id } as any, d, opt);
		await this.reload();
		return j;
	}

	async create() {
		const e = await this.db.collection<ConfigDataTypes<GuildConfig>>("guilds").findOne({
			id: this.id
		});
		if (e === null) {
			await this.db.collection<Partial<ConfigDataTypes<GuildConfig>>>("guilds").insertOne({
				id: this.id,
				...(this.DEFAULTS ?? {})
			});
		}

		return this;
	}

	async delete() {
		await this.db.collection("guilds").findOneAndDelete({ id: this.id });
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	abstract fix(): Promise<this>;
}
