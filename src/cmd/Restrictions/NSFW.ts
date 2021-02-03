import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "nsfw";
export async function test<C extends CoreClient = CoreClient>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;

	if (cmd.restrictions.includes("nsfw") && !msg.channel.nsfw) {
		const v = await cmd.runOverride("nsfw", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.nsfw.error")}`);
		return false;
	}

	return true;
}
export default test;
