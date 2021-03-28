import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Lang from "../../general/Language";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Eris from "eris";

export const Label = "donator";
export async function test<C extends ProvidedClientExtra, UC extends UserConfig, CH extends Eris.GuildTextableChannel, GC extends GuildConfig, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C, UC, GC, CH>, cmd: Command<C, UC, GC>, config: CNF, Language: Lang){
	if (config === null) throw new TypeError("Client has not been initialized");
	if (config.developers.includes(msg.author.id)) return true;
	if (!("checkPremium" in msg.uConfig)) throw new TypeError("Cannot check premium due to missing check function.");
	const d = await msg.uConfig.checkPremium!(true);
	if (cmd.restrictions.includes("donator") && !d.active) {
		const v = await cmd.runOverride("donator", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.donator.error")}`);
		return false;
	}

	return true;
}
export default test;
