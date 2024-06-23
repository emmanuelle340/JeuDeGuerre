import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const SalleAttente = ({ gameId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game ID: {gameId}</Text>
      <Text style={styles.message}>Veuillez patienter, la partie va bientôt commencer.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
});

export default SalleAttente;
