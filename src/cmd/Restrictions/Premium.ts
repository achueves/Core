import ExtendedMessage from "../../general/ExtendedMessage";
import Command from "../Command";
import { ConfigLike, ProvidedClientExtra } from "../../@types/General";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import Language from "language";
import Eris from "eris";

export const Label = "premium";
export async function test<C extends ProvidedClientExtra, UC extends UserConfig, CH extends Eris.GuildTextableChannel, GC extends GuildConfig, CNF extends ConfigLike>(client: C, msg: ExtendedMessage<C, UC, GC, CH>, cmd: Command<C, UC, GC>, config: CNF) {
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
