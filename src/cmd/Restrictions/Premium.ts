import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Language from "../../general/Language";
import CoreClient from "../../CoreClient";

export const Label = "premium";
export async function test<C extends CoreClient>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>) {
	if (client.cnf === null) throw new TypeError("Client has not been initialized");
	if (client.cnf.developers.includes(msg.author.id)) return true;
	// not doing this yet
	const g = { active: false }; // await msg.gConfig.checkPremium();
	if (cmd.restrictions.includes("premium") && !g.active) {
		const v = await cmd.runOverride("premium", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.premium.error")}`);
		return false;
	}

	return true;
}
export default test;
