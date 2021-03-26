import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Lang from "../../general/Language";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";

export const Label = "supportServer";
export async function test<C extends ProvidedClientExtra, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>, config: CNF, Language: Lang){
	if (config.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("supportServer") && msg.channel.guild.id !== config.client.supportServerId) {
		const v = await cmd.runOverride("supportServer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.supportServer.error")}`);
		return false;
	}

	return true;
}
export default test;
