import React from 'react'
import Expo from 'expo'
import { StyleSheet, View } from 'react-native'
import Fade from './src/Fade'

// Comment the following two lines to stop using react-native-screens
import { useScreens } from 'react-native-screens' // eslint-disable-line
useScreens()

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// eslint-disable-next-line react/prefer-stateless-function
class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Fade />
      </View>
    )
  }
}

Expo.registerRootComponent(App)
