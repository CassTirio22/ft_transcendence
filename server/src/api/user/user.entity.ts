import { Friendship } from './friendship/friendship.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../game/game.entity'


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

	@OneToMany(type => Game, game => game.winner)
	won: Game[];

	@OneToMany(type => Game, game => game.loser)
	lost: Game[];

	@OneToMany(type => Friendship, friendship => friendship.solicited)
	received:  Friendship[];

	@OneToMany(type => Friendship, friendship => friendship.applicant)
	sent: Friendship[];
}