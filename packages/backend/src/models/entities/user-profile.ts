import {
	Entity,
	Column,
	Index,
	OneToOne,
	JoinColumn,
	PrimaryColumn,
	type Relation,
} from "typeorm";
import { ffVisibility, notificationTypes } from "@/types.js";
import { id } from "../id.js";
import { User } from "./user.js";
import { Page } from "./page.js";
import type { IMentionedRemoteUsers } from "./note.js";

// TODO: このテーブルで管理している情報すべてレジストリで管理するようにしても良いかも
//       ただ、「emailVerified が true なユーザーを find する」のようなクエリは書けなくなるからウーン
@Entity()
export class UserProfile {
	@PrimaryColumn(id())
	public userId: User["id"];

	@Column("varchar", {
		length: 128,
		nullable: true,
		comment: "The location of the User.",
	})
	public location: string | null;

	@Column("char", {
		length: 10,
		nullable: true,
		comment: "The birthday (YYYY-MM-DD) of the User.",
	})
	public birthday: string | null;

	@Index() // USING pgroonga pgroonga_varchar_full_text_search_ops_v2
	@Column("varchar", {
		length: 2048,
		nullable: true,
		comment: "The description (bio) of the User.",
	})
	public description: string | null;

	@Column("jsonb", {
		default: [],
	})
	public fields: {
		name: string;
		value: string;
		verified?: boolean;
	}[];

	@Column("jsonb", {
		default: [],
	})
	public mentions: IMentionedRemoteUsers;

	@Column("varchar", {
		length: 32,
		nullable: true,
	})
	public lang: string | null;

	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "Remote URL of the user.",
	})
	public url: string | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
		comment: "The email address of the User.",
	})
	public email: string | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public emailVerifyCode: string | null;

	@Column("boolean", {
		default: false,
	})
	public emailVerified: boolean;

	@Column("jsonb", {
		default: ["follow", "receiveFollowRequest", "groupInvited"],
	})
	public emailNotificationTypes: string[];

	@Column("boolean", {
		default: true,
	})
	public publicReactions: boolean;

	@Column("enum", {
		enum: ffVisibility,
		default: "public",
	})
	public ffVisibility: (typeof ffVisibility)[number];

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public twoFactorTempSecret: string | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public twoFactorSecret: string | null;

	@Column("boolean", {
		default: false,
	})
	public twoFactorEnabled: boolean;

	@Column("boolean", {
		default: false,
	})
	public securityKeysAvailable: boolean;

	@Column("boolean", {
		default: false,
	})
	public usePasswordLessLogin: boolean;

	@Column("varchar", {
		length: 128,
		nullable: true,
		comment:
			"The password hash of the User. It will be null if the origin of the user is local.",
	})
	public password: string | null;

	@Column("varchar", {
		length: 8192,
		default: "",
	})
	public moderationNote: string | null;

	@Column("boolean", {
		default: false,
	})
	public autoAcceptFollowed: boolean;

	@Column("boolean", {
		default: true,
		comment: "Whether reject index by crawler.",
	})
	public noCrawle: boolean;

	@Column("boolean", {
		default: true,
		comment: "Whether User is indexable.",
	})
	public isIndexable: boolean;

	@Column("boolean", {
		default: true,
	})
	public preventAiLearning: boolean;

	@Column("boolean", {
		default: false,
	})
	public alwaysMarkNsfw: boolean;

	@Column("boolean", {
		default: false,
	})
	public carefulBot: boolean;

	@Column("boolean", {
		default: true,
	})
	public injectFeaturedNote: boolean;

	@Column("boolean", {
		default: true,
	})
	public receiveAnnouncementEmail: boolean;

	@Column({
		...id(),
		nullable: true,
	})
	public pinnedPageId: Page["id"] | null;

	@Index()
	@Column("boolean", {
		default: false,
	})
	public enableWordMute: boolean;

	// whitespace: AND condition
	// array items: OR condition
	// e.g., ["alpha beta", "gamma"]
	//   does match     "alpha beta", "beta alpha alpha", "gamma alpha", "gamma epsilon"
	//   does not match "alpha", "beta gamma", "alpha alpha", "eplison"
	@Column("text", {
		array: true,
		default: "{}",
	})
	public mutedWords: string[];

	// array of regular expressions
	@Column("text", {
		array: true,
		nullable: false,
	})
	public mutedPatterns: string[];

	@Column("varchar", {
		length: 512,
		array: true,
		default: "{}",
		comment: "List of instances muted by the user.",
	})
	public mutedInstances: string[];

	@Column("enum", {
		enum: notificationTypes,
		array: true,
		default: [],
	})
	public mutingNotificationTypes: (typeof notificationTypes)[number][];

	//#region Denormalized fields
	@Index()
	@Column("varchar", {
		length: 512,
		nullable: true,
		comment: "[Denormalized]",
	})
	public userHost: string | null;
	//#endregion

	//#region Relations
	@OneToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: Relation<User>;

	@OneToOne(() => Page, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	public pinnedPage: Relation<Page | null>;
	//#endregion

	constructor(data: Partial<UserProfile>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
