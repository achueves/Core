import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "beta";
export async function test(client: CoreClient, msg: ExtendedMessage, cmd: Command) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("beta") && !client.cnf.beta) {
		const v = await cmd.runOverride("beta", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.beta.error")}`);
		return false;
	}

	return true;
}
export default test;
