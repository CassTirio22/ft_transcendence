import { BlockModule } from './user/block/block.module';
import { FriendshipModule } from './user/friendship/friendship.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [UserModule, GameModule, FriendshipModule, BlockModule]
})
export class ApiModule {}
