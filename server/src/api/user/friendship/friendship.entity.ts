import { BaseEntity, Column, PrimaryColumn, Entity, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

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
	 * The ID of the User who made the friend request.
	 */
	@PrimaryColumn({ name: "applicantId"})
	public applicant!: number;
	/**
	 * The ID of the User who received the friend request and who will decide its status.
	 */
	@PrimaryColumn({ name: "solicitedId"})
	public solicited!: number;
	/**
	 * Has the request been accepted, rejected or is still pending.
	 */
	@Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.pending})
	public status!: FriendshipStatus;
}