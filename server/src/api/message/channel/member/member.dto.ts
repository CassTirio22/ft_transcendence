import { Member } from './member.entity';
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class BecomeMemberDto {
	@IsString()
	public readonly level: string;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}

export class AddMemberDto {
	@IsString()
	public readonly level: string;

	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly member: number;
}