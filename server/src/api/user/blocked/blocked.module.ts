import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user.module";
import { BlockedController } from "./blocked.controller";
import { Blocked } from "./blocked.entity";
import { BlockedService } from "./blocked.service";

@Module({
    controllers: [BlockedController],
    imports: [TypeOrmModule.forFeature([Blocked])],
    providers: [BlockedService],
})
export class BlockedModule {}