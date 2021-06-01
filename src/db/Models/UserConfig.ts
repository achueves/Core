import { ConfigDataTypes, ConfigEditTypes, DBLike, Modifiers } from "../../@types/db";
import { AnyObject, DeepPartial, DeepUnion, Utility } from "utilities";
import { WriteResult } from "rethinkdb";

export default abstract class UserConfig<DB extends DBLike = DBLike> {
	private DEFAULTS!: AnyObject;
	protected db!: DB;
	private ref!: UserConfig<DB>;
	id: string;
	constructor(id: string, def: AnyObject, db: DB) {
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

	protected setRef(ref: unknown) {
		Object.defineProperty(this, "ref", {
			writable: false,
			enumerable: false,
			value: ref
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected load(data: any) {
		if (this.DEFAULTS === undefined) throw new TypeError("No defaults provided");
		if (this.db === undefined) throw new TypeError("Invalid database.");
		if (this.DEFAULTS) Object.assign(this.ref, Utility.mergeObjects(data, this.DEFAULTS));
		return this;
	}

	async reload() {
		const r = await this.db.get("users", this.id, true);
		if (r === null) throw new TypeError("unexpected null UserConfig on reload");
		this.load.call(this, r);
		return this;
	}

	async edit<T = unknown>(d: DeepPartial<T>) {
		const j = await this.db.update<T>("users", this.id, d, false);
		await this.reload();
		return j;
	}

	async create() {
		const e = await this.db.get("users", this.id, false);
		if (!e) await this.db.insert("users", this.id, this.DEFAULTS ?? {});

		return this;
	}

	async delete() {
		await this.db.delete("users", this.id);
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	async update<T = unknown>(data: Omit<Omit<ConfigEditTypes<T, never>, "id">, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
	async update<T = unknown>(data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
	async update<T = unknown>(data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: boolean, db?: string) {
		return this.db.update("user", this.id, data, raw as true, db) as unknown;
	}

	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw?: boolean, db?: string) {
		return this.db.replace("users", this.id, data, raw as true, db) as unknown;
	}

	abstract fix(): Promise<this>;

	abstract checkPremium?(checkBoost?: boolean): Promise<{
		remainingMonths: number | "BOOSTER";
		activationTime: number | null;
		active: boolean;
	}>;
}
