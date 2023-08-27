import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * 需要登录才能访问的接口
 * @returns
 */
export const RequireLogin = () => SetMetadata('require-login', true);

/**
 * 需要有对应的接口权限才能访问的接口
 * @returns
 */
export const RequirePermission = (permissions: string[]) =>
  SetMetadata('require-permission', permissions);

/**
 * UserInfo 装饰器是用来取 user 信息传入 handler 的
 */
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  },
);
