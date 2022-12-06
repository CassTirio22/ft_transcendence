import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { FriendshipModule } from './user/friendship/friendship.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [UserModule, GameModule, FriendshipModule, MessageModule]
})
export class ApiModule {}
