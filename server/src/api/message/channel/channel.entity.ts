import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../message.entity";

export enum ChannelStatus {
	public, 
	protected, 
	private
}

@Entity('channel')
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	password: string;

	@Column({type: 'enum', enum: ChannelStatus, default: ChannelStatus.public})
	status: ChannelStatus;
}