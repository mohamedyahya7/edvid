import React from 'react';
import { StyleSheet, View } from 'react-native';
import ExploreScreen from '../screens/ExploreScreen';



// import ListScreen from '../screens/clubs/ListScreen';


export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      {/* <ListScreen /> */}
      <ExploreScreen />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
});
