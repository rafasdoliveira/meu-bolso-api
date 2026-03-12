import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { ExpenseCategory } from './expense-categories/entities/expense-category.entity';
import { ExpenseSubcategory } from './expense-categories/entities/expense-subcategory.entity';
import { Expense } from './expenses/entities/expense.entity';
import { ExpensesModule } from './expenses/expenses.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoicesModule } from './invoices/invoices.module';
import { IncomeStatus } from './incomes/entities/income-status.entity';
import { Income } from './incomes/entities/income.entity';
import { IncomesModule } from './incomes/incomes.module';
import { PaginationModule } from './pagination/pagination.module';
import { PaymentMethod } from './payment-methods/entities/payment-method.entity';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { PaymentTypesModule } from './payment-types/payment-types.module';
import { PaymentTypes } from './payment-types/payment_types.entity';
import { IncomeSources } from './sources/entities/sources.entity';
import { SourcesModule } from './sources/sources.module';
import { PasswordResetToken } from './users/entities/password-reset-token.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Income, PaymentTypes, IncomeStatus, IncomeSources, Expense, ExpenseCategory, ExpenseSubcategory, PaymentMethod, Invoice, User, PasswordResetToken],
      }),
    }),
    AuthModule,
    UsersModule,
    IncomesModule,
    SourcesModule,
    PaginationModule,
    PaymentTypesModule,
    PaymentMethodsModule,
    ExpensesModule,
    ExpenseCategoriesModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
