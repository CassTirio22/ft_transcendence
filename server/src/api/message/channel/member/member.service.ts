import { Member } from './member.entity';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable({})
export class MemberService {
	constructor(
		@InjectRepository(Member) private memberRepository: Repository<Member>
	) {}
}