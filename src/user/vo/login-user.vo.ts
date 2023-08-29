import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户信息视图对象
 */
export class UserInfo {
  /**
   * 用户ID
   */
  @ApiProperty()
  id: number;

  /**
   * 用户名
   */
  @ApiProperty({ example: 'zhangsan' })
  username: string;

  /**
   * 昵称
   */
  @ApiProperty({ example: '张三' })
  nickName: string;

  /**
   * 邮箱
   */
  @ApiProperty({ example: 'xx@xx.com' })
  email: string;

  /**
   * 头像
   */
  @ApiProperty({ example: 'xxx.png' })
  headPic: string;

  /**
   * 手机号码
   */
  @ApiProperty({ example: '13233333333' })
  phoneNumber: string;

  /**
   * 是否被冻结
   */
  @ApiProperty()
  isFrozen: boolean;

  /**
   * 是否是管理员
   */
  @ApiProperty()
  isAdmin: boolean;

  /**
   * 创建时间
   */
  @ApiProperty()
  createTime: number;

  /**
   * 用户角色列表
   */
  @ApiProperty({ example: ['管理员'] })
  roles: string[];

  /**
   * 用户权限列表
   */
  @ApiProperty({ example: 'query_aaa' })
  permissions: string[];
}

export class LoginUserVo {
  /**
   * 用户信息
   */
  @ApiProperty()
  userInfo: UserInfo;

  /**
   * 访问令牌
   */
  @ApiProperty()
  accessToken: string;

  /**
   * 刷新令牌
   */
  @ApiProperty()
  refreshToken: string;
}
