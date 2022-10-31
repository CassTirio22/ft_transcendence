import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

/**
 * Every NestJS application needs to be boostrapped.
 * We create :
** 	-app : The root module created using NestFactory.
** 	-config : Call to ConfigService through ConfigModule which will set correctly config using the environmnet.
** 	-port : The port (detailed in the environment in our case)
 * Once the setting is done we :
** 	-create a validation pipe : the requests body will be checked depending of the conditions we put there. Options documentation : https://docs.nestjs.com/techniques/validation
** 	-enable CORS : we allow some resources to be requested from another domain. CORS optional configuration documentation : https://github.com/expressjs/cors#configuration-options
** 	-we listen the port we set.
 */
async function bootstrap() {
	const app: NestExpressApplication = await NestFactory.create(AppModule);
	const config: ConfigService = app.get(ConfigService);
	const port: number = config.get<number>('PORT');

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	app.enableCors({
		origin: "http://localhost:3000",
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials:true,
	});

	await app.listen(port, () => {
		console.log('[WEB]', `http://localhost:${port}`);
	});
}

bootstrap();