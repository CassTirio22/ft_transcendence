import { channel } from 'diagnostics_channel';
import { Channel } from "./channel/channel.entity";
import { type } from "os";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Direct } from "./direct/direct.entity";

export enum ChannelType {
	direct,
	channel
}

@Entity('message')
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn({type: 'integer'})
	id!: number;
	
	// @PrimaryColumn({type: 'enum', enum: ChannelType})
	// origin_type!: ChannelType;

	@Column({type: 'integer'})
	author_id: number;

	@ManyToOne(type => User, user => user.wrote)
	@JoinColumn({name: "author_id"})
	author!: User;

	@Column({type: 'integer', nullable: true})
	direct_id: number;

	@Column({type: 'integer', nullable: true})
	channel_id: number;

	@ManyToOne(type => Direct, direct => direct.messages)
	@JoinColumn({name: "direct_id"})
	direct: Direct;

	@ManyToOne(() => Channel, channel => channel.messages)
	@JoinColumn({name: "channel_id"})
	channel: Channel;

	// @Column({name: 'type'})
	// type!: string;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}