import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType 会做两件事：
// 1. 继承 CreateUserDto 的所有验证规则（如 @IsEmail, @IsString）。
// 2. 将所有属性自动转换为可选（添加 ? 修饰符），并加上 @IsOptional() 验证。
export class UpdateUserDto extends PartialType(CreateUserDto) {}
