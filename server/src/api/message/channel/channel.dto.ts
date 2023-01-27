import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { ChannelStatus } from "./channel.entity";

export class CreateChannelDto {
	@IsString()
	public readonly name: string;

	@IsString()
	@IsOptional()
	@MinLength(6)
	public readonly password: string;

	@IsString()
	@IsNotEmpty()
	public readonly status: string;
}

export class EditChannelDto {
	@IsString()
	@IsOptional()
	public readonly name: string;

	@IsString()
	@MinLength(6)
	@IsOptional()
	public readonly password: string;
	
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;

	@IsOptional()
	public readonly status: ChannelStatus;
}

export class DeleteChannelDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly channel: number;
}