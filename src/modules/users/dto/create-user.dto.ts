import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  isSuperAdmin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  enabled?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
