import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * 注册用户数据传输对象
 */
export class RegisterUserDto {
  /**
   * 用户名
   */
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  /**
   * 昵称
   */
  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickName: string;

  /**
   * 密码
   */
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  password: string;

  /**
   * 邮箱
   */
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '邮箱格式不合法',
    },
  )
  email: string;

  /**
   * 验证码
   */
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
