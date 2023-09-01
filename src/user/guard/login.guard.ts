import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permission } from '../entities/permission.entity';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UnLoginException } from 'src/filter/unlogin.filter';

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

interface JwtUserData {
  userId: number;
  email: string;
  username: string;
  roles: string[];
  permissions: Permission[];
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject()
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    // 不需要登录，直接放行
    if (!requireLogin) return true;

    const authorization: string = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const [, token] = authorization.split(' ') ?? [];
      const data = this.jwtService.verify<JwtUserData>(token);

      // 登录的user信息存起来
      request.user = {
        userId: data.userId,
        email: data.email,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions,
      };
      return true;
    } catch (error) {
      // throw new UnauthorizedException('token 失效，请重新登录');
      throw new UnLoginException('用户未登录');
    }
  }
}
