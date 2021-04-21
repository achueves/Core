try {
	require("source-map-support/register");
// eslint-disable-next-line no-empty
} catch (e) {}
import DatabaseTypes, { ConfigDataTypes, ConfigEditTypes, MaybeId } from "./@types/db";
import DiscordTypes, {  Oauth2Info, APISelfUser, APIGuild } from "./@types/Discord";
import GeneralTypes, { ErisPermissions, CommandRestrictions, CategoryRestrictions, ProvidedClient, ProvidedClientExtra, ConfigLike } from "./@types/General";
import * as Restrictions from "./cmd/Restrictions";
import AntiSpam from "./cmd/AntiSpam";
import Category from "./cmd/Category";
import Command from "./cmd/Command";
import CommandError from "./cmd/CommandError";
import CommandHandler from "./cmd/CommandHandler";
import CooldownHandler from "./cmd/CooldownHandler";
import ExtraHandlers from "./cmd/ExtraHandlers";
import GuildConfig from "./db/Models/GuildConfig";
import UserConfig from "./db/Models/UserConfig";
import Database from "./db";
import BotFunctions from "./general/BotFunctions";
import ClientEvent from "./general/ClientEvent";
import * as FullColors from "./general/Colors";
export * from "./general/Constants";
import * as Constants from "./general/Constants";
import defaultEmojis from "./general/defaultEmojis.json";
import EmbedBuilder from "./general/EmbedBuilder";
import EvalUtil from "./general/EvalUtil";
import ExtendedMessage from "./general/ExtendedMessage";
import MessageCollector from "./general/MessageCollector";
import MonkeyPatch from "./general/MonkeyPatch";
import WebhookStore from "./general/WebhookStore";


export {
	DatabaseTypes, DiscordTypes, Restrictions, AntiSpam, Category,
	Command, CommandError, CommandHandler, CooldownHandler, ExtraHandlers,
	GuildConfig, UserConfig, Database, BotFunctions, ClientEvent,
	FullColors, Constants, defaultEmojis, EmbedBuilder, EvalUtil,
	ExtendedMessage,  MessageCollector, MonkeyPatch, WebhookStore, GeneralTypes,
	ConfigDataTypes, ConfigEditTypes, MaybeId, Oauth2Info, APISelfUser,
	APIGuild, ErisPermissions, CommandRestrictions, CategoryRestrictions, ProvidedClient,
	ProvidedClientExtra, ConfigLike
};
