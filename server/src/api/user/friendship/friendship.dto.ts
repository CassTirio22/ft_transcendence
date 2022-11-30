import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class RequestFriendDto {
	/**
	 * The User's pseudo that has been asked as a friend.
	 */
	@IsString()
	public readonly id: number;
}

export class ResponseFriendDto {
	@IsBoolean()
	public readonly didAccept: boolean;

	@IsNumber()
	public readonly applicant: number;
}

export class DeleteFriendDto {
	@IsNumber()
	public readonly applicant: number;
}