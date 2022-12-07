import { IsNotEmpty, IsNumber } from "class-validator";

export class DirectDto {
	@IsNotEmpty()
	@IsNumber()
	public readonly user2!: number;
}