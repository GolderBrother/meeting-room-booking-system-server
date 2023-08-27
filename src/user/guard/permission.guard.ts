import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 同样是用 reflector 取出 handler 或者 controller 上的 require-permission 的 metadata。
    const request: Request = context.switchToHttp().getRequest();

    // 如果没有，就是不需要权限，直接放行，返回 true。
    if (!request.user) {
      return true;
    }

    // 对于需要的每个权限，检查下用户是否拥有，没有的话就返回 401，提示没权限。
    // 否则就放行，返回 true。

    const permissions = request.user.permissions;
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );
    if (!requiredPermissions) {
      return true;
    }

    for (const curPermission of requiredPermissions) {
      const found = permissions.find((item) => item.code === curPermission);
      if (!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }

    return true;
  }
}
