import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 记录下访问的 ip、user agent、请求的 controller、method，接口耗时、响应内容，当前登录用户等信息。
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userAgent = request.headers['user-agent'];

    const { ip, method, path } = request;

    this.logger.debug(
      `${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
        context.getHandler().name
      } invoked...`,
    );

    const { userId, username } = request.user ?? {};
    this.logger.debug(`user: ${userId}, ${username}`);

    const now = Date.now();
    return next.handle().pipe(
      //  tap 操作符是一种用于在 Observable 流中插入额外的副作用操作的工具。它允许我们在数据流中进行调试、记录日志、执行辅助操作等，而不会改变原始的 Observable 数据流。
      //  tap 操作符接收一个回调函数，该函数会在每个值通过 Observable 时被调用。
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${
            Date.now() - now
          }ms`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
