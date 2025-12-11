import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Income } from './incomes/income.entity';
import { IncomesModule } from './incomes/incomes.module';
import { PaginationModule } from './pagination/pagination.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Income],
      synchronize: true,
      // dropSchema: true,
    }),
    IncomesModule,
    PaginationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
