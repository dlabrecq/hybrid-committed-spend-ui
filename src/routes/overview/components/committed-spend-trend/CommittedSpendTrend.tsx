import { getQuery } from 'api/queries/query';
import type { Report } from 'api/reports/report';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import React, { useState } from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Perspective } from 'routes/components/perspective';
import {
  useAccountSummaryMapToProps,
  useDetailsMapDateRangeToProps,
} from 'routes/overview/components/committed-spend-trend/utils';
import { ReportSummary } from 'routes/overview/components/report-summary';
import { DateRangeType } from 'routes/utils/dateRange';
import type { RootState } from 'store';
import type { FetchStatus } from 'store/common';
import type { DashboardWidget } from 'store/dashboard';
import { dashboardSelectors } from 'store/dashboard';
import { formatCurrency } from 'utils/format';

import { CommittedSpendTrendTransform } from './CommittedSpendTrendTransform';

interface CommittedSpendTrendOwnProps {
  widgetId: number;
}

interface CommittedSpendTrendStateProps {
  currentReport?: Report;
  currentReportFetchStatus?: FetchStatus;
  currentReportError?: AxiosError;
  endDate?: Date;
  previousReport?: Report;
  previousReportFetchStatus?: FetchStatus;
  previousReportError?: AxiosError;
  startDate?: Date;
  widget: DashboardWidget;
}

export type CommittedSpendTrendProps = CommittedSpendTrendOwnProps & WrappedComponentProps;

// eslint-disable-next-line no-shadow
export enum PerspectiveType {
  actual = 'actual',
  previous_over_actual = 'previous_over_actual',
}

const perspectiveOptions = [
  { label: messages.committedSpendTrendPerspectiveValues, value: PerspectiveType.actual },
  { label: messages.committedSpendTrendPerspectiveValues, value: PerspectiveType.previous_over_actual },
];

const CommittedSpendTrend: React.FC<CommittedSpendTrendProps> = ({ intl, widgetId }) => {
  const [perspective, setPerspective] = useState(PerspectiveType.previous_over_actual);
  const {
    currentReport,
    currentReportFetchStatus,
    endDate,
    previousReport,
    previousReportFetchStatus,
    startDate,
    widget,
  } = useMapToProps({
    widgetId,
  });

  const getDetailsLink = () => {
    if (widget.viewAllPath) {
      const href = `${widget.viewAllPath}?${getQuery({
        // TBD...
      })}`;
      return <Link to={href}>{intl.formatMessage(messages.viewDetails)}</Link>;
    }
    return null;
  };

  const handleOnPerspectiveSelected = value => {
    setPerspective(value);
  };

  return (
    <ReportSummary
      detailsLink={getDetailsLink()}
      excessActualSpend={formatCurrency(98321.34, 'USD')}
      fetchStatus={[currentReportFetchStatus, previousReportFetchStatus]}
      title={widget.title}
    >
      <Perspective currentItem={perspective} onSelected={handleOnPerspectiveSelected} options={perspectiveOptions} />
      <CommittedSpendTrendTransform
        chartName={widget.chartName}
        currentReport={currentReport}
        endDate={endDate}
        perspective={perspective}
        previousReport={perspective === PerspectiveType.previous_over_actual ? previousReport : undefined}
        startDate={startDate}
        thresholdReport={currentReport}
      />
    </ReportSummary>
  );
};

const useMapToProps = ({ widgetId }: CommittedSpendTrendOwnProps): CommittedSpendTrendStateProps => {
  const { summary } = useAccountSummaryMapToProps();
  const values = summary && summary.data && summary.data.length && summary.data[0];
  const contractLineStartDate =
    values && values.contract_line_start_date ? new Date(values.contract_line_start_date + 'T00:00:00') : undefined;
  const contractStartDate =
    values && values.contract_start_date ? new Date(values.contract_start_date + 'T00:00:00') : undefined;
  const consumptionDate =
    values && values.consumption_date ? new Date(values.consumption_date + 'T00:00:00') : undefined;
  const widget = useSelector((state: RootState) => dashboardSelectors.selectWidget(state, widgetId));

  const {
    endDate: currentEndDate,
    report: currentReport,
    reportError: currentReportError,
    reportFetchStatus: currentReportFetchStatus,
    startDate: currentStartDate,
  } = useDetailsMapDateRangeToProps({
    consumptionDate,
    contractLineStartDate,
    contractStartDate,
    dateRange: DateRangeType.contractedYtd,
    reportPathsType: widget.reportPathsType,
    reportType: widget.reportType,
  });

  const {
    endDate: previousEndDate,
    report: previousReport,
    reportError: previousReportError,
    reportFetchStatus: previousReportFetchStatus,
    startDate: previousStartDate,
  } = useDetailsMapDateRangeToProps({
    consumptionDate,
    contractLineStartDate,
    contractStartDate,
    dateRange: DateRangeType.contractedLastYear,
    reportPathsType: widget.reportPathsType,
    reportType: widget.reportType,
  });

  return {
    currentReport,
    currentReportFetchStatus,
    currentReportError,
    endDate: currentEndDate > previousEndDate ? currentEndDate : previousEndDate,
    previousReport,
    previousReportFetchStatus,
    previousReportError,
    startDate: previousStartDate < currentStartDate ? previousStartDate : currentStartDate,
    widget,
  };
};

export default injectIntl(CommittedSpendTrend);
