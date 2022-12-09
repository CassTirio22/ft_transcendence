import { BaseEntity, Column, PrimaryColumn, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, RelationOptions } from 'typeorm';
import { User } from "../user.entity"

export enum FriendshipStatus {
	pending,
	accepted,
	rejected
}

/**
 * Friendship tables are used to know the status of friendship
 * application and who is friend to who.
 */
@Entity()
export class Friendship extends BaseEntity {
	@PrimaryColumn({type: 'integer'})
	applicant_id!: number;

	@PrimaryColumn({type: 'integer'})
	solicited_id!: number;
	/**
	 * The ID of the User who made the friend request.
	 */
	@ManyToOne( type => User, user => user.askees)
	@JoinColumn({name: "applicant_id"})
	public applicant!: User;
	/**
	 * The ID of the User who received the friend request and who will decide its status.
	 */
	@ManyToOne( type => User, user => user.askers)
	@JoinColumn({name: "solicited_id"})
	public solicited!: User;
	/**
	 * Has the request been accepted, rejected or is still pending.
	 */
	@Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.pending})
	public status!: FriendshipStatus;
}