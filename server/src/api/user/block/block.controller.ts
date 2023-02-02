import { Body, Controller, Delete, Get, Post, Req, UseGuards, UseInterceptors, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { BlockDto, DeleteBlockDto } from "./block.dto";
import { Block } from "./block.entity";
import { BlockService } from "./block.service";
import { Request } from 'express';
import { User } from "../user.entity";

@Controller('block')
export class BlockController{
    constructor(private blockedService: BlockService) {}

    @Post('block')
    @UseGuards(JwtAuthGuard)
    private block(@Body() body: BlockDto, @Req() req: Request): Promise<Block> {
        return this.blockedService.block(body, req);
    }

    @Get('blocked')
    @UseGuards(JwtAuthGuard)
    private getBlocked(@Req() { user }: Request): Promise<User[]> {
        return this.blockedService.getBlockedList(<User>user);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    private deleteBlock(@Param() params, @Req() req: Request): Promise<number> {
        return this.blockedService.deleteBlock(req, params.id);
    }
}