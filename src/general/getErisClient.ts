import { ProvidedClient } from "../@types/General";
import Eris from "eris";

export default function getErisClient(provided: ProvidedClient): Eris.Client {
	if (provided === undefined) throw new TypeError("[getErisClient] undefined recieved");
	let botUndef = false;
	if ("bot" in provided && typeof provided.bot !== "boolean") {
		if (provided.bot === undefined) botUndef = true;
		else return provided.bot;
	}
	if ("client" in provided) {
		if (provided.client === undefined) {
			if (botUndef) throw new TypeError("[getErisClient] Both provided.bot & provided.client (while present) are undefined.");
			throw new TypeError("[getErisClient] Unable to find an Eris client");
		} else return provided.client;
	}
	return provided;
}
