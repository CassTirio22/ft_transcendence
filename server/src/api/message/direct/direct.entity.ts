import { User } from "@/api/user/user.entity";
import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, JoinTable, OneToMany, JoinColumn, Column, Unique } from "typeorm";
import { Message } from "../message.entity";

@Entity('direct')
// @Unique(["id"])
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn( {type: 'integer'} )
	public id!: number;
	
	@ManyToOne(type => User, user => user.directuser1)
	@JoinColumn()
	public user1!: User;

	@ManyToOne(type => User, user => user.directuser2)
	@JoinColumn()
	public user2!: User;

	// @OneToMany(type => Message, message => message.direct)
	// public allmessages: Message[];
}
