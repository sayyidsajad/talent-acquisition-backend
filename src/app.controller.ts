import { Body, Controller, Post } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly jdParserService: JdParserService,
    private readonly questionGeneratorService: QuestionGeneratorService,
    private readonly candidateEvaluationService: CandidateEvaluationService,
  ) {}

  @Post('parse-jd')
  async parseJD(@Body('jd') jd: string) {
    return this.jdParserService.parseJD(jd);
  }

  @Post('generate-questions')
  async generateQuestions(@Body('parsedJD') parsedJD: any) {
    return this.questionGeneratorService.generateQuestions(parsedJD);
  }

  @Post('evaluate')
  async evaluateCandidate(@Body() body: any) {
    return this.candidateEvaluationService.evaluate(body.responses, body.parsedJD);
  }
}
