/* eslint-disable global-require */

module.exports = {
  /**
   * Navigators
   */
  get createSwitchNavigator() {
    return require('./navigators/createSwitchNavigator').default
  },
  get createContainedSwitchNavigator() {
    return require('./navigators/createContainedSwitchNavigator').default
  },

  /**
   * Router
   */
  get SwitchRouter() {
    return require('./navigators/switchRouter').default
  },

  /**
   * Views
   */
  get FadeTransition() {
    return require('./views/FadeTransition').default
  },
  get Transitioner() {
    return require('./views/Transitioner').default
  },

  /**
   * HOCs
   */
  get withTransition() {
    return require('./utils/withTransition').default
  },

  get withFadeTransition() {
    return require('./utils/withTransition').withFadeTransition
  },
}
