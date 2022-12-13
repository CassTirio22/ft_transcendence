import { Column, BaseEntity, Entity, PrimaryColumn, PrimaryGeneratedColumn, OneToMany, JoinColumn, Unique } from "typeorm";
import { ChannelType, Message } from "../message.entity";

@Entity({name: 'direct'})
@Unique(["id"])
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn({type: 'integer'})
	id!: number;

	@Column({type: 'integer', name: 'user1Id'})
	user1!: number;

	@Column({type: 'integer', name: 'user2Id'})
	user2!: number;

	// @OneToMany(type => Message, message => message.directId)
	// messages: Message[];
}
