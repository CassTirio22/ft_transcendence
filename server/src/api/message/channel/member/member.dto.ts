import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class BecomeMemberDto {
	@IsString()
	public readonly level: string;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}

export class AddMemberDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;
}

export class GetMembersDto {
	@IsNumber()
	public readonly channel: number;
}

export class GetMembersLevelDto {
	@IsString()
	@IsNotEmpty()
	public readonly level: string;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}