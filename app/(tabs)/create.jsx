import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const create = () => {
  return (
    <SafeAreaView>
      <View>
        <Text className="text-red-500 bg-black">Create</Text>
      </View>
    </SafeAreaView>
  )
}

export default create