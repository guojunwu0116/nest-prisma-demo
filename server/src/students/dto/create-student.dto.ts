import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsInt()
  seat_no!: number;

  @IsString()
  name!: string;

  @IsString()
  gender!: string;

  @IsDateString()
  birth_date!: string;

  @IsString()
  dorm_no!: string;

  @IsString()
  id_card_no!: string;

  @IsString()
  father_name!: string;

  @IsString()
  father_phone!: string;

  @IsString()
  mother_name!: string;

  @IsString()
  mother_phone!: string;

  @IsString()
  home_address!: string;
}
