import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenVo {
  /**
   * 访问令牌
   */
  @ApiProperty()
  access_token: string;

  /**
   * 刷新令牌
   */
  @ApiProperty()
  refresh_token: string;
}
