import {
	JoinColumn,
	ManyToOne,
	Entity,
	PrimaryColumn,
	Index,
	Column,
	type Relation,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";

@Entity()
export class DriveFolder {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the DriveFolder.",
	})
	public createdAt: Date;

	@Column("varchar", {
		length: 128,
		comment: "The name of the DriveFolder.",
	})
	public name: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The owner ID.",
	})
	public userId: User["id"] | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment:
			"The parent folder ID. If null, it means the DriveFolder is located in root.",
	})
	public parentId: DriveFolder["id"] | null;

	//#region Relations
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
		nullable: true,
	})
	@JoinColumn()
	public user: Relation<User | null>;

	@ManyToOne(() => DriveFolder, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	public parent: Relation<DriveFolder | null>;
	//#endregion
}
