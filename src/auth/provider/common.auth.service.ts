import { JWT_OPTIONS } from '@config/constant';
import { JwtOption } from '@config/option/interface';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Auth, EmsAuth, ErAuth } from '../interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(JWT_OPTIONS)
    private readonly jwtOption: JwtOption,
  ) {}

  tokenVerify(token: string): ErAuth.AccessTokenSignPayload | EmsAuth.AccessTokenSignPayload {
    return this.accessTokenVerify({ access_token: token });
  }
  accessTokenVerify({
    access_token,
  }: Auth.AccessTokenVerify): ErAuth.AccessTokenSignPayload | EmsAuth.AccessTokenSignPayload {
    try {
      const verify = this.jwtService.verify(access_token, {
        secret: this.jwtOption.access_secret,
      });
      console.log(verify);
      if (verify.hospital_id) {
        return { ...(verify as ErAuth.AccessTokenSignPayload), type: 'er' };
      }
      return { ...(verify as EmsAuth.AccessTokenSignPayload), type: 'ems' };
    } catch (error) {
      throw new WsException('error');
    }
  }
}
