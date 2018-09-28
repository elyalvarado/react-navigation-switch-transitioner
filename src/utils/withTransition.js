import React from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import FadeTransition from '../views/FadeTransition'

const withTransition = Transition => Screen => {
  class WithTransition extends React.Component {
    static navigationOptions = Transition.navigationOptions

    render() {
      const {
        transition,
        transitions,
        transitionRouteKey,
        transitioningFromState,
        transitioningToState,
        style,
        ...nonTransitionProps
      } = this.props
      return (
        <Transition {...this.props}>
          <Screen {...nonTransitionProps} />
        </Transition>
      )
    }
  }

  hoistNonReactStatic(WithTransition, Screen)

  return WithTransition
}

export const withFadeTransition = withTransition(FadeTransition)
export default withTransition
