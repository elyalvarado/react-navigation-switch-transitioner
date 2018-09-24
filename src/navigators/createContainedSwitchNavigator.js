import { createNavigationContainer } from 'react-navigation'
import createSwitchNavigator from './createSwitchNavigator'

export default (routeConfigs, config = {}) => {
  const navigator = createSwitchNavigator(routeConfigs, config)
  return createNavigationContainer(navigator)
}
