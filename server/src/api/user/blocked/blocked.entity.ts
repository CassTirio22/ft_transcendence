import { BaseEntity, Entity, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity('blocked')
export class Blocked extends BaseEntity {
    @PrimaryColumn({type: 'integer', name: 'requesterId'})
    requester!: number;

    @PrimaryColumn({type: 'integer', name: 'blockedId'})
    blocked!: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", name: "blockedDate" })
	public date!: Date;
}