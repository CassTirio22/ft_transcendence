import { Channel } from "./channel/channel.entity";
import { type } from "os";
import { Unique, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Direct } from "./direct/direct.entity";

@Entity('message')
export class Message extends BaseEntity {

	@PrimaryGeneratedColumn({type: 'integer'})
	public id!: number;

	@Column({type: 'integer'})
	author_id: number;

	@ManyToOne(type => User, user => user.wrote)
	@JoinColumn({name: "author_id"})
	author!: User;

	@ManyToOne(type => Direct, direct => direct.messages, {nullable: true})
	direct: Direct;

	@ManyToOne(type => Channel, channel => channel.messages, {nullable: true})
	channel: Channel;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}