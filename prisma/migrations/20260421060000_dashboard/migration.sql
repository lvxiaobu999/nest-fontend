-- CreateTable
CREATE TABLE "dashboard_core_metrics" (
    "id" TEXT NOT NULL,
    "metricDate" DATE NOT NULL,
    "todayVisits" INTEGER NOT NULL DEFAULT 0,
    "blockedCount" INTEGER NOT NULL DEFAULT 0,
    "payUsers" INTEGER NOT NULL DEFAULT 0,
    "payOrders" INTEGER NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "payConversionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_core_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_domain_stats" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "statDate" DATE NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "payments" INTEGER NOT NULL DEFAULT 0,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_domain_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_system_snapshots" (
    "id" TEXT NOT NULL,
    "reportTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverStatus" TEXT NOT NULL,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_system_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_core_metrics_metricDate_key" ON "dashboard_core_metrics"("metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_domains_name_key" ON "dashboard_domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_domain_stats_domainId_statDate_key" ON "dashboard_domain_stats"("domainId", "statDate");

-- CreateIndex
CREATE INDEX "dashboard_domain_stats_domainId_statDate_idx" ON "dashboard_domain_stats"("domainId", "statDate");

-- CreateIndex
CREATE INDEX "dashboard_domain_stats_statDate_idx" ON "dashboard_domain_stats"("statDate");

-- CreateIndex
CREATE INDEX "dashboard_system_snapshots_reportTime_idx" ON "dashboard_system_snapshots"("reportTime");

-- AddForeignKey
ALTER TABLE "dashboard_domain_stats" ADD CONSTRAINT "dashboard_domain_stats_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "dashboard_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
