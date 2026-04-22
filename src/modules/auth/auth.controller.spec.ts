import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate login to auth service', async () => {
    const result = {
      user: {
        id: 'user-1',
        username: 'demo-admin',
      },
      menus: [],
      permissions: [],
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 7200,
    };

    authService.login.mockResolvedValue(result);

    await expect(
      controller.login({
        username: 'demo-admin',
        password: '123456',
      }),
    ).resolves.toBe(result);
  });

  it('should delegate profile query to auth service', async () => {
    const req = {
      user: {
        userId: 'user-1',
        username: 'demo-admin',
        roleId: null,
        isSuperAdmin: 1,
        nickname: '演示管理员',
        sessionId: 'session-1',
      },
    } as any;
    const result = {
      user: {
        id: 'user-1',
        username: 'demo-admin',
      },
      menus: [],
      permissions: ['dashboard:view'],
    };

    authService.getProfile.mockResolvedValue(result);

    await expect(controller.profile(req)).resolves.toBe(result);
    expect(authService.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('should delegate logout to auth service', async () => {
    authService.logout.mockResolvedValue({ loggedOut: true });

    await expect(
      controller.logout({
        user: {
          sessionId: 'session-1',
        },
      } as any),
    ).resolves.toEqual({ loggedOut: true });
    expect(authService.logout).toHaveBeenCalledWith('session-1');
  });
});
