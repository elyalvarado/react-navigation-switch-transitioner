# React Navigation Switch Transitioner

Switch navigator for use on iOS and Android, allowing custom transitions on switching.

It also includes a FadeTransition to use in your screens to get cross-fading for the switch navigator

## Installation

Open a Terminal in your project's folder and run,

```sh
yarn add react-navigation-switch-transitioner
```

## Usage

Create your Switch Navigator with the same parameters than the react-navigation one.

There are 2 options to add transitions to your Screens:

### Option 1: Using the provided HOC

This library provides two HOCs: `withTransition` and `withFadeTransition` which you can use to wrap your screens. The first one allows you to inject any transition to your screen, while the second one uses the provided FadeTransition.

```js
import { createSwitchNavigator, FadeTransition, withTransition, withFadeTransition } from 'react-navigation-switch-transitioner'

export default createSwitchNavigator({
  Inbox: withTransition(FadeTransition)(InboxScreen)
  Drafts: withFadeTransition(DraftsScreen),
}, {
  initialRouteName: 'Inbox',
})
```

### Option 2: Wrap your screens with a transition component

If you want your screens to Fade on transitioning to/from them, wrap them in the FadeTransition component and expose its navigationOptions (don't forget to pass the received props to the FadeTransition)

```js
import { FadeTransition } from 'react-navigation-switch-transitioner'

class DraftScreen extends React.Component {
  static navigationOptions = FadeTransition.navigationOptions

  render() {
    return (
      <FadeTransition {...this.props}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#eee',
          }}
        >
          <Text>Drafts</Text>
        </View>
      </FadeTransition>
    )
  }
}
```

## Docs

It is mostly compatible with the react-navigation `SwitchNavigator` so the best place to start while documention is created is the [React Navigation website](https://reactnavigation.org/docs/en/switch-navigator.html).

## Implementing your own Transitions

If you want to implement your own transition take a look at the source code for the FadeTransition.

## Run the example app

To run the example app do the following:

```sh
git clone https://github.com/elyalvarado/react-navigation-switch-transitioner
cd react-navigation-switch-transitioner
yarn install
cd examples
yarn install
yarn start
```
