import React, { useState } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';

const App = () => {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(4);  

  return (
    <View style={styles.container}>

      <Text style={{ marginBottom: 20, fontSize: 20 }}>
        Current Count: {count}
      </Text>

      <Button title="Open Modal" onPress={() => setVisible(true)} />

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>

            <Text style={{ marginBottom: 20 }}>This is a modal!</Text>

            <Button
              title="Increase Count (+2)"
              onPress={() => setCount(count + 2)}
            />

            <View style={{ height: 15 }} />

          
            <Button
              title="Close"
              onPress={() => setVisible(false)}
            />

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default App;
