import { User } from "@/api/user/user.entity";
import { CreateDateColumn, BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Column } from "typeorm";
import { Message } from "../message.entity";

@Entity('direct')
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn( {type: 'integer'} )
	public id!: number;

	@Column({type: 'integer'})
	public user1_id: number;

	@Column({type: 'integer'})
	public user2_id: number;
	
	@ManyToOne(type => User, user => user.direct1, {onDelete: 'CASCADE'})
	@JoinColumn({name: 'user1_id'})
	public user1!: User;

	@ManyToOne(type => User, user => user.direct2, {onDelete: 'CASCADE'})
	@JoinColumn({name: 'user2_id'})
	public user2!: User;

	@OneToMany(type => Message, message => message.direct/*, {orphanedRowAction: 'delete', onDelete: 'CASCADE'}*/)
	public messages: Message[];

	@CreateDateColumn({type: 'varchar', default: () => "CURRENT_TIMESTAMP"})
	date!: string;
}
