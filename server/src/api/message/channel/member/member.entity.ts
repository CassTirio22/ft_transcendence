import { Channel } from '../channel.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from "typeorm";
import { User } from "@/api/user/user.entity";

export enum MemberStatus {
	regular,
	muted,
	banned
}

export enum MemberLevel {
	owner,
	administrator,
	regular
}

@Entity('member')
export class Member extends BaseEntity {
	
	@PrimaryColumn({type : 'integer'})
	user_id!: number;

	@PrimaryColumn({type: 'integer'})
	channel_id!: number;

	@ManyToOne( type => User, user => user.membership)
	@JoinColumn({name: 'user_id'})
	user!: User;

	@ManyToOne( type => Channel, channel => channel.members)
	@JoinColumn({name: 'channel_id'})
	channel!: Channel;

	@Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.regular})
	public status!: MemberStatus;

	@Column({type: 'enum', enum: MemberLevel, default: MemberLevel.regular})
	public level!: MemberLevel;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	block_until!: Date;
}