import { BaseEntity, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('direct')
export class Direct extends BaseEntity{
	@PrimaryGeneratedColumn({type: 'integer', name: 'directId'})
	id: string;
	
	@PrimaryColumn({type: 'integer', name: 'user1Id'})
	user1!: number;

	@PrimaryColumn({type: 'integer', name: 'user2Id'})
	user2!: number;
}
