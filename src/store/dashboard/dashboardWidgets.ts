import { ReportPathsType, ReportType } from 'api/reports/report';
import messages from 'locales/messages';
import { lazy } from 'react';
import { paths } from 'Routes';

import { DashboardSize, DashboardWidget } from './dashboardCommon';

const ActualSpend = lazy(() => import('routes/overview/components/actual-spend/ActualSpend'));
const ActualSpendBreakdown = lazy(
  () => import('routes/overview/components/actual-spend-breakdown/ActualSpendBreakdown')
);
const CommittedSpend = lazy(() => import('routes/overview/components/committed-spend/CommittedSpend'));
const CommittedSpendTrend = lazy(() => import('routes/overview/components/committed-spend-trend/CommittedSpendTrend'));

let currrentId = 0;
const getId = () => currrentId++;

export const actualSpendWidget: DashboardWidget = {
  component: ActualSpend,
  chartName: 'actualSpend',
  id: getId(),
  title: messages.dashboardActualSpendTitle,
  reportPathsType: ReportPathsType.billing,
  reportType: ReportType.cost,
  size: DashboardSize.half,
};

export const actualSpendBreakdownWidget: DashboardWidget = {
  component: ActualSpendBreakdown,
  chartName: 'actualSpendBreakdown',
  id: getId(),
  title: messages.dashboardActualSpendBreakdownTitle,
  reportPathsType: ReportPathsType.billing,
  reportType: ReportType.cost,
  viewAllPath: paths.details,
};

export const committedSpendWidget: DashboardWidget = {
  component: CommittedSpend,
  chartName: 'committedSpend',
  id: getId(),
  title: messages.dashboardCommitmentSpendTitle,
  reportPathsType: ReportPathsType.billing,
  reportType: ReportType.cost,
  size: DashboardSize.half,
};

export const committedSpendTrendWidget: DashboardWidget = {
  component: CommittedSpendTrend,
  chartName: 'committedSpendTrend',
  id: getId(),
  title: messages.dashboardCommitmentSpendTrendTitle,
  reportPathsType: ReportPathsType.billing,
  reportType: ReportType.cost,
  viewAllPath: paths.details,
};
