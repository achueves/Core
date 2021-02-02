import { WithId } from "mongodb";

declare namespace DatabaseTypes {

	type DeepPartial<T> = {
		[P in keyof T]?: DeepPartial<T[P]>;
	};
	type FilterFlags<Base, Condition> = {
		[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
	};
	type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
	type BetterFilter<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	type WithoutFunctions<T> = BetterFilter<T, Function>;
	type ConfigDataTypes<T, O extends (string | number) = ""> = Omit<WithoutFunctions<{ [K in keyof T]: T[K]; }>, O>;
	type ConfigEditTypes<T, O extends (string | number) = ""> = DeepPartial<ConfigDataTypes<T, O>>;
	type MaybeId<T> = WithId<T> | T;
}

export = DatabaseTypes;
