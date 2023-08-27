import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import {
  RequireLogin,
  RequirePermission,
  UserInfo,
} from './decorator/custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  @RequireLogin()
  @RequirePermission(['ddd'])
  @SetMetadata('require-login', true)
  @SetMetadata('require-permission', ['ddd'])
  aaa(@UserInfo('username') username: string, @UserInfo() userInfo) {
    console.log('username', username);
    console.log('userInfo', userInfo);
    return 'aaa';
  }

  @Get('bbb')
  bbb() {
    return 'bbb';
  }
}
