import { Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Blocked } from "./blocked.entity";

@Injectable({})
export class BlockedService {
    constructor(@InjectRepository(Blocked) private blockedRepository: Repository<Blocked>){}

    //create
    requestBlocked(){}
    //get
    // getBlocked() {}
    // //delete
    // deleteBlocked() {}
}