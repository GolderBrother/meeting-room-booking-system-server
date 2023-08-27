/**
 * 用户详情视图对象
 */
export class UserDetailVo {
  /**
   * 用户ID
   */
  id: number;

  /**
   * 用户名
   */
  username: string;

  /**
   * 昵称
   */
  nickName: string;

  /**
   * 邮箱
   */
  email: string;

  /**
   * 头像
   */
  headPic: string;

  /**
   * 手机号码
   */
  phoneNumber: string;

  /**
   * 是否被冻结
   */
  isFrozen: boolean;

  /**
   * 创建时间
   */
  createTime: Date;
}
