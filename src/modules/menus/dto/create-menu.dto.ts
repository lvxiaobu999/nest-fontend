import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  title: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  keepAlive?: boolean;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsBoolean()
  isLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsString()
  parentId?: string;
}
