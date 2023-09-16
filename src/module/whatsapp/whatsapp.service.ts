import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger();
  private token_secret = process.env.SECRET;
  constructor(private readonly jwtService: JwtService) {}

  async validate(hub_token: string) {
    try {
      if (!hub_token)
        throw new HttpException(
          'You are not authroized',
          HttpStatus.UNAUTHORIZED,
        );

      const jwt_token = atob(hub_token);
      let token_msg = this.jwtService.validate(jwt_token);

      if (typeof token_msg === 'string') token_msg = JSON.parse(token_msg);

      if (token_msg['secret'] === this.token_secret) return true;

      throw new HttpException(
        'You are not authroized',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (err) {
      this.logger.log(err, WhatsappService.name);

      throw err;
    }
  }
}
