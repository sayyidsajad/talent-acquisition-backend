import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JdParserModule } from './jd-parser/jd-parser.module';
import { QuestionGeneratorModule } from './question-generator/question-generator.module';
import { CandidateEvaluationModule } from './candidate-evaluation/candidate-evaluation.module';

@Module({
  imports: [JdParserModule, QuestionGeneratorModule, CandidateEvaluationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
