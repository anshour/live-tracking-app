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

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new HttpZodValidationPipe(loginSchema))
  async login(@Body() data: LoginDto): Promise<any> {
    return this.authService.login(data.email, data.password);
  }

  @Post('register')
  async register(
    // TODO : Add validation schema for registration
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(name, email, password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req): User {
    return req.user as User;
  }
}
