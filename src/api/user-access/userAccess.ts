import axios from 'axios';

export interface UserAccess {
  hcsDataVisibility?: boolean;
  hcsDeal?: boolean;
}

// eslint-disable-next-line no-shadow
export const enum UserAccessType {
  all = 'all',
  dataVisibility = 'dataVisibility',
  deal = 'deal',
}

// If the user-access API is called without a query parameter, all types are returned in the response
export function fetchUserAccess(query: string) {
  const queryString = query ? `?${query}` : '';
  const fetch = () => axios.get<UserAccess>(`authorization/hcsEnrollment${queryString}`);

  const insights = (window as any).insights;
  if (insights && insights.chrome && insights.chrome.auth && insights.chrome.auth.getUser) {
    return insights.chrome.auth.getUser().then(() => fetch());
  } else {
    return fetch();
  }
}
