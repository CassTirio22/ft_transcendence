import { BaseEntity, Entity, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity('block')
export class Block extends BaseEntity {
    @PrimaryColumn({type: 'integer', name: 'requesterId'})
    public requester!: number;

    @PrimaryColumn({type: 'integer', name: 'blockedId'})
    public block!: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", name: "blockedDate" })
	public date!: Date;
}