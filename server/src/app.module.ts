import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvPath } from './common/helper/env.helper';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import { Interface } from 'readline';

/**
 * @type {string} envFilePath The path to the environment file
**/
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

/**
* Modified root module from NestJS. Parameters are defined by the ModuleMetadata interface.
 @parameters 
 * imports: List of imported modules exporting the required providers.
 * controllers: Set of controllers which must be instantiated.
 * providers: List of providers that will be instantiaed and can be shared across this module.
 * exports: Subset of providers in this module that should be available in modules which import this module.
**/
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}