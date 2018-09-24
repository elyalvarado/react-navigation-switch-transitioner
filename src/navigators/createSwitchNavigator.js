import { createNavigator } from 'react-navigation'
import Transitioner from '../views/Transitioner'
import SwitchRouter from './switchRouter'

export default (routeConfigMap, switchConfig = {}) => {
  const router = SwitchRouter(routeConfigMap, switchConfig)
  const Navigator = createNavigator(Transitioner, router, switchConfig)
  return Navigator
}
