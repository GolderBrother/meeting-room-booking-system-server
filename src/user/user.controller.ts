import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user-dto';
import { LoginUserDto, RefreshTokenDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('init-data')
  async initData() {
    return await this.userService.initData();
  }

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    console.log('register registerUser', registerUser);
    return await this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async registerCaptcha(@Query('address') address: string) {
    // const code = Math.random().toString().slice(2, 8);
    // await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    // await this.emailService.sendMail({
    //   to: address,
    //   html: `<p>你的注册验证码是 ${code}</p>`,
    //   subject: '注册验证码',
    // });
    // return '发送成功';
    return await this.userService.registerCaptcha(address);
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    console.log('login loginUser', loginUser);
    const userVo = await this.userService.login(loginUser, false);
    return userVo;
  }
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    console.log('adminLogin loginUser', loginUser);
    const userVo = await this.userService.login(loginUser, true);
    return userVo;
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log('refreshToken refreshTokenDto', refreshTokenDto);
    return this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('admin/refresh-token')
  async adminRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.adminRefreshToken(refreshTokenDto.refreshToken);
  }
}
