import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ExamsModule } from './modules/exams/exams.module';
import { TrainingModule } from './modules/training/training.module';
import { StatsModule } from './modules/stats/stats.module';
import { RulesModule } from './modules/rules/rules.module';
import { SignsModule } from './modules/signs/signs.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    TopicsModule,
    QuestionsModule,
    ExamsModule,
    TrainingModule,
    StatsModule,
    RulesModule,
    SignsModule,
    AdminModule,
    UsersModule,
    ReportsModule,
    IngestionModule,
  ],
})
export class AppModule {}
