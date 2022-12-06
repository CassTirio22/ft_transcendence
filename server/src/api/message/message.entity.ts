import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity('message')
export class Message extends BaseEntity {
	@PrimaryColumn({name: 'originId'})
	origin!: string;

	@PrimaryColumn({name: 'userId'})
	author!: number;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}