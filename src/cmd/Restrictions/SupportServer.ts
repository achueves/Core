import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Language from "language";
import Eris from "eris";

export const Label = "supportServer";
export async function test<C extends ProvidedClientExtra, UC extends UserConfig, GC extends GuildConfig, CH extends Eris.GuildTextableChannel, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C, UC, GC, CH>, cmd: Command<C, UC, GC>, config: CNF){
	if (config.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("supportServer") && msg.channel.guild.id !== config.client.supportServerId) {
		const v = await cmd.runOverride("supportServer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.supportServer.error")}`);
		return false;
	}

	return true;
}
export default test;
