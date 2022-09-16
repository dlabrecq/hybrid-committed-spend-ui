import { ActionType, getType } from 'typesafe-actions';

import { resetState, setFeatureFlags } from './featureFlagsActions';

export type FeatureFlagsAction = ActionType<typeof setFeatureFlags | typeof resetState>;

export type FeatureFlagsState = Readonly<{
  isDetailsFeatureEnabled: boolean;
}>;

export const defaultState: FeatureFlagsState = {
  isDetailsFeatureEnabled: false,
};

export const stateKey = 'featureFlags';

export function featureFlagsReducer(state = defaultState, action: FeatureFlagsAction): FeatureFlagsState {
  switch (action.type) {
    case getType(resetState):
      state = defaultState;
      return state;

    case getType(setFeatureFlags):
      return {
        ...state,
        isDetailsFeatureEnabled: action.payload.isDetailsFeatureEnabled,
      };

    default:
      return state;
  }
}