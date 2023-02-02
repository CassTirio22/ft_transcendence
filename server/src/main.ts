import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from "path"

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
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials:true,
	});

	app.useStaticAssets(join(__dirname, '..', 'uploads'), {
		index: false,
		prefix: '/uploads',
	});

	await app.listen(port, () => {
		console.log('[WEB]', `http://0.0.0.0:${port}`);
	});
}

bootstrap();