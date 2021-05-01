import * as FullColors from "./Colors";
// import Eris from "eris";


export const Colors = {
	gold: 0xFFD700,
	orange: 0xFFA500,
	red: 0xDC143C,
	green: 0x008000,
	white: 0xFFFFFF,
	black: 0x000000,
	brown: 0x8B4513,
	pink: 0xFFC0CB,
	hotPink: 0xFF69B4,
	deepPink: 0xFF1493,
	violet: 0xEE82EE,
	magenta: 0xFF00FF,
	darkViolet: 0x9400D3,
	purple: 0x800080,
	indigo: 0x4B0082,
	maroon: 0x800000,
	cyan: 0x00FFFF,
	teal: 0x008080,
	blue: 0x0000FF,
	random: () => Math.floor(Math.random() * 0xFFFFFF),
	Full: FullColors,
	furry: 0xB86220,
	npm: 0xCB3837
};

export const GAME_TYPES = {
	PLAYING: 0,
	STREAMING: 1,
	LISTENING: 2,
	WATCHING: 3,
	CUSTOM: 4,
	COMPETING: 5
} as const;

// moved to language
/* export const ChannelNames = {
	[Eris.Constants.ChannelTypes.GUILD_TEXT]: "Text",
	[Eris.Constants.ChannelTypes.DM]: "Direct Message",
	[Eris.Constants.ChannelTypes.GUILD_VOICE]: "Voice",
	[Eris.Constants.ChannelTypes.GUILD_CATEGORY]: "Category",
	[Eris.Constants.ChannelTypes.GROUP_DM]: "Group Direct Message",
	[Eris.Constants.ChannelTypes.GUILD_NEWS]: "News",
	[Eris.Constants.ChannelTypes.GUILD_STORE]: "Store",
	[Eris.Constants.ChannelTypes.GUILD_STAGE]: "Stage"
}; */
