import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateGameDto {
	@IsBoolean()
	@IsNotEmpty()
	public readonly friendly: boolean;
}
export class UpdateGameDto {
	@IsString()
	@IsNotEmpty()
	public readonly address: string;

	@IsNumber()
	@IsNotEmpty()
	public readonly winnerId: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly winnerScore: number;

	@IsNumber()
	@IsNotEmpty()
	public readonly loserScore: number;

	@IsBoolean()
	@IsNotEmpty()
	public readonly didInterrupt: boolean;
}

export class JoinGameDto {
	@IsString()
	@IsNotEmpty()
	public readonly address: string;
}