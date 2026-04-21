import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    validateLogin: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return safe user info when credentials are valid', async () => {
    const safeUser = {
      id: 'user-1',
      username: 'demo-admin',
      isSuperAdmin: 1,
      roleId: null,
      nickname: '演示管理员',
      enabled: 1,
      remark: 'test',
      createTime: new Date('2026-04-21T00:00:00.000Z'),
      updateTime: new Date('2026-04-21T00:00:00.000Z'),
    };

    usersService.validateLogin.mockResolvedValue(safeUser);

    await expect(
      service.login({
        username: 'demo-admin',
        password: '123456',
      }),
    ).resolves.toEqual({ user: safeUser });
  });

  it('should throw unauthorized when credentials are invalid', async () => {
    usersService.validateLogin.mockResolvedValue(null);

    await expect(
      service.login({
        username: 'demo-admin',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
