import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly origin: number;

	@IsString()
	@IsNotEmpty()
	public readonly content: string;
}