import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendDto {

	@IsBoolean()
	@IsNotEmpty()
	public readonly isDirect: boolean;

	@IsNumber()
	@IsNotEmpty()
	public readonly origin: number;

	@IsString()
	@IsNotEmpty()
	public readonly content: string;
}

export class MessagesDto {
	@IsNotEmpty()
	@IsNumber()
	public readonly origin: number;
}