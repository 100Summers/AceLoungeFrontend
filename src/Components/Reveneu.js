// Import necessary components from React Native
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define the Revenue component
const Revenue = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.boldText}>Revenue Page</Text>
    </View>
  );
};

// Create styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

// Export the Revenue component
export default Revenue;
