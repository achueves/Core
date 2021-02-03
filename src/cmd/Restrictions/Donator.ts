import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "donator";
export async function test<C extends CoreClient = CoreClient>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;
	const d = await msg.uConfig.checkPremium(true);
	if (cmd.restrictions.includes("donator") && !d.active) {
		const v = await cmd.runOverride("donator", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.donator.error")}`);
		return false;
	}

	return true;
}
export default test;
