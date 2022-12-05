import { HttpException, HttpStatus, Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../user.entity";
import { BlockedDto, DeleteBlockedDto } from "./blocked.dto";
import { Blocked } from "./blocked.entity";
import { Request } from 'express';
import { NOTFOUND } from "dns";

@Injectable({})
export class BlockedService {
	constructor(
		@InjectRepository(Blocked) private blockedRepository: Repository<Blocked>,
		@InjectRepository(User) private userRepository: Repository<User>
	){}

	//create
	public async blocked(body: BlockedDto, req: Request): Promise<Blocked>
	{
		const user: User = <User>req.user;
		const { id }: BlockedDto = body;

		//regarder si la relation a bloqué existe
			//si elle existe pas exception not find ()
		const blocked: User = await this.userRepository.findOne( { where: {id: id} } );
		if (!blocked)
		{
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		
		//regarder que le blocage n'existe pas encore (dans se sens la)
			//Si existe conflit
		let relation: Blocked = await this.blockedRepository.findOne( {where: {requester: user.id, blocked: blocked.id}})
		if (relation)
		{
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}

		//mettre les informations dans un objet 
		relation = new Blocked;
		relation.requester = user.id;
		relation.blocked = blocked.id;
		
		return this.blockedRepository.save(relation);//sauver l'object dans la base de donnée; 
	}

	//get
	public async getBlocked(user: User): Promise<User[]> 
	{
		const listblocked: User[] = await this.userRepository.find( 
			{where: 
				{id: In(
					(await this.blockedRepository.find({ select: ["blocked"], where: {requester: user.id}})).map(Blocked => Blocked.blocked)
				)}});
		return listblocked;
	}

	// //delete
	public async deleteBlocked(body: DeleteBlockedDto, req: Request): Promise<number> 
	{
		const user: User = <User>req.user;
		const { id }: DeleteBlockedDto = body;

		//regarde que la relation existe
			//si elle n'existe pas retourne not found 
		const relation: Blocked = await this.blockedRepository.findOne( { where: {requester: user.id, blocked: id}})
		if (!relation)
			return 0;
		this.blockedRepository.remove(relation);
		return 1;//supprimer l'entité dans la base de donnée
	}
}