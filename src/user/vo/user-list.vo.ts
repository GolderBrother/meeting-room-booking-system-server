import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户视图对象
 */
class User {
  /**
   * 用户ID
   */
  @ApiProperty()
  id: number;

  /**
   * 用户名
   */
  @ApiProperty()
  username: string;

  /**
   * 昵称
   */
  @ApiProperty()
  nickName: string;

  /**
   * 邮箱
   */
  @ApiProperty()
  email: string;

  /**
   * 手机号码
   */
  @ApiProperty()
  phoneNumber: string;

  /**
   * 是否被冻结
   */
  @ApiProperty()
  isFrozen: boolean;

  /**
   * 头像
   */
  @ApiProperty()
  headPic: string;

  /**
   * 创建时间
   */
  @ApiProperty()
  createTime: Date;
}

/**
 * 用户列表视图对象
 */
export class UserListVo {
  /**
   * 用户列表
   */
  @ApiProperty({
    type: [User],
  })
  users: User[];

  /**
   * 用户总数
   */
  @ApiProperty()
  total: number;
}
