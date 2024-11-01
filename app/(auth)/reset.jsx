import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const reset = () => {
  return (
    <SafeAreaView>
      <View>
        <Text className="text-red-500 bg-black">reset password Page</Text>
      </View>
    </SafeAreaView>
  )
}

export default reset