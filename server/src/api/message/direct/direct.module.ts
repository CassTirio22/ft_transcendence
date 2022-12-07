import { User } from "@/api/user/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DirectController } from "./direct.controller";
import { Direct } from "./direct.entity";
import { DirectService } from "./direct.service";

@Module({
	controllers: [DirectController],
	imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Direct])], 
	providers: [DirectService]
})
export class DirectModule {}