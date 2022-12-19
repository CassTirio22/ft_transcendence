import { Channel } from "./channel/channel.entity";
import { type } from "os";
import { Unique, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Direct } from "./direct/direct.entity";

// export enum ChannelType {
// 	direct,
// 	channel
// }

@Entity('message')
// @Unique(["id"])
export class Message extends BaseEntity {

	@PrimaryGeneratedColumn({type: 'integer'})
	public id!: number;

	// @PrimaryColumn({type: 'integer'})
	// origin_id!:	number;

	// @PrimaryColumn({type: 'enum', enum: ChannelType, default: ChannelType.direct})
	// origin_type!: ChannelType;

	@Column({type: 'integer'})
	author_id: number;

	@ManyToOne(type => User, user => user.wrote)
	@JoinColumn({name: "author_id"})
	author!: User;

	@ManyToOne(type => Direct, direct => direct.messages, {nullable: true})
	direct: Direct;

	@ManyToOne(type => Channel, channel => channel.messages, {nullable: true})
	channel: Channel;

	// @Column({name: 'type'})
	// type!: string;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}