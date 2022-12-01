import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { FriendshipModule } from './user/friendship/friendship.module';

@Module({
  imports: [UserModule, GameModule, FriendshipModule]
})
export class ApiModule {}
