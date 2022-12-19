import { Channel } from '../channel.entity';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "@/api/user/user.entity";

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
}