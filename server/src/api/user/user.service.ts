import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UpdateNameDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  public async updateName(body: UpdateNameDto, req: Request): Promise<number> {
    const user: User = <User>req.user;

	let duplicate: User = (await this.repository.createQueryBuilder()
		.select()
		.where("name = :pseudo", {pseudo: body.name})
		.getOne())
	if (duplicate) {
		throw new HttpException("Conflict", HttpStatus.CONFLICT);
	}
	return (await this.repository.createQueryBuilder()
		.update()
		.set( { name: body.name } )
		.where("id = :userId", {userId: user.id})
		.execute()).affected;
  }

  public async profile(user: User): Promise<User | never> {
	return user;
  }
}