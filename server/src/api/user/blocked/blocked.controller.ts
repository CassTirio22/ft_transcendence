import { Controller, Delete, Get, Post } from "@nestjs/common";
import { BlockedService } from "./blocked.service";

@Controller('blocked')
export class BlockedController{
    constructor(private blockedService: BlockedService) {}

    //create
    @Post('request')
    requestBlocked() {
        return this.blockedService.requestBlocked();
    }
    //get
    // @Get('blocked')
    // getBlocked() {
    //     return this.blockedService.getBlocked();
    // }

    // //delete
    // @Delete('delete')
    // deleteBlocked() {
    //     return this.blockedService.deleteBlocked();
    // }
}