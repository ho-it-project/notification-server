import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  health() {
    return 'OK';
  }

  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
