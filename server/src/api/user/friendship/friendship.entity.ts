import { BaseEntity, Column, Entity } from 'typeorm';

enum Status {
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
	@Column({ type: 'enum'})
	public status!: Status;
	/**
	 * The ID of the User who made the friend request.
	 */
	@Column({ type: 'number'})
	public applicant!: number;
	/**
	 * The ID of the User who received the friend request and who will decide its status.
	 */
	@Column({ type: 'number'})
	public solicited!: number;
}