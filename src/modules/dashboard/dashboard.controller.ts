import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/gurads/public.guards';
import { DashboardService } from './dashboard.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get()
  getDashboard(@Query() query: GetDashboardDto) {
    return this.dashboardService.getDashboard(query);
  }
}
