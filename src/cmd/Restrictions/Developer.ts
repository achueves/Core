import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Lang from "../../general/Language";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Eris from "eris";

export const Label = "developer";
export async function test<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig, CH extends Eris.GuildTextableChannel, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C, UC, GC, CH>, cmd: Command<C, UC, GC>, config: CNF, Language: Lang) {
	if (config === null) throw new TypeError("Client has not been initialized");
	if (cmd.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) {
		const v = await cmd.runOverride("developer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.developer.error")}`);
		return false;
	}

	return true;
}
export default test;
