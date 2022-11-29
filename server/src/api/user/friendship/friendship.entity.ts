import { BaseEntity, Column, Entity } from 'typeorm';

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
	/**
	 * Has the request been accepted, rejected or is still pending.
	 */
	@Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.pending})
	public status!: FriendshipStatus;
	/**
	 * The ID of the User who made the friend request.
	 */
	@Column({ type: 'int'})
	public applicant!: number;
	/**
	 * The ID of the User who received the friend request and who will decide its status.
	 */
	@Column({ type: 'int'})
	public solicited!: number;
}