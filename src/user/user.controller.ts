import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto, RefreshTokenDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator';
import { generateParseIntPipe } from 'src/utils';

import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Post('refresh_token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log('refreshToken refreshTokenDto', refreshTokenDto);
    return this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('admin/refresh_token')
  async adminRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.adminRefreshToken(refreshTokenDto.refreshToken);
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    return this.userService.findUserDetailById(userId);
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    console.log('updatePasswordDto', updatePasswordDto);
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    return await this.userService.updatePasswordCaptcha(address);
  }

  @Post('update')
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    return await this.userService.updateCaptcha(address);
  }

  @Post('freeze')
  async freeze(@Query('id') userId: number) {
    return await this.userService.freezeUserById(userId);
  }

  @Get('list')
  async list(
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
    @Query('pageNo', generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query('pageSize', generateParseIntPipe('pageNo'))
    pageSize: number,
  ) {
    // TODO 应该还支持模糊查询等
    return await this.userService.findUsersByPage(
      username,
      nickName,
      email,
      pageNo,
      pageSize,
    );
  }
}
