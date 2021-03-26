import { ProvidedClient } from "../@types/General";
import Eris from "eris";
import { BaseClusterWorker } from "eris-fleet";

export default function getErisClient(provided: ProvidedClient): Eris.Client {
	if (provided instanceof BaseClusterWorker) return provided.bot;
	else return provided;
}
