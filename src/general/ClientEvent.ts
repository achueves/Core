/* eslint-disable @typescript-eslint/unified-signatures */
import { ProvidedClient, ProvidedClientExtra } from "../@types/General";
import {
	Call, OldCall, AnyChannel, TextableChannel, GroupChannel,
	User, OldGuildChannel, OldGroupChannel, FriendSuggestionReasons, Guild,
	PossiblyUncachedGuild, Emoji, Member, MemberPartial, Role,
	OldRole, UnavailableGuild, OldGuild, Invite, Message,
	PossiblyUncachedMessage, PartialEmoji, OldMessage, Relationship, Presence,
	RawRESTRequest, RawPacket, PartialUser, VoiceChannel, OldVoiceState,
	WebhookData
} from "eris";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// @TODO FIND A WAY TO MAKE THIS NOT MANUAL
export default class ClientEvent<C extends ProvidedClient | ProvidedClientExtra> {
	// I've spent months hours trying to figure this out, these can stay like this
	event: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	listener: Function;
	constructor(event: "ready" | "disconnect", listener: (this: C) => void);
	constructor(event: "callCreate" | "callRing" | "callDelete", listener: (this: C, call: Call) => void);
	constructor(event: "callUpdate", listener: (this: C, call: Call, oldCall: OldCall) => void);
	constructor(event: "channelCreate" | "channelDelete", listener: (this: C, channel: AnyChannel) => void);
	constructor(event: "channelPinUpdate", listener: (this: C, channel: TextableChannel, timestamp: number, oldTimestamp: number) => void);
	constructor(event: "channelRecipientAdd" | "channelRecipientRemove", listener: (this: C, channel: GroupChannel, user: User) => void);
	constructor(event: "channelUpdate", listener: (this: C, channel: AnyChannel, oldChannel: OldGuildChannel | OldGroupChannel) => void);
	constructor(event: "connect" | "shardPreReady", listener: (this: C, id: number) => void);
	constructor(event: "friendSuggestionCreate", listener: (this: C, user: User, reasons: FriendSuggestionReasons) => void);
	constructor(event: "friendSuggestionDelete", listener: (this: C, user: User) => void);
	constructor(event: "guildBanAdd" | "guildBanRemove", listener: (this: C, guild: Guild, user: User) => void);
	constructor(event: "guildAvailable" | "guildCreate", listener: (this: C, guild: Guild) => void);
	constructor(event: "guildDelete", listener: (this: C, guild: PossiblyUncachedGuild) => void);
	constructor(event: "guildEmojisUpdate", listener: (this: C, guild: Guild, emojis: Array<Emoji>, oldEmojis: Array<Emoji>) => void);
	constructor(event: "guildMemberAdd", listener: (this: C, guild: Guild, member: Member) => void);
	constructor(event: "guildMemberChunk", listener: (this: C, guild: Guild, members: Array<Member>) => void);
	constructor(event: "guildMemberRemove", listener: (this: C, guild: Guild, member: Member | MemberPartial) => void);
	constructor(event: "guildMemberUpdate", listener: (this: C, guild: Guild, member: Member, oldMember: { nick?: string; premiumSince: number; roles: Array<string>; pending?: boolean; } | null) => void);
	constructor(event: "guildRoleCreate" | "guildRoleDelete", listener: (this: C, guild: Guild, role: Role) => void);
	constructor(event: "guildRoleUpdate", listener: (this: C, guild: Guild, role: Role, oldRole: OldRole) => void);
	constructor(event: "guildUnavailable" | "unavailableGuildCreate", listener: (this: C, guild: UnavailableGuild) => void);
	constructor(event: "guildUpdate", listener: (this: C, guild: Guild, oldGuild: OldGuild) => void);
	constructor(event: "hello", listener: (this: C, trace: Array<string>, id: number) => void);
	constructor(event: "inviteCreate" | "inviteDelete", listener: (this: C, guild: Guild, invite: Invite) => void);
	constructor(event: "messageCreate", listener: (this: C, message: Message, /* everything after this is added by us */ update?: boolean, slash?: boolean, slashInfo?: { id: string; token: string; }) => void);
	constructor(event: "messageDelete" | "messageReactionRemoveAll", listener: (this: C, message: PossiblyUncachedMessage) => void);
	constructor(event: "messageReactionRemoveEmoji", listener: (this: C, message: PossiblyUncachedMessage, emoji: PartialEmoji) => void);
	constructor(event: "messageDeleteBulk", listener: (this: C, messages: Array<PossiblyUncachedMessage>) => void);
	constructor(event: "messageReactionAdd", listener: (this: C, message: PossiblyUncachedMessage, emoji: Emoji, reactor: Member | { id: string; }) => void);
	constructor(event: "messageReactionRemove", listener: (this: C, message: PossiblyUncachedMessage, emoji: PartialEmoji, userID: string) => void);
	constructor(event: "messageUpdate", listener: (this: C, message: Message, oldMessage: OldMessage | null) => void);
	constructor(event: "presenceUpdate", listener: (this: C, other: Member | Relationship, oldPresence: Presence | null) => void);
	constructor(event: "rawREST", listener: (this: C, request: RawRESTRequest) => void);
	constructor(event: "rawWS" | "unknown", listener: (this: C, packet: RawPacket, id: number) => void);
	constructor(event: "relationshipAdd" | "relationshipRemove", listener: (this: C, relationship: Relationship) => void);
	constructor(event: "relationshipUpdate", listener: (this: C, relationship: Relationship, oldRelationship: { type: number; }) => void);
	constructor(event: "typingStart", listener: (this: C, channel: TextableChannel | { id: string; }, user: User | { id: string; }, member: Member | null) => void);
	constructor(event: "userUpdate", listener: (this: C, user: User, oldUser: PartialUser | null) => void);
	constructor(event: "voiceChannelJoin", listener: (this: C, member: Member, newChannel: VoiceChannel) => void);
	constructor(event: "voiceChannelLeave", listener: (this: C, member: Member, oldChannel: VoiceChannel) => void);
	constructor(event: "voiceChannelSwitch", listener: (this: C, member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) => void);
	constructor(event: "voiceStateUpdate", listener: (this: C, member: Member, oldState: OldVoiceState) => void);
	constructor(event: "warn" | "debug", listener: (this: C, message: string, id: number) => void);
	constructor(event: "webhooksUpdate", listener: (this: C, data: WebhookData) => void);
	constructor(event: "shardReady" | "shardResume", listener: (this: C, id: number) => void);
	constructor(event: "shardDisconnect" | "error", listener: (this: C, err: Error, id: number) => void);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(event: string, listener: (this: C, ...args: Array<any>) => void) {
		this.event = event;
		this.listener = listener;
	}

	handle(client: C, ...d: Array<unknown>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this.listener.call(client, ...d);
	}
}
