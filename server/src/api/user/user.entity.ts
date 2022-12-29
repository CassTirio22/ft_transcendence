import { Member } from './../message/channel/member/member.entity';
import { channel } from 'diagnostics_channel';
import { Message } from './../message/message.entity';
import { Block } from './block/block.entity';
import { Friendship } from './friendship/friendship.entity';
import { Exclude } from 'class-transformer';
import { Game } from '../game/game.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany } from 'typeorm';


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
	@Column({ type: 'varchar'/*, select: false*/})
	public password!: string;
	/**
	 * The User's name
	 */
	@Column({ type: 'varchar', nullable: true, unique: true })
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

	@Column({type: 'varchar', nullable: true})
	public socket: string;

	@Column({type: 'varchar', nullable: true})
	public picture: string;

	@OneToMany(type => Game, game => game.winner)
	won: Game[];

	@OneToMany(type => Game, game => game.loser)
	lost: Game[];

	@OneToMany(type => Friendship, friendship => friendship.solicited)
	received:  Friendship[];

	@OneToMany(type => Friendship, friendship => friendship.applicant)
	sent: Friendship[];

	@OneToMany(type => Block, block => block.blocked)
	blockTo: Block[]

	@OneToMany(type => Block, block => block.blocker)
	blockedBy: Block[]

	@OneToMany(type => Direct, direct => direct.user1)
	direct1: Direct[];

	@OneToMany(type => Direct, direct => direct.user2)
	direct2: Direct[];

	@OneToMany(type => Message, message => message.author)
	wrote: Message[];

	@OneToMany(type => Member, member => member.user)
	membership: Member[];
}