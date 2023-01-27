import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from "../user/user.entity"


export enum GameType {
	friendly,
	competitive
}

export enum GameStatus {
	pending,
	ongoing,
	done,
	interrupted
}

@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn( { type: 'integer' } )
	public id!: number;

	@CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", name: "gameDate" })
	public date!: Date;

	@Column({type: 'integer'})
	public winner_id: number;

	@Column({type: 'integer', nullable: true})
	public loser_id: number;

	@ManyToOne(type => User, user => user.won)
	@JoinColumn({name: "winner_id"})
	public winner: User;

	@ManyToOne(type => User, user => user.lost, {nullable: true})
	@JoinColumn({name: "loser_id"})
	public loser: User;

	@Column({ type: 'integer', default: 0 })
	public winnerScore!: number;
	
	@Column({ type: 'integer', default: 0 })
	public loserScore!: number;

	@Column({ type: 'integer', default: 0})
	public elo!: number; 
	
	@Column({ type: 'enum', enum: GameType, default: GameType.friendly})
	public type!: GameType;

	@Column({ type: 'enum', enum: GameStatus, default: GameStatus.ongoing})
	public status!: GameStatus;

	// @Column({ type:  })
}