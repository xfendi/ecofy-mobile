import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const welcome = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Welcome to Ecofy!</Text>
      </View>
    </SafeAreaView>
  )
}

export default welcome