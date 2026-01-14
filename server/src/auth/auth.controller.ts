import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebLoginDto } from './dto/web-login.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { WxBindDto } from './dto/wx-bind.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('web/login')
  async webLogin(@Body() dto: WebLoginDto) {
    return this.authService.webLogin(dto);
  }

  @Post('wx/login')
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.wx_code);
  }

  @Post('wx/bind')
  async wxBind(@Body() dto: WxBindDto) {
    return this.authService.bindWx(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user: { sub: number } }) {
    return this.authService.getProfile(req.user.sub);
  }
}
