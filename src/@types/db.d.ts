import { DeepPartial, WithoutFunctions } from "@uwu-codes/utils";
import { WithId } from "mongodb";

declare namespace DatabaseTypes {
	type ConfigDataTypes<T, O extends (string | number) = ""> = Omit<WithoutFunctions<{ [K in keyof T]: T[K]; }>, O>;
	type ConfigEditTypes<T, O extends (string | number) = ""> = DeepPartial<ConfigDataTypes<T, O>>;
	type MaybeId<T> = WithId<T> | T;
}

export = DatabaseTypes;
