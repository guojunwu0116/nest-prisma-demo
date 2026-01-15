import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewAction {
  approve = 'approve',
  reject = 'reject',
}

export class ReviewLeaveDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;

  @IsOptional()
  @IsString()
  review_comment?: string;
}
