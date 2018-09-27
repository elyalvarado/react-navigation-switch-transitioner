import { SwitchRouter, NavigationActions, StackActions } from 'react-navigation'

export default (routeConfigs, config = {}) => {
  const switchRouter = SwitchRouter(routeConfigs, config)
  const defaultGetStateForAction = switchRouter.getStateForAction

  switchRouter.getStateForAction = (action, state) => {
    const newState = defaultGetStateForAction(action, state)

    const routeKeys = state && state.routes && state.routes.map(s => s.key)

    if (
      action.type === NavigationActions.NAVIGATE &&
      newState && // There is a state change
      routeKeys && // Routes are defined
      routeKeys.includes(action.routeName) && // Is one of my routes
      !action.action // And there is no sub-action
    ) {
      return {
        ...newState,
        isTransitioning:
          state.index !== newState.index
            ? action.immediate !== true
            : state.isTransitioning,
      }
    }

    if (
      action.type === StackActions.COMPLETE_TRANSITION &&
      state.isTransitioning
    ) {
      return {
        ...newState,
        isTransitioning: false,
      }
    }
    return newState
  }

  return switchRouter
}
