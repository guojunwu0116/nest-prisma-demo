import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/invites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  async createInvite(@Body() dto: CreateInviteDto, @Req() req: { user: { sub: number } }) {
    return this.invitesService.createInvite(dto, req.user.sub);
  }

  @Get()
  async listInvites(@Query('status') status?: 'unused' | 'used' | 'expired') {
    return this.invitesService.listInvites(status);
  }
}
