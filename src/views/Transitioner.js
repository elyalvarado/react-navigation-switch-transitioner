import React from 'react'
import { StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { StackActions, NavigationProvider } from 'react-navigation'

const getKey = navState => navState.routes[navState.index].key

const defaultCreateTransition = transition => ({ ...transition })

const defaultRunTransition = () => {}

const getStateForNavChange = (props, state) => {
  // by this point we know the nav state has changed and it is safe to provide a new state. static
  // getDerivedStateFromProps will never interrupt a transition (when there is state.isTransitioning),
  // and _runTransition runs this after the previous transition is complete.
  const { navigation } = props
  const nextNavState = navigation.state

  // Transitions are requested by setting nav state.isTransitioning to true.
  // If false, we set the state immediately without transition
  if (!nextNavState.isTransitioning) {
    return {
      isTransitioning: false,
      transitions: {}, // state.transitions,
      transitioningFromState: null,
      transitioningFromDescriptors: null,
      navState: nextNavState,
      descriptors: props.descriptors,
    }
  }

  const toKey = getKey(nextNavState)
  const descriptor =
    props.descriptors[toKey] ||
    state.descriptors[toKey] ||
    state.transitioningFromDescriptors[toKey]
  const { options } = descriptor
  const createTransition = options.createTransition || defaultCreateTransition
  const transition = createTransition({ navigation: props.navigation })

  // Get and create the previous screen transition
  const fromKey = getKey(state.navState)
  const fromDescriptor =
    props.descriptors[fromKey] ||
    state.descriptors[fromKey] ||
    state.transitioningFromDescriptors[fromKey]
  const { options: fromOptions } = fromDescriptor
  const createFromTransition =
    fromOptions.createTransition || defaultCreateTransition
  const fromTransition = createFromTransition({ navigation: props.navigation })

  return {
    isTransitioning: true,
    transitions: {
      [toKey]: transition,
      [fromKey]: fromTransition,
    },
    transitioningFromState: state.navState,
    transitioningFromDescriptors: state.descriptors,
    navState: nextNavState,
    descriptors: props.descriptors,
  }
}

export default class Transitioner extends React.Component {
  state = {
    // if this true, there is a transition in progress:
    isTransitioning: false,
    // an object of transitions by route key
    transitions: {},
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
    if (state.isTransitioning) {
      return state
    }

    return getStateForNavChange(props, state)
  }

  componentDidUpdate(lastProps, lastState) {
    const { isTransitioning, transitioningFromState } = this.state
    if (
      // If we are transitioning
      isTransitioning &&
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
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = state

    // get the current screen transition
    const toKey = getKey(navState)
    const descriptor = descriptors[toKey] || transitioningFromDescriptors[toKey]
    const { runTransition } = descriptor.options
    const run = runTransition || defaultRunTransition
    const transition = transitions[toKey]

    // get the previous screen transition
    const fromKey = getKey(transitioningFromState)
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
        isTransitioning: false,
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
      isTransitioning,
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = this.state
    const { screenProps, navigation } = this.props
    const backScreenStyles = {} // FIX THIS:

    const activeKey = getKey(navState)
    const incomingDescriptor =
      descriptors[activeKey] || transitioningFromDescriptors[activeKey]
    const incomingOptions = incomingDescriptor && incomingDescriptor.options
    const incomingHasManagedTransition =
      incomingOptions &&
      incomingOptions.runTransition &&
      incomingOptions.createTransition
    const incomingTransition = transitions[activeKey]
    const IncomingScreen = incomingDescriptor.getComponent()
    const transitioningToState = isTransitioning ? navigation.state : null

    const oldKey = transitioningFromState && getKey(transitioningFromState)
    const outgoingDescriptor = oldKey && transitioningFromDescriptors[oldKey]
    const outgoingOptions = outgoingDescriptor && outgoingDescriptor.options
    const outgoingHasManagedTransition =
      outgoingOptions &&
      outgoingOptions.runTransition &&
      outgoingOptions.createTransition
    const outgoingTransition = oldKey && transitions[oldKey]
    const OutgoingScreen =
      outgoingDescriptor && outgoingDescriptor.getComponent()

    // make sure we're filling the screen with our AnimatedView and Screens
    const style = [{ flex: 1, ...StyleSheet.absoluteFillObject }]

    const passdownProps = {
      isTransitioning,
      transitions,
      transitioningFromState,
      transitioningToState,
      style,
    }

    // We shouldn't pass down the managed transition props to other screens
    // because it might cause propsValidation errors. This was happening with
    // the navigators
    const outgoingProps = outgoingHasManagedTransition
      ? {
          ...passdownProps,
          transition: outgoingTransition,
          screenProps,
        }
      : {
          screenProps,
        }

    const incomingProps = incomingHasManagedTransition
      ? {
          ...passdownProps,
          transition: incomingTransition,
          screenProps,
        }
      : {
          screenProps,
        }

    const screens = [
      (
        <IncomingScreen
          {...incomingProps}
          navigation={incomingDescriptor.navigation}
          key={activeKey}
        />
      )
    ]

    if(OutgoingScreen) {
      const outgoingWithProps = (
        <OutgoingScreen
          {...outgoingProps}
          navigation={outgoingDescriptor.navigation}
          key={oldKey}
        />
      )
      // The outgoing screen is on top if the incoming screen has no managed
      // transition but the outgoing has one, else is below the incoming one.
      // This allows showing a transition on transitioning to screens with
      // nested navigators coming from a simple screen.
      if(!incomingHasManagedTransition && outgoingHasManagedTransition) {
        screens.push(outgoingWithProps)
      } else {
        screens.unshift(outgoingWithProps)
      }
    }

    return (
      <Animated.View
        style={[...style, { ...backScreenStyles }]}
        pointerEvents="auto"
      >
        <NavigationProvider value={incomingDescriptor.navigation}>
          { [ ...screens ] }
        </NavigationProvider>
      </Animated.View>
    )
  }
}
