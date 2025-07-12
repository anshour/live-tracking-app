import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { HttpZodValidationPipe } from 'src/common/pipes/http-zod-validation.pipe';
import { LoginDto, loginSchema } from '../dto/login.dto';
import { User } from '@livetracking/shared';
import { RegisterDto, registerSchema } from '../dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new HttpZodValidationPipe(loginSchema))
  async login(@Body() data: LoginDto): Promise<any> {
    const { user, token } = await this.authService.login(
      data.email,
      data.password,
    );

    return {
      message: 'Login successful',
      user,
      token,
    };
  }

  @Post('register')
  @UsePipes(new HttpZodValidationPipe(registerSchema))
  async register(@Body() data: RegisterDto) {
    const user = await this.authService.register(
      data.name,
      data.email,
      data.password,
    );

    return {
      message: 'Registration successful',
      user,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req): User {
    return req.user as User;
  }
}
