import { Channel } from "diagnostics_channel";
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

	@ManyToOne(type => User, user => user.wrote)
	author!: User;

	@Column({type: 'integer'})
	direct_id: number;

	@ManyToOne(type => Direct, direct => direct.messages)
	@JoinColumn({name: "direct_id"})
	direct: Direct;

	// @ManyToOne(() => Channel)
	// channelId: Channel;

	// @Column({name: 'type'})
	// type!: string;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}