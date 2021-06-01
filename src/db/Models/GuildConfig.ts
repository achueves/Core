import { ConfigDataTypes, ConfigEditTypes, DBLike, Modifiers } from "../../@types/db";
import { AnyObject, DeepPartial, DeepUnion, Utility } from "utilities";
import { WriteResult } from "rethinkdb";

export default abstract class GuildConfig<L extends string = string, DB extends DBLike = DBLike> {
	private DEFAULTS!: AnyObject;
	protected db!: DB;
	private ref!: GuildConfig<L, DB>;
	id: string;
	settings!: {
		// this can't be hardcoded on this side due to the way Language works
		lang: L;
	};
	prefix!: Array<string>;
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
		const r = await this.db.get("guilds", this.id, true);
		if (r === null) throw new TypeError("unexpected null GuildConfig on reload");
		this.load.call(this, r);
		return this;
	}

	async edit<T = unknown>(d: DeepPartial<T>) {
		const j = await this.db.update<T>("guilds", this.id, d, false);
		await this.reload();
		return j;
	}

	async create() {
		const e = await this.db.get("guilds", this.id, false);
		if (!e) await this.db.insert("guilds", this.id, this.DEFAULTS ?? {});

		return this;
	}

	async reset() {
		await this.delete();
		await this.create();
		return this.reload();
	}

	async delete() {
		await this.db.delete("guilds", this.id);
	}

	async update<T = unknown>(data: Omit<Omit<ConfigEditTypes<T, never>, "id">, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
	async update<T = unknown>(data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
	async update<T = unknown>(data: Omit<ConfigEditTypes<T, never>, "id"> & Modifiers, raw?: boolean, db?: string) {
		return this.db.update("guilds", this.id, data, raw as true, db) as unknown;
	}

	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw: true, db?: string): Promise<WriteResult>;
	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw?: false, db?: string): Promise<ConfigDataTypes<T, never>>;
	async replace<T = unknown>(data: Omit<DeepUnion<ConfigDataTypes<T, never>, undefined>, "id"> & Modifiers, raw?: boolean, db?: string) {
		return this.db.replace("guilds", this.id, data, raw as true, db) as unknown;
	}

	abstract fix(): Promise<this>;
}
