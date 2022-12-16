import { IsNotEmpty, IsNumber } from "class-validator";

export class BlockDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly id: number
}

export class DeleteBlockDto{
	@IsNumber()
	@IsNotEmpty()
	public readonly id: number
}