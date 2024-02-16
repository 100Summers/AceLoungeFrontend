import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import React from "react";
//import Header from "../Components/Header";
import NieuweBestellingForm from "../Components/NieuweBestellingForm";

const NieuweBestelling = () => {
  return (
    <View style={styles.container}>
      {/* <Header name="Detail" /> */}
      <Text style={styles.descriptiontext}>
        Voeg een nieuwe bestelling toe. Selecteer een tafel, kies de producten
        en voeg een notitie toe. Het totaalbedrag wordt onderaan getoond.
      </Text>
      <View style={styles.form}>
        <NieuweBestellingForm />
      </View>
    </View>
  );
};

export default NieuweBestelling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e0d5d6",
    //alignItems: "center",
    // justifyContent: "center",
  },
  descriptiontext: {
    marginBottom: 40,
  },
});
