import { IsNotEmpty, IsNumber } from "class-validator";

export class BlockedDto {
	/*
	** The user's id who is blocked
	*/
	@IsNumber()
	@IsNotEmpty()
	public readonly id: number
}

export class DeleteBlockedDto{
	/*
	** The user's id who i blocked
	*/
	@IsNumber()
	@IsNotEmpty()
	public readonly id: number
}