import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

export enum channelType {
	direct,
	channel
}

@Entity('message')
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn({name: 'messageId'})
	id!: number;
	
	@Column({name: 'originId'})
	origin!: string;

	@ManyToOne(() => User)
	author!: User;

	@Column({name: 'type'})
	type!: string;

	@CreateDateColumn({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
	date!: Date;

	@Column()
	content!: string;
}