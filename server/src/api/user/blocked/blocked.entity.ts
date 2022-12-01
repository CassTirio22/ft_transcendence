import { BaseEntity, Entity, PrimaryColumn } from "typeorm";

@Entity('blocked')
export class Blocked extends BaseEntity {
    @PrimaryColumn({type: 'integer', name: 'requesterId'})
    requester: number;

    @PrimaryColumn({type: 'integer', name: 'blockedId'})
    blocked: number;
}