import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateDirectDto {
	@IsNotEmpty()
	@IsNumber()
	public readonly id!: number;
}