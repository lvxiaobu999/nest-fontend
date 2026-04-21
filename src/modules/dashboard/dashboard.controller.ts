import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Query() query: GetDashboardDto) {
    return this.dashboardService.getDashboard(query);
  }
}
