import axios from 'axios';

import type { Report, ReportData, ReportMeta, ReportValue } from './report';
import { ReportType } from './report';

export interface AccountSummaryReportData extends ReportData {
  account_name?: string;
  account_number?: string;
  actual_spend?: ReportValue;
  actual_committed_spend?: ReportValue;
  contract_end_date?: string;
  contract_start_date?: string;
  contract_line_start_date?: string;
  contract_line_end_date?: string;
  consumption_date?: string;
  committed_spend?: ReportValue;
  delta?: { value: string; percent: string };
  excess_committed_spend?: ReportValue;
  previous_contract_line_end_date?: string;
  previous_contract_line_start_date?: string;
  remaining_committed_spend?: ReportValue;
}

export interface AccountSummaryReportMeta extends ReportMeta {
  count?: number;
}

export interface AccountSummaryReport extends Report {
  meta: AccountSummaryReportMeta;
  data: AccountSummaryReportData[];
}

export const ReportTypePaths: Partial<Record<ReportType, string>> = {
  [ReportType.details]: 'reports/hcsSummary',
};

export function runReport(reportType: ReportType, query: string) {
  const path = ReportTypePaths[reportType];
  const queryString = query ? `?${query}` : '';
  const fetch = () => axios.get<AccountSummaryReport>(`${path}${queryString}`);

  const insights = (window as any).insights;
  if (insights && insights.chrome && insights.chrome.auth && insights.chrome.auth.getUser) {
    return insights.chrome.auth.getUser().then(() => fetch());
  } else {
    return fetch();
  }
}
