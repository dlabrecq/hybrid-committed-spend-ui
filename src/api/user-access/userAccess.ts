import axios from 'axios';

export interface UserAccess {
  hcsDeal?: boolean;
}

// eslint-disable-next-line no-shadow
export const enum UserAccessType {
  all = 'all',
  details = 'details',
}

// If the user-access API is called without a query parameter, all types are returned in the response
export function fetchUserAccess(query: string) {
  const insights = (window as any).insights;
  const queryString = query ? `?${query}` : '';
  if (insights && insights.chrome && insights.chrome.auth && insights.chrome.auth.getUser) {
    return insights.chrome.auth.getUser().then(() => {
      return axios.get<UserAccess>(`authorization/hcsEnrollment${queryString}`);
    });
  } else {
    return axios.get<UserAccess>(`authorization/hcsEnrollment${queryString}`);
  }
}
