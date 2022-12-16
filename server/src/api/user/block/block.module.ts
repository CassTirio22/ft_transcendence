import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user.entity";
import { BlockController } from "./block.controller";
import { Block } from "./block.entity";
import { BlockService } from "./block.service";

@Module({
    controllers: [BlockController],
    imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Block])],
    providers: [BlockService],
})
export class BlockModule {}