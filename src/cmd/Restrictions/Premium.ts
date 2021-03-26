import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import Lang from "../../general/Language";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";

export const Label = "premium";
export async function test<C extends ProvidedClientExtra, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C>, cmd: Command<C>, config: CNF, Language: Lang) {
	if (config === null) throw new TypeError("Client has not been initialized");
	if (config.developers.includes(msg.author.id)) return true;
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
