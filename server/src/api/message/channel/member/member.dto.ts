import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class BecomeMemberDto {
	@IsString()
	@IsOptional()
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
	@IsNotEmpty()
	public readonly channel: number;
}

export class ChangeMemberDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsDateString()
	@IsNotEmpty()
	public readonly time: string;

	@IsString()
	@IsNotEmpty()
	public readonly toChange: string;
}

export class QuitChannelDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}