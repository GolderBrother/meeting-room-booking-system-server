import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Query,
  Inject,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user-dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { md5 } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import { UserInfo, LoginUserVo } from './vo/login-user.vo';
import { ConfigService } from '@nestjs/config';
import e from 'express';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;
  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async login(@Body() loginUser: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    // 用户不存在
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    // 密码错误
    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const loginUserVo = this.getLoginUserVo(user);

    return loginUserVo;
  }

  private generateJWTToken(userInfo: Partial<UserInfo>) {
    const accessToken = this.jwtService.sign(
      {
        userId: userInfo.id,
        username: userInfo.username,
        roles: userInfo.roles,
        permissions: userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        userId: userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private getLoginUserVo(user: User): LoginUserVo {
    const vo = new LoginUserVo();
    const roles = Array.isArray(user.roles) ? user.roles : [];
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: roles.map((item) => item.name),
      permissions: roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
    const { accessToken, refreshToken } = this.generateJWTToken(vo.userInfo);
    vo.accessToken = accessToken;
    vo.refreshToken = refreshToken;
    return vo;
  }

  async register(user: RegisterUserDto) {
    console.log('register user', user);
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    // 验证码已失效
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    // 验证码不正确
    if (user.captcha !== captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    const foundUser = this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = user.password;
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async registerCaptcha(address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);
    await this.emailService.sendMail({
      to: address,
      html: `<p>你的注册验证码是 ${code}</p>`,
      subject: '注册验证码',
    });
    return '发送成功';
  }

  async refreshToken(refreshTokenStr: string) {
    try {
      console.log('refreshToken refreshTokenStr', refreshTokenStr);
      const data = this.jwtService.verify(refreshTokenStr);
      const user = await this.findUserById(data.userId, false);

      const { accessToken, refreshToken } = this.generateJWTToken(user);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(error, UserService);
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  async adminRefreshToken(refreshTokenStr: string) {
    try {
      console.log('adminRefreshToken refreshTokenStr', refreshTokenStr);
      const data = this.jwtService.verify(refreshTokenStr);
      const user = await this.findUserById(data.userId, false);

      const { accessToken, refreshToken } = this.generateJWTToken(user);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(error, UserService);
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  async findUserById(userId: number, isAdmin: boolean) {
    console.log('findUserById userId', userId);
    const user = await this.userRepository.findOne({
      where: {
        id: String(userId),
        isAdmin,
      },
    });
    // 用户不存在
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const roles = Array.isArray(user.roles) ? user.roles : [];
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: roles.map((item) => item.name),
      permissions: roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }
}