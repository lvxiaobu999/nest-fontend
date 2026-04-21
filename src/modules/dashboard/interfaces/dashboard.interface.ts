export interface DashboardCoreMetricsResponse {
  todayVisits: number;
  blockedCount: number;
  payUsers: number;
  payOrders: number;
  totalVisits: number;
  payConversionRate: string;
}

export interface DashboardChartItem {
  date: string;
  visits: number;
  payments: number;
}

export interface DashboardDomainStatsResponse {
  timeRange: string;
  domains: string[];
  chartData: DashboardChartItem[];
}

export interface DashboardSystemInfoResponse {
  updateTime: string;
  serverStatus: string;
  alertCount: number;
}

export interface DashboardResponse {
  coreMetrics: DashboardCoreMetricsResponse;
  domainStats: DashboardDomainStatsResponse;
  systemInfo: DashboardSystemInfoResponse;
}
