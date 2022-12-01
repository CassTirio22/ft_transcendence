import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class StartCompetitiveGameDto {
	@IsNumber()
	public readonly opponentId: number;
}

export class StartFriendlyGameDto {
	@IsNumber()
	public readonly channelId: number;
}

export class UpdateGameDto {
	@IsNumber()
	public readonly gameId: number;

	@IsNumber()
	public readonly winnerId: number;

	@IsNumber()
	public readonly winnerScore: number;

	@IsNumber()
	public readonly loserScore: number;

	@IsBoolean()
	public readonly didInterrupt: boolean;
}

export class DeleteGameDto {
	@IsNumber()
	public readonly gameId: number;
}