import { User } from "@/api/user/user.entity";
import { CreateDateColumn, BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Message } from "../message.entity";

@Entity('direct')
// @Unique(["id"])
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn( {type: 'integer'} )
	public id!: number;
	
	@ManyToOne(type => User, user => user.direct1, {onDelete: 'CASCADE'})
	public user1!: User;

	@ManyToOne(type => User, user => user.direct2, {onDelete: 'CASCADE'})
	public user2!: User;

	@OneToMany(type => Message, message => message.direct/*, {orphanedRowAction: 'delete', onDelete: 'CASCADE'}*/)
	public messages: Message[];

	@CreateDateColumn({type: 'varchar', default: () => "CURRENT_TIMESTAMP"})
	date!: string;
}
