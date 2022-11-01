
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@/api/user/user.entity';

/**
 * A Guard class used for the JWT authorization (not to confuse with authentification).
 * Documentation : https://docs.nestjs.com/guards
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
	/**
	 * 
	 * @param err 
	 * @param user 
	 * @returns 
	 */
	public handleRequest(err: unknown, user: User): any {
		return user;
	}

	/**
	 * Check if the request can proceed depending on the context (authenticated user).
	 * @param context Interface describing details about the current request pipeline.
	 * @returns If true the request will be processed else it will be denied.
	 */
	public async canActivate(context: ExecutionContext): Promise<boolean> {
		await super.canActivate(context);

		const { user }: Request = context.switchToHttp().getRequest();

		return user ? true : false;
	}
}