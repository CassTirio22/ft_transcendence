import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { AuthController } from './auth.controller';
import { AuthHelper } from './auth.helper';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { ConfigService } from '@nestjs/config';

/**
* The authentification module. Imports Passport, JWT and TypeORM modules as they are needed.
* Documentation : https://docs.nestjs.com/modules
 @parameters 
 * imports: List of imported modules exporting the required providers.
 * controllers: Set of controllers which must be instantiated.
 * providers: List of providers that will be instantiaed and can be shared across this module.
 * exports: Subset of providers in this module that should be available in modules which import this module.
**/
@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get('JWT_KEY'),
				signOptions: { expiresIn: config.get('JWT_EXPIRES') },
			}),
		}),
		TypeOrmModule.forFeature([User]),
	],
	controllers: [AuthController],
	providers: [AuthService, AuthHelper, JwtStrategy],
})
export class AuthModule {}