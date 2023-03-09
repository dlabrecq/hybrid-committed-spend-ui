import type { Query } from 'api/queries';
import { getQuery, parseQuery } from 'api/queries';
import type { AccountSummaryReport } from 'api/reports/accountSummaryReport';
import type { Report } from 'api/reports/report';
import { ReportPathsType, ReportType } from 'api/reports/report';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { DateRangeType, getDateRange } from 'routes/utils/dateRange';
import type { RootState } from 'store';
import { FetchStatus } from 'store/common';
import { reportActions, reportSelectors } from 'store/reports';
import { formatDate } from 'utils/dates';

import { getSourceOfSpendFilter, GroupByType, SourceOfSpendType } from './types';

interface AccountSummaryStateProps {
  summary?: AccountSummaryReport;
  summaryError?: AxiosError;
  summaryFetchStatus?: FetchStatus;
  summaryQueryString?: string;
}

interface DetailsOwnProps {
  consumptionDate?: Date;
  contractLineStartDate?: Date;
  contractStartDate?: Date;
  dateRange?: string;
  endDate?: Date;
  groupBy?: string;
  groupByValue?: string;
  isExpanded?: boolean;
  previousContractLineEndDate?: Date;
  previousContractLineStartDate?: Date;
  reportPathsType?: ReportPathsType;
  reportType?: ReportType;
  secondaryGroupBy?: string;
  sourceOfSpend?: string;
  startDate?: Date;
}

interface DetailsStateProps {
  endDate?: Date;
  query: Query;
  report: Report;
  reportError: AxiosError;
  reportFetchStatus: FetchStatus;
  reportQueryString: string;
  startDate?: Date;
}

export const baseQuery: Query = {
  filter: {
    limit: 10,
    offset: 0,
  },
  filter_by: {},
  groupBy: {
    product: '*',
  },
  orderBy: {
    cost: 'desc',
  },
};

export const useAccountSummaryMapToProps = (deps = []): AccountSummaryStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const query = {
    // TBD...
  };
  const summaryQueryString = getQuery(query);

  const reportPathsType = ReportPathsType.accountSummary;
  const reportType = ReportType.details;

  const summary: AccountSummaryReport = useSelector((state: RootState) =>
    reportSelectors.selectReport(state, reportPathsType, reportType, summaryQueryString)
  );
  const summaryError = useSelector((state: RootState) =>
    reportSelectors.selectReportError(state, reportPathsType, reportType, summaryQueryString)
  );
  const summaryFetchStatus = useSelector((state: RootState) =>
    reportSelectors.selectReportFetchStatus(state, reportPathsType, reportType, summaryQueryString)
  );

  useEffect(() => {
    if (!summaryError && summaryFetchStatus !== FetchStatus.inProgress) {
      dispatch(reportActions.fetchReport(reportPathsType, reportType, summaryQueryString));
    }
  }, deps);

  return {
    summary,
    summaryError,
    summaryFetchStatus,
    summaryQueryString,
  };
};

export const useDetailsMapDateRangeToProps = ({
  consumptionDate,
  contractLineStartDate,
  contractStartDate,
  dateRange,
  groupBy,
  groupByValue,
  previousContractLineEndDate,
  previousContractLineStartDate,
  reportPathsType,
  reportType,
  secondaryGroupBy,
  sourceOfSpend,
}: DetailsOwnProps): DetailsStateProps => {
  const { endDate, startDate } =
    dateRange === DateRangeType.contractedLastYear
      ? {
          endDate: previousContractLineEndDate,
          startDate: previousContractLineStartDate,
        }
      : getDateRange({
          dateRange,
          consumptionDate,
          contractLineStartDate,
          contractStartDate,
        });

  return useDetailsMapToProps({
    dateRange,
    endDate,
    groupBy,
    groupByValue,
    reportPathsType,
    reportType,
    secondaryGroupBy,
    sourceOfSpend,
    startDate,
  });
};

export const useDetailsMapToProps = ({
  dateRange,
  endDate,
  groupBy,
  groupByValue,
  isExpanded = false,
  reportPathsType = ReportPathsType.details,
  reportType = ReportType.details,
  secondaryGroupBy,
  sourceOfSpend = SourceOfSpendType.all,
  startDate,
}: DetailsOwnProps): DetailsStateProps => {
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const location = useLocation();
  const queryFromRoute = parseQuery<Query>(location.search);

  const query = {
    sourceOfSpend,
    groupBy: {
      [groupBy]: groupByValue ? groupByValue : '*',
      ...(secondaryGroupBy &&
        secondaryGroupBy !== GroupByType.none && {
          [secondaryGroupBy]: '*',
        }),
    },
    ...(queryFromRoute.filter && { filter: queryFromRoute.filter }),
    ...(queryFromRoute.filter_by && { filter_by: queryFromRoute.filter_by }),
    ...(queryFromRoute.orderBy && { orderBy: secondaryGroupBy ? secondaryGroupBy : queryFromRoute.orderBy }),
    dateRange,
  };

  const reportQueryString = getQuery({
    ...query,
    filter: {
      ...(query.filter ? query.filter : {}),
      ...(sourceOfSpend !== SourceOfSpendType.all && { source_of_spend: getSourceOfSpendFilter(sourceOfSpend) }),
      ...(secondaryGroupBy && { limit: undefined, offset: undefined }), // Children are not paginated
    },
    ...(startDate && endDate && { ...formatDate(startDate, endDate) }),
    sourceOfSpend: undefined,
    dateRange: undefined,
  });

  const report = useSelector((state: RootState) =>
    reportSelectors.selectReport(state, reportPathsType, reportType, reportQueryString)
  );
  const reportFetchStatus = useSelector((state: RootState) =>
    reportSelectors.selectReportFetchStatus(state, reportPathsType, reportType, reportQueryString)
  );
  const reportError = useSelector((state: RootState) =>
    reportSelectors.selectReportError(state, reportPathsType, reportType, reportQueryString)
  );

  useEffect(() => {
    if (!reportError && reportFetchStatus !== FetchStatus.inProgress && startDate && endDate) {
      if (secondaryGroupBy) {
        if (secondaryGroupBy !== GroupByType.none && isExpanded) {
          dispatch(reportActions.fetchReport(reportPathsType, reportType, reportQueryString));
        }
      } else {
        // Primary group by
        dispatch(reportActions.fetchReport(reportPathsType, reportType, reportQueryString));
      }
    }
  }, [reportQueryString, isExpanded]);

  return {
    endDate,
    query,
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
    startDate,
  };
};
