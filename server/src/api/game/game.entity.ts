import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum GameType {
	friendly,
	competitive
}

export enum GameStatus {
	ongoing,
	done,
	interrupted
}

@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn( { type: "integer" } )
	public id!: number;

	@CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", name: "gameDate" })
	public date!: Date;

	@Column({ type: 'integer' })
	public winner!: number;

	@Column({ type: 'integer' })
	public loser!: number;

	@Column({ type: 'integer', default: 0 })
	public winnerScore!: number;
	
	@Column({ type: 'integer', default: 0 })
	public loserScore!: number;
	
	@Column({ type: 'enum', enum: GameType, default: GameType.friendly})
	public type!: GameType;

	@Column({ type: 'enum', enum: GameStatus, default: GameStatus.ongoing})
	public status!: GameStatus;

	@Column({ type: 'integer', nullable: true })
	public channel: number; 
}