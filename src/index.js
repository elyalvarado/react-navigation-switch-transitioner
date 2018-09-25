/* eslint-disable global-require */

module.exports = {
  /**
   * Navigators
   */
  get createSwitchNavigator() {
    return require('./navigators/createContainedSwitchNavigator').default
  },
  get createUncontainedSwitchNavigator() {
    return require('./navigators/createSwitchNavigator').default
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
