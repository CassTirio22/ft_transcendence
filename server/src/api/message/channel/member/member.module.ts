import { Channel } from 'diagnostics_channel';
import { Member } from './member.entity';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
	imports:[TypeOrmModule.forFeature([Member, Channel])],
	controllers: [MemberController],
	providers: [MemberService],
})
export class MemberModule {}