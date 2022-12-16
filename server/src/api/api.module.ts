import { DirectModule } from './message/direct/direct.module';
import { MessageModule } from './message/message.module';
import { BlockModule } from './user/block/block.module';
import { FriendshipModule } from './user/friendship/friendship.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [UserModule, GameModule, FriendshipModule, BlockModule, MessageModule, DirectModule]
})
export class ApiModule {}
