import { Body, Controller, Delete, Get, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { BlockDto, DeleteBlockDto } from "./block.dto";
import { Block } from "./block.entity";
import { BlockService } from "./block.service";
import { Request } from 'express';
import { User } from "../user.entity";

@Controller('block')
export class BlockController{
    constructor(private blockedService: BlockService) {}

    @Post('blockUser')
    @UseGuards(JwtAuthGuard)
    private requestBlocked(@Body() body: BlockDto, @Req() req: Request): Promise<Block> {
        return this.blockedService.block(body, req);
    }

    @Get('block')
    @UseGuards(JwtAuthGuard)
    private getBlocked(@Req() { user }: Request): Promise<User[]> {
        return this.blockedService.getBlocked(<User>user);
    }

    @Delete('delete')
    @UseGuards(JwtAuthGuard)
    private deleteBlocked(@Body() body: DeleteBlockDto, @Req() req: Request): Promise<number> {
        return this.blockedService.deleteBlock(body, req);
    }
}