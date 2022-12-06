import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto } from "./message.dto";
import { Message } from "./message.entity";

@Injectable()
export class MessageService {
	@InjectRepository(User)
	private readonly userRepository : Repository<User>;
	@InjectRepository(Message)
	private readonly messageRepository: Repository<Message>;

	//create message
	public async sendmessage(body: SendDto, req: Request) {
		// const user: User = <User>req.user;
		// const { origin }: SendDto = body;
		// const { content }: SendDto = body;

		/*
		**	Je vérfie que l'origin existe
		**	To Check: 
		*/
		//vérifier que l'origin existe
			//Not found()
		//si préfixe == direct
			//vérifier qu'il y ait pas de bloc dans les deux cas
				//renvois un objet null si blocked
		//si préfixe == channel
			//vérifie qu'il existe un ChannelUser de ce user avec cet id 
				//renvoi Objet Null
				//vérifier que utilisateur soit pas mute ou banner 
					//renvois un objet null 
		//J'enregistre les données dans un objet 
		return ;//Je save l'objet et je le renvois 
	}

	//get all the conversation
	getconversation() {}
}