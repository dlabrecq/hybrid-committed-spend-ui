import { getQuery } from 'api/queries/query';
import type { Report } from 'api/reports/report';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import type { ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ReportSummary } from 'routes/overview/components/report-summary';
import { useReportMapDateRangeToProps } from 'routes/overview/components/utils/report';
import { getAccountSummaryDates, useAccountSummaryMapToProps } from 'routes/utils/accountSummary';
import { DateRangeType } from 'routes/utils/dateRange';
import type { RootState } from 'store';
import type { FetchStatus } from 'store/common';
import type { DashboardWidget } from 'store/dashboard';
import { dashboardSelectors } from 'store/dashboard';
import { formatCurrency } from 'utils/format';

import { ActualSpendBreakdownTransform } from './ActualSpendBreakdownTransform';

interface ActualSpendBreakdownSummaryOwnProps {
  perspective?: string;
  perspectiveComponent?: ReactNode;
  resolution?: string;
  resolutionComponent?: ReactNode;
  widgetId: number;
}

interface ActualSpendBreakdownSummaryStateProps {
  consumptionDate?: Date;
  endDate?: Date;
  report?: Report;
  reportFetchStatus?: FetchStatus;
  reportError?: AxiosError;
  startDate?: Date;
  summaryFetchStatus?: FetchStatus;
  widget?: DashboardWidget;
}

export type ActualSpendBreakdownSummaryProps = ActualSpendBreakdownSummaryOwnProps;

const ActualSpendBreakdownSummary: React.FC<ActualSpendBreakdownSummaryProps> = ({
  perspective,
  perspectiveComponent,
  resolution,
  resolutionComponent,
  widgetId,
}) => {
  const { endDate, report, reportFetchStatus, startDate, summaryFetchStatus, widget } = useMapToProps({
    perspective,
    resolution,
    widgetId,
  });
  const intl = useIntl();

  const hasData = report && report.meta;
  const values = hasData && report.meta;

  // Don't show excess spend unless greater than zero
  const excessSpend = values && values.excess_actual_spend ? Number(values.excess_actual_spend.value) : undefined;
  const excessActualSpend: string = excessSpend
    ? formatCurrency(excessSpend, values.excess_actual_spend.units || 'USD')
    : undefined;

  const getDetailsLink = () => {
    if (widget.viewAllPath) {
      const href = `${widget.viewAllPath}?${getQuery({
        // TBD...
      })}`;
      return <Link to={href}>{intl.formatMessage(messages.viewDetails)}</Link>;
    }
    return null;
  };

  return (
    <ReportSummary
      detailsLink={getDetailsLink()}
      excessActualSpend={excessActualSpend}
      fetchStatus={[reportFetchStatus, summaryFetchStatus]}
      showBreakdown
      title={widget.title}
    >
      {perspectiveComponent}
      {resolutionComponent}
      <ActualSpendBreakdownTransform
        chartName={widget.chartName}
        endDate={endDate}
        groupBy={perspective}
        report={report}
        startDate={startDate}
      />
    </ReportSummary>
  );
};

const useMapToProps = ({
  perspective,
  resolution,
  widgetId,
}: ActualSpendBreakdownSummaryOwnProps): ActualSpendBreakdownSummaryStateProps => {
  const { summary, summaryFetchStatus } = useAccountSummaryMapToProps();
  const {
    consumptionDate,
    contractLineEndDate,
    contractLineStartDate,
    previousContractLineEndDate,
    previousContractLineStartDate,
  } = getAccountSummaryDates(summary);

  const widget = useSelector((state: RootState) => dashboardSelectors.selectWidget(state, widgetId));

  const { endDate, report, reportError, reportFetchStatus, startDate } = useReportMapDateRangeToProps({
    contractLineEndDate,
    contractLineStartDate,
    dateRange: DateRangeType.contractedYear,
    limit: 3,
    perspective,
    previousContractLineEndDate, // When there's a lack of data, previous year date range can be used for testing
    previousContractLineStartDate,
    reportPathsType: widget.reportPathsType,
    reportType: widget.reportType,
    resolution,
  });

  return {
    consumptionDate,
    endDate,
    report,
    reportFetchStatus,
    reportError,
    startDate,
    summaryFetchStatus,
    widget,
  };
};

export { ActualSpendBreakdownSummary };