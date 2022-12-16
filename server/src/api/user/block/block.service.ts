import { HttpException, HttpStatus, Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../user.entity";
import { BlockDto, DeleteBlockDto } from "./block.dto";
import { Block } from "./block.entity";
import { Request } from 'express';
import { NOTFOUND } from "dns";

@Injectable({})
export class BlockService {
	constructor(
		@InjectRepository(Block) private blockedRepository: Repository<Block>,
		@InjectRepository(User) private userRepository: Repository<User>
	){}

	public async block(body: BlockDto, req: Request): Promise<Block>
	{
		const user: User = <User>req.user;
		const { id }: BlockDto = body;

		//regarder si la relation a bloqué existe
			//si elle existe pas exception not find ()
		const block: User = await this.userRepository.findOne( { where: {id: id} } );
		if (!block)
		{
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		
		//regarder que le blocage n'existe pas encore (dans se sens la)
			//Si existe conflit
		let relation: Block = await this.blockedRepository.findOne( {where: {requester: user.id, block: block.id}})
		if (relation)
		{
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}

		//mettre les informations dans un objet 
		relation = new Block;
		relation.requester = user.id;
		relation.block = block.id;
		
		return this.blockedRepository.save(relation);//sauver l'object dans la base de donnée; 
	}

	public async getBlocked(user: User): Promise<User[]> 
	{
		const listblocked: User[] = await this.userRepository.find( 
			{where: 
				{id: In(
					(await this.blockedRepository.find({ select: ["block"], where: {requester: user.id}})).map(Block => Block.block)
				)}});
		return listblocked;
	}

	public async deleteBlock(body: DeleteBlockDto, req: Request): Promise<number> 
	{
		const user: User = <User>req.user;
		const { id }: DeleteBlockDto = body;

		//regarde que la relation existe
			//si elle n'existe pas retourne not found 
		const relation: Block = await this.blockedRepository.findOne( { where: {requester: user.id, block: id}})
		if (!relation)
			return 0;
		this.blockedRepository.remove(relation);
		return 1;//supprimer l'entité dans la base de donnée
	}
}