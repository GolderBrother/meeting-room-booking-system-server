import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录用户数据传输对象
 */
export class LoginUserDto {
  /**
   * 用户名
   */
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  @ApiProperty()
  username: string;

  /**
   * 密码
   */
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @ApiProperty()
  password: string;
}

export class RefreshTokenDto {
  /**
   * 刷新令牌
   */
  @IsNotEmpty({
    message: 'refreshToken不能为空',
  })
  @ApiProperty()
  refreshToken: string;
}
