/* eslint-disable react/no-multi-comp, import/no-unresolved */
import React from 'react'
import {
  Button,
  Text as UnstyledText,
  View as UnstyledView,
} from 'react-native'
import {
  FadeTransition,
  createSwitchNavigator,
} from 'react-navigation-switch-transitioner'

const View = props => {
  const { style, ...propsNoStyle } = props
  return (
    <UnstyledView
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#eee',
        ...style,
      }}
      {...propsNoStyle}
    />
  )
}
const Text = props => (
  <UnstyledText style={{ textAlign: 'center' }} {...props} />
)

class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props
    return (
      <View style={{ backgroundColor: '#ee0' }}>
        <Text>Home Screen</Text>
        <Button
          onPress={() => {
            navigation.navigate('AnotherScreen')
          }}
          title="Go to Another"
        />
        <Button
          onPress={() => {
            navigation.navigate('ProfileScreen', { name: 'Jane' })
          }}
          title="Go to Jane's profile"
        />
      </View>
    )
  }
}

class AnotherScreen extends React.Component {
  static navigationOptions = FadeTransition.navigationOptions

  render() {
    const { navigation } = this.props
    return (
      <FadeTransition {...this.props}>
        <View style={{ backgroundColor: '#0ee' }}>
          <Text>Another Screen</Text>
          <Button
            onPress={() => {
              navigation.navigate('HomeScreen')
            }}
            title="Go Home"
          />
          <Button
            onPress={() => {
              navigation.navigate('ProfileScreen', { name: 'Jane' })
            }}
            title="Go to Jane's profile"
          />
        </View>
      </FadeTransition>
    )
  }
}

class ProfileScreen extends React.Component {
  static navigationOptions = FadeTransition.navigationOptions

  render() {
    const { navigation } = this.props
    return (
      <FadeTransition {...this.props}>
        <View>
          <Text>
            {navigation.getParam('name')}
            's Profile
          </Text>
          <Button
            onPress={() => {
              navigation.navigate('AnotherScreen')
            }}
            title="Go to Another"
          />
          <Button
            onPress={() => navigation.navigate('HomeScreen')}
            title="Go Home"
          />
        </View>
      </FadeTransition>
    )
  }
}

export default createSwitchNavigator(
  {
    HomeScreen,
    AnotherScreen,
    ProfileScreen,
  },
  {
    initialRouteName: 'HomeScreen',
  },
)
