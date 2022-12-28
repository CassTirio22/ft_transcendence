import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User])],
  controllers: [GameController],
  providers: [GameService]
})
export class GameModule {}
