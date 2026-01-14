import { IsString } from 'class-validator';

export class WebLoginDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}
