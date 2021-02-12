import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "guildOwner";
export async function test<C extends CoreClient>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("guildOwner") && msg.author.id !== msg.channel.guild.ownerID) {
		const v = await cmd.runOverride("guildOwner", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.guildOwner.error")}`);
		return false;
	}

	return true;
}
export default test;
