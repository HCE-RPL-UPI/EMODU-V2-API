import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AffectiveInterventionTextService } from './affective-intervention-text.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Affective Intervention Text Service')
@ApiBearerAuth()
@Controller('affective-intervention-text')
export class AffectiveInterventionTextController {
  constructor(
    private readonly affectiveInterventionTextService: AffectiveInterventionTextService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  async getAllAffectiveInterventionText() {
    return await this.affectiveInterventionTextService.getAffectiveInterventionText();
  }

  @Get('random')
  @UseGuards(AuthGuard('jwt'))
  async getRandomAffectiveInterventionText(
    @Request() req,
    @Query('emotion') emotion?: string,
    @Query('category') category?: string,
    @Query('name') name?: string,
    @Query('emotionValue') emotionValue?: number,
  ) {
    const user = req.user;
    return await this.affectiveInterventionTextService.getRandomAffectiveInterventionText(
      emotion,
      category,
      name,
      emotionValue,
      user,
    );
  }

  @Get('aggregated-all')
  @UseGuards(AuthGuard('jwt'))
  async getAggregatedAffectiveInterventionText() {
    return await this.affectiveInterventionTextService.getAggregatedAffectiveInterventionText();
  }

  @Get('aggregated-user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getAggregatedAffectiveInterventionTextByUser(@Request() req, @Query('userId') userId: string) {
    return await this.affectiveInterventionTextService.getAggregatedAffectiveInterventionTextByUser(userId);
  }

  @Get('aggregated-user/by-arcs/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getAggregatedAffectiveInterventionTextByUserByARCS(@Request() req, @Query('userId') userId: string) {
    return await this.affectiveInterventionTextService.getAggregatedAffectiveInterventionTextByUserARCS(userId);
  }
}
