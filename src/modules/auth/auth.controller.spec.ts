import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
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
    };

    authService.login.mockResolvedValue(result);

    await expect(
      controller.login({
        username: 'demo-admin',
        password: '123456',
      }),
    ).resolves.toBe(result);
  });
});
