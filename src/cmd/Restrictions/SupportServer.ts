import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "supportServer";
export async function test(client: CoreClient, msg: ExtendedMessage, cmd: Command) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("supportServer") && msg.channel.guild.id !== client.cnf.client.supportServerId) {
		const v = await cmd.runOverride("supportServer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.supportServer.error")}`);
		return false;
	}

	return true;
}
export default test;
