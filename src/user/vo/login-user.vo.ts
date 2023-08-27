/**
 * 登录用户视图对象
 */
export interface UserInfo {
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
   * 是否是管理员
   */
  isAdmin: boolean;

  /**
   * 创建时间
   */
  createTime: number;

  /**
   * 用户角色列表
   */
  roles: string[];

  /**
   * 用户权限列表
   */
  permissions: string[];
}

export class LoginUserVo {
  /**
   * 用户信息
   */
  userInfo: UserInfo;

  /**
   * 访问令牌
   */
  accessToken: string;

  /**
   * 刷新令牌
   */
  refreshToken: string;
}
