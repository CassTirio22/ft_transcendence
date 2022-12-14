import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Direct } from '../message/direct/direct.entity';


export enum UserStatus {
	online,
	offline,
	inGame
}

/**
 * A custom User Entity which will be a table in our DB created by TypeORM.
 */
@Entity()
export class User extends BaseEntity {
	/**
	 * The User's id
	 */
	@PrimaryGeneratedColumn( {type: 'integer'} )
	public id!: number;
	/**
	 * The User's email 
	 */	
	@Column({ type: 'varchar' })
	public email!: string;
	/**
	 * The User's password. Note that it will be removed from the response data.
	 */
	@Exclude()
	@Column({ type: 'varchar' })
	public password!: string;
	/**
	 * The User's name
	 */
	@Column({ type: 'varchar', nullable: true })
	public name: string | null;	
	/**
	 * The User's last connection date.
	 */
	@Column({ type: 'timestamp', nullable: true, default: null })
	public lastLoginAt: Date | null;
	/**
	 * The User's ELO score
	 */
	@Column({ type: 'int', default: 1000})
	public score: number;
	/**
	 * How many games did the User played
	 */
	@Column({ type: 'int', default: 0})
	public gamesNumber: number;
	/**
	 * Is the User online, offline or playing a game 
	 */
	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.online})
	public status!: UserStatus;

	@OneToMany(type => Direct, direct => direct.user1)
	directuser1: Direct[];

	@OneToMany(type => Direct, direct => direct.user2)
	directuser2: Direct[];
}