import { IsInt, IsString, Min } from 'class-validator';

export class WxBindDto {
  @IsString()
  wx_code!: string;

  @IsInt()
  @Min(1)
  seat_no!: number;

  @IsString()
  name!: string;

  @IsString()
  invite_code!: string;
}
