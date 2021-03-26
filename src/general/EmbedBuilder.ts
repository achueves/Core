import Language from "./Language";
import Eris from "eris";

export default class EmbedBuilder<L extends string = string> {
	private lang: L;
	private json: Eris.EmbedOptions;
	private langObj: Language<L> | null;
	constructor(lang: L, langObj?: Language<L>) {
		this.lang = lang;
		this.json = {};
		this.langObj = langObj ?? null;
	}

	private formatString(str: string) {
		return this.langObj ? this.langObj.parseString(this.lang, str) : str;
	}

	getTitle() {
		return this.json.title;
	}

	setTitle(title: string) {
		this.json.title = this.formatString(title);
		return this;
	}

	removeTitle() {
		delete this.json.title;
		return this;
	}

	getDescription() {
		return this.json.description;
	}

	setDescription(description: string) {
		this.json.description = this.formatString(description);
		return this;
	}

	removeDescription() {
		delete this.json.description;
		return this;
	}

	getURL() {
		return this.json.url;
	}

	setURL(url: string) {
		this.json.url = url;
		return this;
	}

	removeURL() {
		delete this.json.url;
		return this;
	}

	getColor() {
		return this.json.color;
	}

	setColor(color: number | string) {
		this.json.color = typeof color === "string" ? parseInt(color.toString().replace(/#/g, ""), 16) : color;
		return this;
	}

	removeColor() {
		delete this.json.color;
		return this;
	}

	getTimestamp() {
		return this.json.timestamp;
	}

	setTimestamp(timestamp: number | Date | string) {
		this.json.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
		return this;
	}

	removeTimestamp() {
		delete this.json.timestamp;
		return this;
	}

	getFooter() {
		return this.json.footer;
	}

	setFooter(text: string, iconURL?: string) {
		this.json.footer = {
			text: this.formatString(text)
		};
		if (iconURL) this.json.footer.icon_url = iconURL;
		return this;
	}

	removeFooter() {
		delete this.json.footer;
		return this;
	}

	getThumbnail() {
		return this.json.thumbnail;
	}

	setThumbnail(url: string) {
		this.json.thumbnail = {
			url
		};
		return this;
	}

	removeThumbnail() {
		delete this.json.thumbnail;
		return this;
	}

	getImage() {
		return this.json.image;
	}

	setImage(url: string) {
		this.json.image = {
			url
		};
		return this;
	}

	removeImage() {
		delete this.json.image;
		return this;
	}

	getAuthor() {
		return this.json.author;
	}

	setAuthor(name: string, iconURL?: string, url?: string) {
		this.json.author = {
			name: this.formatString(name)
		};
		if (iconURL) this.json.author.icon_url = iconURL;
		if (url) this.json.author.url = url;
		return this;
	}

	removeAuthor() {
		delete this.json.author;
		return this;
	}

	addField(name: string, value: string, inline?: boolean) {
		inline = !!inline;
		if (!(this.json.fields instanceof Array)) this.json.fields = [];
		this.json.fields.push({
			name: this.formatString(name),
			value: this.formatString(value),
			inline
		});
		return this;
	}

	addEmptyField(inline?: boolean) {
		return this.addField("\u200b", "\u200b", inline);
	}


	addFields(...args: Array<Eris.EmbedField>) {
		args.map((a) => this.addField(a.name, a.value, a.inline));
		return this;
	}

	getFields() {
		return [...(this.json.fields ?? [])];
	}

	setFields(fields: Array<Eris.EmbedField>) {
		this.json.fields = fields;
	}

	toJSON(): Eris.EmbedOptions {
		return Object(this.json) as Eris.EmbedOptions; // to prevent external editing of internal properties
	}

	get [Symbol.toStringTag]() {
		return "EmbedBuilder";
	}
}
