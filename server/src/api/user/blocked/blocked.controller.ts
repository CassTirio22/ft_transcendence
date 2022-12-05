import { Body, Controller, Delete, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/auth.guard";
import { BlockedDto, DeleteBlockedDto } from "./blocked.dto";
import { Blocked } from "./blocked.entity";
import { BlockedService } from "./blocked.service";
import { Request } from 'express';
import { User } from "../user.entity";

@Controller('blocked')
export class BlockedController{
    constructor(private blockedService: BlockedService) {}

    /*
    ** TO Check : 
    **      -   Je n'ajoute pas le décorateur @UseInterceptors car je sais pas encore ce qu'il fgait exacetement à voir.
    **      -   Je n'ai pas mis never dans la promesse car il doit pas savoir renvoyer quelques chose d'autres que un blocked
    */
    //create
    @Post('blocked')
    @UseGuards(JwtAuthGuard)
    private requestBlocked(@Body() body: BlockedDto, @Req() req: Request): Promise<Blocked> {
        return this.blockedService.blocked(body, req);
    }
    //get
    @Get('getblocked')
    @UseGuards(JwtAuthGuard)
    private getBlocked(@Req() { user }: Request): Promise<User[]> {
        return this.blockedService.getBlocked(<User>user);
    }

    // //delete
    @Delete('delete')
    @UseGuards(JwtAuthGuard)
    private deleteBlocked(@Body() body: DeleteBlockedDto, @Req() req: Request): Promise<number> {
        return this.blockedService.deleteBlocked(body, req);
    }
}