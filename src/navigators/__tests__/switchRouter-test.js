import React from 'react'
import { StackRouter, NavigationActions, StackActions } from 'react-navigation'
import SwitchRouter from '../switchRouter'

const getExampleRouter = (config = {}) => {
  const PlainScreen = () => <div />
  const StackC = () => <div />

  StackC.router = StackRouter({
    C1: PlainScreen,
    C2: PlainScreen,
  })

  const router = SwitchRouter(
    {
      A: PlainScreen,
      B: PlainScreen,
      C: StackC,
    },
    {
      initialRouteName: 'A',
      ...config,
    },
  )

  return router
}

describe('switchRouter', () => {
  it('sets isTransitioning to true when switching screens on the same switch', () => {
    const router = getExampleRouter()
    const initialState = router.getStateForAction({
      type: NavigationActions.INIT,
    })

    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'B' },
      initialState,
    )
    expect(state2.index).toEqual(1)
    expect(state2.isTransitioning).toEqual(true)
  })

  it('sets isTransitioning back to false when receiving complete transition', () => {
    const router = getExampleRouter()
    const initialState = router.getStateForAction({
      type: NavigationActions.INIT,
    })
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'B' },
      initialState,
    )

    const state3 = router.getStateForAction(
      { type: StackActions.COMPLETE_TRANSITION },
      state2,
    )

    expect(state3.isTransitioning).toEqual(false)
  })

  it("doesn't set isTransitioning when directly switching to nested screens on the navigator", () => {
    const router = getExampleRouter({ initialRouteName: 'C' })
    const initialState = router.getStateForAction({
      type: NavigationActions.INIT,
    })

    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'C2' },
      initialState,
    )

    expect(state2.isTransitioning).toEqual(false)
  })

  it("doesn't set isTransitioning when switching to nested screens on the navigator using subactions", () => {
    const router = getExampleRouter()
    const initialState = router.getStateForAction({
      type: NavigationActions.INIT,
    })

    const state2 = router.getStateForAction(
      {
        type: NavigationActions.NAVIGATE,
        routeName: 'C',
        action: { type: NavigationActions.NAVIGATE, routeName: 'C1' },
      },
      initialState,
    )

    expect(state2.isTransitioning).toEqual(false)
  })

  it("doesn't makes any changes when switching to the same screen", () => {
    const router = getExampleRouter()
    const initialState = router.getStateForAction({
      type: NavigationActions.INIT,
    })

    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'B' },
      initialState,
    )

    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'B' },
      state2,
    )

    expect(state3).toEqual(null)
  })
})
