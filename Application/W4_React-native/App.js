import * as React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>

      {/* App Icon */}
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>P</Text>
      </View>

      {/* Illustration Image */}
      <Image
        source={{
          uri: "https://i.pinimg.com/736x/54/d5/d2/54d5d28149627c37c73588b390def2d0.jpg"
        }}
        style={styles.heroImage}
      />

      {/* Text */}
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>
        This app is the simplest way to pay your parking using your smartphone.
      </Text>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6A0DAD",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25
  },
  iconBox: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30
  },
  iconText: {
    fontSize: 55,
    fontWeight: "bold",
    color: "#4169E1"
  },
  heroImage: {
    width: 230,
    height: 150,
    marginBottom: 25
  },
  title: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#EFDFFF",
    marginBottom: 40
  },
  button: {
    backgroundColor: "#3C82F6",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 12
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "700"
  }
});
