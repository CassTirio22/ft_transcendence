import { IsNotEmpty, IsString } from "class-validator";

export class SendDto {
	@IsString()
	@IsNotEmpty()
	public readonly origin: string;

	@IsString()
	@IsNotEmpty()
	public readonly content: string;
}