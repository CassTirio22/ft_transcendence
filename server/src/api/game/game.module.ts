import { UserModule } from '../user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { AuthModule } from '../user/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User]), AuthModule, UserModule],
  controllers: [GameController],
  providers: [GameService]
})
export class GameModule {}
