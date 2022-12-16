import { FriendshipModule } from './user/friendship/friendship.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { BlockModule } from './user/block/block.module'

@Module({
  imports: [UserModule]
})
export class ApiModule {}
