import { Message } from './../message.entity';
import { Member } from './member/member.entity';
import { User } from '@/api/user/user.entity';
import { BaseEntity, Column, Entity, OneToMany, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export enum ChannelStatus {
	public, 
	protected, 
	private
}

@Entity('channel')
export class Channel extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@OneToMany(type => Member, member => member.channel/*, {orphanedRowAction: 'delete', onDelete: 'CASCADE'}*/)
	members: Member[];

	@OneToMany(type => Message, message => message.channel/*, {orphanedRowAction: 'delete', onDelete: 'CASCADE'}*/)
	messages: Message[];

	@Column()
	name: string;

	@Column({nullable: true})
	password: string;

	@Column({type: 'enum', enum: ChannelStatus, default: ChannelStatus.public})
	status: ChannelStatus;

	@CreateDateColumn({type: 'varchar', default: () => "CURRENT_TIMESTAMP"})
	date!: string;
}