import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetDashboardDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  days?: number = 7;

  @IsOptional()
  @IsString()
  domain?: string = '全部域名';
}
