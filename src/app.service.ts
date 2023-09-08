import { Injectable, Logger } from '@nestjs/common';

export interface TestDTO {
  data: {
    user_id: string;
    user_name: string;
    request_id: string;
  };
}
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor() {}
  getHello(): string {
    this.logger.log('hello');
    return 'Hello World!';
  }
}
