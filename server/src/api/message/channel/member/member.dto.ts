import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class BecomeMemberDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsString()
	@IsOptional()
	public readonly password: string;
}

export class AddMemberDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;
}

export class ChangeMemberStatusDto {
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
	public readonly status: string;
}

export class ChangeMemberLevelDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsString()
	@IsNotEmpty()
	public readonly level: string;
}

export class DeleteMemberDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;
}

export class QuitChannelDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsOptional()
	@IsNumber()
	public readonly newOwner: number;
}