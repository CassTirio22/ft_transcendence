import { BaseEntity, Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../user.entity"

@Entity('block')
export class Block extends BaseEntity {
    @PrimaryColumn({type: 'integer'})
    public blocker_id!: number;

    @PrimaryColumn({type: 'integer'})
    public blocked_id!: number;

	@ManyToOne( type => User, user => user.blockTo)
	@JoinColumn({name: "blocker_id"})
	public blocker!: User;

	@ManyToOne( type => User, user => user.blockedBy)
	@JoinColumn({name: "blocked_id"})
	public blocked!: User;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", name: "blockedDate" })
	public date!: Date;
}