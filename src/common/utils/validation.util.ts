import { ValidationError } from '@nestjs/common';

export interface ValidationIssue {
  field: string;
  messages: string[];
}

/**
 * 对错误传输字段进行格式化
 * @param errors
 * @param parentPath
 * @returns [
  {
    field: 'enabled',
    messages: ['property enabled should not exist'],
  },
]
 */
export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const issues: ValidationIssue[] = [];

    if (error.constraints) {
      issues.push({
        field,
        messages: Object.values(error.constraints),
      });
    }

    if (error.children?.length) {
      issues.push(...flattenValidationErrors(error.children, field));
    }

    return issues;
  });
}
