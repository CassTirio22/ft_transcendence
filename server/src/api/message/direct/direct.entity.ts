import { Column, BaseEntity, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { channelType } from "../message.entity";

@Entity('direct')
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn({type: 'integer', name: 'directId'})
	id: string;

	@PrimaryColumn({type: 'enum', enum: channelType, default: channelType.direct})
	
	@Column({type: 'integer', name: 'user1Id'})
	user1!: number;

	@Column({type: 'integer', name: 'user2Id'})
	user2!: number;
}
