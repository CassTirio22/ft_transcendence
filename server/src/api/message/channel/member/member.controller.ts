import { Member } from './member.entity';
import { Controller } from "@nestjs/common";
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
	constructor(private service: MemberService){}
}