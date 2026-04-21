import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { DashboardChartItem, DashboardResponse } from './interfaces/dashboard.interface';

const ALL_DOMAIN_OPTION = '全部域名';
const DEFAULT_DAYS = 7;

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboard(query: GetDashboardDto): Promise<DashboardResponse> {
    const days = query.days ?? DEFAULT_DAYS;
    const domainName = query.domain ?? ALL_DOMAIN_OPTION;
    const { startDate, endDate, dateKeys } = this.buildDateWindow(days);

    const [latestCoreMetric, systemSnapshot, enabledDomains] = await Promise.all([
      this.prismaService.dashboardCoreMetric.findFirst({
        orderBy: { metricDate: 'desc' },
      }),
      this.prismaService.dashboardSystemSnapshot.findFirst({
        orderBy: { reportTime: 'desc' },
      }),
      this.prismaService.dashboardDomain.findMany({
        where: { enabled: 1 },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    const chartData = await this.getChartData({
      domainName,
      startDate,
      endDate,
      dateKeys,
      enabledDomains,
    });

    return {
      coreMetrics: {
        todayVisits: latestCoreMetric?.todayVisits ?? 0,
        blockedCount: latestCoreMetric?.blockedCount ?? 0,
        payUsers: latestCoreMetric?.payUsers ?? 0,
        payOrders: latestCoreMetric?.payOrders ?? 0,
        totalVisits: latestCoreMetric?.totalVisits ?? 0,
        payConversionRate: this.formatPercent(latestCoreMetric?.payConversionRate),
      },
      domainStats: {
        timeRange: `近${days}天`,
        domains: [ALL_DOMAIN_OPTION, ...enabledDomains.map((item) => item.name)],
        chartData,
      },
      systemInfo: {
        updateTime: systemSnapshot ? this.formatDateTime(systemSnapshot.reportTime) : '',
        serverStatus: systemSnapshot?.serverStatus ?? '未知',
        alertCount: systemSnapshot?.alertCount ?? 0,
      },
    };
  }

  private async getChartData(params: {
    domainName: string;
    startDate: Date;
    endDate: Date;
    dateKeys: string[];
    enabledDomains: Array<{ id: string; name: string }>;
  }): Promise<DashboardChartItem[]> {
    const { domainName, startDate, endDate, dateKeys, enabledDomains } = params;

    if (enabledDomains.length === 0) {
      return this.buildEmptyChart(dateKeys);
    }

    const chartMap = new Map(
      dateKeys.map((dateKey) => [
        dateKey,
        {
          date: this.formatDateLabelFromKey(dateKey),
          visits: 0,
          payments: 0,
        },
      ]),
    );

    if (domainName === ALL_DOMAIN_OPTION) {
      const rows = await this.prismaService.dashboardDomainStat.groupBy({
        by: ['statDate'],
        where: {
          domainId: {
            in: enabledDomains.map((item) => item.id),
          },
          statDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          visits: true,
          payments: true,
        },
        orderBy: {
          statDate: 'asc',
        },
      });

      rows.forEach((row) => {
        const key = this.toDateKey(row.statDate);
        chartMap.set(key, {
          date: this.formatDateLabel(row.statDate),
          visits: row._sum.visits ?? 0,
          payments: row._sum.payments ?? 0,
        });
      });

      return dateKeys.map((dateKey) => chartMap.get(dateKey)!);
    }

    const selectedDomain = enabledDomains.find((item) => item.name === domainName);

    if (!selectedDomain) {
      throw new NotFoundException(`Domain "${domainName}" does not exist`);
    }

    const rows = await this.prismaService.dashboardDomainStat.findMany({
      where: {
        domainId: selectedDomain.id,
        statDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        statDate: 'asc',
      },
      select: {
        statDate: true,
        visits: true,
        payments: true,
      },
    });

    rows.forEach((row) => {
      const key = this.toDateKey(row.statDate);
      chartMap.set(key, {
        date: this.formatDateLabel(row.statDate),
        visits: row.visits,
        payments: row.payments,
      });
    });

    return dateKeys.map((dateKey) => chartMap.get(dateKey)!);
  }

  private buildDateWindow(days: number) {
    const endDate = this.toUtcDateOnly(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - days + 1);

    const dateKeys: string[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      dateKeys.push(this.toDateKey(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return { startDate, endDate, dateKeys };
  }

  private buildEmptyChart(dateKeys: string[]): DashboardChartItem[] {
    return dateKeys.map((dateKey) => ({
      date: this.formatDateLabelFromKey(dateKey),
      visits: 0,
      payments: 0,
    }));
  }

  private formatPercent(value?: Prisma.Decimal | null): string {
    if (!value) {
      return '0%';
    }

    const normalized = Number(value.toString());

    if (Number.isNaN(normalized)) {
      return '0%';
    }

    return `${normalized % 1 === 0 ? normalized.toFixed(0) : normalized.toFixed(2).replace(/\.?0+$/, '')}%`;
  }

  private toUtcDateOnly(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatDateLabel(date: Date): string {
    return date.toISOString().slice(5, 10).replace('-', '/');
  }

  private formatDateLabelFromKey(dateKey: string): string {
    return dateKey.slice(5).replace('-', '/');
  }

  private formatDateTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
