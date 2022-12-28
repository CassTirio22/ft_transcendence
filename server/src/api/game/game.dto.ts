import { IsBoolean, IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { User } from '../user/user.entity';

export class StartCompetitiveGameDto {
	@IsNumber()
	public readonly player1Id: number;

	@IsNumber()
	public readonly player2Id: number;
}

export class StartFriendlyGameDto {
	@IsNumber()
	public readonly id: number;
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

export class JoinGameDto {
	@IsNumber()
	public readonly game: number;
}

export class DeleteGameDto {
	@IsNumber()
	public readonly gameId: number;
}