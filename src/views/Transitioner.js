import React from 'react'
import { StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { StackActions, NavigationProvider } from 'react-navigation'

const getTransitionOwnerRouteKey = (fromState, toState) =>
  toState.routes[toState.index].key

const defaultCreateTransition = transition => ({ ...transition })

const defaultRunTransition = () => {}

const getStateForNavChange = (props, state) => {
  // by this point we know the nav state has changed and it is safe to provide a new state. static
  // getDerivedStateFromProps will never interrupt a transition (when there is state.transitionRouteKey),
  // and _runTransition runs this after the previous transition is complete.
  const { navigation } = props
  const nextNavState = navigation.state

  // Transitions are requested by setting nav state.isTransitioning to true.
  // If false, we set the state immediately without transition
  if (!nextNavState.isTransitioning) {
    return {
      transitions: state.transitions,
      transitionRouteKey: null,
      transitioningFromState: null,
      transitioningFromDescriptors: null,
      navState: nextNavState,
      descriptors: props.descriptors,
    }
  }

  // Get and/or create the current screen transition
  const transitionRouteKey = getTransitionOwnerRouteKey(
    state.navState,
    nextNavState,
  )
  const descriptor =
    props.descriptors[transitionRouteKey] ||
    state.descriptors[transitionRouteKey] ||
    state.transitioningFromDescriptors[transitionRouteKey]
  const { options } = descriptor
  const createTransition = options.createTransition || defaultCreateTransition
  const transition =
    state.transitions[transitionRouteKey] ||
    createTransition({
      navigation: props.navigation,
      transitionRouteKey,
    })

  // Get and create the previous screen transition
  const fromKey = state.navState.routes[state.navState.index].key
  const fromDescriptor =
    props.descriptors[fromKey] ||
    state.descriptors[fromKey] ||
    state.transitioningFromDescriptors[fromKey]
  const { options: fromOptions } = fromDescriptor
  const createFromTransition =
    fromOptions.createTransition || defaultCreateTransition
  const fromTransition =
    state.transitions[fromKey] ||
    createFromTransition({
      navigation: props.navigation,
      fromKey,
    })

  return {
    transitions: {
      ...state.transitions,
      [transitionRouteKey]: transition,
      [fromKey]: fromTransition,
    },
    transitionRouteKey,
    transitioningFromState: state.navState,
    transitioningFromDescriptors: state.descriptors,
    navState: nextNavState,
    descriptors: props.descriptors,
  }
}

export default class Transitioner extends React.Component {
  state = {
    // an object of transitions by route key
    transitions: {},
    // if this is present, there is a transition in progress:
    transitionRouteKey: null,
    // this will be the previous nav state and descriptors, when there is a transition in progress
    transitioningFromState: null,
    transitioningFromDescriptors: {},
    // this is the current navigation state and descriptors:
    navState: this.props.navigation.state,
    descriptors: this.props.descriptors,
  }

  static getDerivedStateFromProps = (props, state) => {
    // Transition only happens when nav state changes
    if (props.navigation.state === state.navState) {
      return state
    }
    // Never interrupt a transition in progress.
    if (state.transitionRouteKey) {
      return state
    }

    return getStateForNavChange(props, state)
  }

  componentDidUpdate(lastProps, lastState) {
    const { transitionRouteKey, transitioningFromState } = this.state
    if (
      // If we are transitioning
      transitionRouteKey &&
      // And this is a new transition,
      lastState.transitioningFromState !== transitioningFromState
    ) {
      this._startTransition().then(
        () => {},
        e => {
          console.error('Error running transition:', e)
        },
      )
    }
  }

  completeTransition = () => {
    const { navigation } = this.props
    if (navigation.state.isTransitioning) {
      navigation.dispatch(
        StackActions.completeTransition({
          key: navigation.state.key,
        }),
      )
    }
  }

  async _startTransition() {
    // Put state in function scope, so we are confident that we refer to the exact same state later for getStateForNavChange.
    // Even though our state shouldn't change during the animation.
    const { state } = this
    const {
      transitions,
      transitionRouteKey,
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = state

    // get the current screen transition
    const descriptor =
      descriptors[transitionRouteKey] ||
      transitioningFromDescriptors[transitionRouteKey]
    const { runTransition } = descriptor.options
    const run = runTransition || defaultRunTransition
    const transition = transitions[transitionRouteKey]

    // get the previous screen transition
    const fromKey =
      transitioningFromState.routes[transitioningFromState.index].key
    const fromDescriptor =
      descriptor[fromKey] || transitioningFromDescriptors[fromKey]
    const { runTransition: runFromTransition } = fromDescriptor.options
    const runFrom = runFromTransition || defaultRunTransition
    const fromTransition = transitions[fromKey]

    // Run animation, this might take some time..
    // await oldRun(oldTransition, transitioningFromState, navState);
    // await run(transition, transitioningFromState, navState);
    await Promise.all([
      runFrom(fromTransition, transitioningFromState, navState),
      run(transition, transitioningFromState, navState),
    ])

    // after async animator, this.props may have changed. re-check it now:
    // eslint-disable-next-line react/destructuring-assignment
    if (navState === this.props.navigation.state) {
      // Navigation state is currently the exact state we were transitioning to. Set final state and we're done
      this.setState({
        transitionRouteKey: null,
        transitioningFromState: null,
        transitioningFromDescriptors: {},
        // navState and descriptors remain unchanged at this point.
      })
    } else {
      // Navigation state prop has changed during the transtion! Schedule another transition
      this.setState(getStateForNavChange(this.props, state))
    }

    this.completeTransition()
  }

  render() {
    const {
      transitions,
      transitionRouteKey,
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = this.state
    const { screenProps, navigation } = this.props
    const backScreenStyles = {} // FIX THIS:

    const activeKey = navState.routes[navState.index].key
    const incomingDescriptor =
      descriptors[activeKey] || transitioningFromDescriptors[activeKey]
    const incomingTransition = transitions[activeKey]
    const IncomingScreen = incomingDescriptor.getComponent()
    const transitioningToState = transitionRouteKey ? navigation.state : null

    const oldKey =
      transitionRouteKey &&
      transitioningFromState &&
      transitioningFromState.routes[transitioningFromState.index].key
    const outgoingDescriptor = oldKey && transitioningFromDescriptors[oldKey]
    const outgoingTransition = oldKey && transitions[oldKey]
    const OutgoingScreen =
      outgoingDescriptor && outgoingDescriptor.getComponent()

    // make sure we're filling the screen with our AnimatedView and Screens
    const style = [{ flex: 1, ...StyleSheet.absoluteFillObject }]

    const passdownProps = {
      transitions,
      transitioningFromState,
      transitioningToState,
      transitionRouteKey,
      screenProps,
      style,
    }

    return (
      <Animated.View
        style={[...style, { ...backScreenStyles }]}
        pointerEvents="auto"
        key={activeKey}
      >
        <NavigationProvider value={incomingDescriptor.navigation}>
          {OutgoingScreen ? (
            <OutgoingScreen
              transition={outgoingTransition}
              navigation={outgoingDescriptor.navigation}
              {...passdownProps}
            />
          ) : null}
          <IncomingScreen
            transition={incomingTransition}
            navigation={incomingDescriptor.navigation}
            {...passdownProps}
          />
        </NavigationProvider>
      </Animated.View>
    )
  }
}
