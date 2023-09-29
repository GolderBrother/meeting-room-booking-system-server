import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto, RefreshTokenDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator';
import { generateParseIntPipe } from 'src/utils';
import { storage } from 'src/utils/file-storage';

import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { UserListVo } from './vo/user-list.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('init-data')
  async initData() {
    return await this.userService.initData();
  }

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    console.log('register registerUser', registerUser);
    return await this.userService.register(registerUser);
  }

  // 描述 query 参数
  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  // 描述响应。
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register_captcha')
  async registerCaptcha(@Query('address') address: string) {
    return await this.userService.registerCaptcha(address);
  }

  @Post('login')
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
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

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Post('refresh_token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log('refreshToken refreshTokenDto', refreshTokenDto);
    return this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '管理员刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Post('admin/refresh_token')
  async adminRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.adminRefreshToken(refreshTokenDto.refreshToken);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserDetailVo,
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    return this.userService.findUserDetailById(userId);
  }

  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '密码修改成功/密码修改失败',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() updatePasswordDto: UpdateUserPasswordDto) {
    console.log('updatePasswordDto', updatePasswordDto);
    return this.userService.updatePassword(updatePasswordDto);
  }

  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    return await this.userService.updatePasswordCaptcha(address);
  }

  @ApiBearerAuth()
  @ApiQuery({
    description: '用户信息',
    type: UpdateUserDto,
  })
  @ApiResponse({
    type: String,
    description: '用户信息修改成功/用户信息修改失败',
  })
  @Post('update')
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @RequireLogin()
  @Get('update/captcha')
  async updateCaptcha(@UserInfo('email') email: string) {
    console.log('updateCaptcha email', email);
    return await this.userService.updateCaptcha(email);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: '冻结成功',
  })
  @RequireLogin()
  @Post('freeze')
  async freeze(@Query('id') userId: number) {
    return await this.userService.freezeUserById(userId);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: Number,
    required: false,
  })
  @ApiResponse({
    type: UserListVo,
    description: '用户列表',
  })
  @RequireLogin()
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
    return await this.userService.findUsersByPage(
      username,
      nickName,
      email,
      pageNo,
      pageSize,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage,
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        const isImageFile = ['.png', '.jpg', '.gif', '.webp'].includes(extname);
        if (isImageFile) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadFile(file);
  }
}
