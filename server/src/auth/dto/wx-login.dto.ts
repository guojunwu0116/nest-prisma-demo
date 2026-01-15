import { IsString } from 'class-validator';

export class WxLoginDto {
  @IsString()
  wx_code!: string;
}
