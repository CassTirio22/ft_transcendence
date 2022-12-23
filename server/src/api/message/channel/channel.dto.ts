import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateChannelDto {
	@IsString()
	public readonly name: string;

	@IsString()
	@IsOptional()
	public readonly password: string;

	@IsString()
	@IsNotEmpty()
	public readonly status: string;
}

export class ChangeChannelDto {
	@IsString()
	@IsOptional()
	public readonly name: string;

	@IsString()
	@IsOptional()
	public readonly password: string;
	
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}

export class DeleteChannelDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}