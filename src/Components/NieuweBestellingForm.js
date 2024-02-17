import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { Picker } from "@react-native-picker/picker";

const NieuweBestellingForm = () => {
  const [dataSource] = useState([
    "apple",
    "banana",
    "cow",
    "dex",
    "zee",
    "orange",
    "air",
    "bottle",
  ]);
  const [filtered, setFiltered] = useState(dataSource);
  const [searching, setSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    // Filter data source initially when component mounts
    setFiltered(dataSource);
  }, []);

  const onSearch = (text) => {
    if (text) {
      setSearching(true); //to show dropdown make it true
      const temp = text.toLowerCase(); //making text lowercase to search
      //filter main dataSource and put result in temp array
      const tempList = dataSource.filter((item) =>
        item.toLowerCase().includes(temp)
      );
      //at the end of search setFiltered array to searched temp array.
      setFiltered(tempList);
    }
    //if nothing was searched
    else {
      setSearching(true); // Keep dropdown visible if search bar is empty
      setFiltered(dataSource); // Show all options when search bar is empty
    }
  };

  const handleItemPress = (item) => {
    setSelectedItems([...selectedItems, item]);
    setSearching(false); // Close dropdown after item selection
  };

  return (
    <Formik
      initialValues={{ selectValue: "" }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ handleChange, handleSubmit, values }) => (
        <View>
          <Text style={styles.label}>Kies een tafel:</Text>
          <View style={styles.select}>
            <Picker
              selectedValue={values.selectValue}
              onValueChange={handleChange("selectValue")}
              style={styles.selectt}
              itemStyle={{ width: 200, height: 64 }}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
              <Picker.Item label="7" value="7" />
              <Picker.Item label="8" value="8" />
              <Picker.Item label="9" value="9" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="11" value="11" />
            </Picker>
          </View>

          <View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "600" }}>Geselecteerd:</Text>
              {selectedItems.map((item, index) => (
                <Text style={styles.addeditems} key={index}>
                  {item}
                </Text>
              ))}
            </View>
            <Text style={styles.label}>Kies product(en):</Text>
          </View>

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttontext}>Bestelling opslaan</Text>
          </Pressable>
        </View>
      )}
    </Formik>
  );
};

export default NieuweBestellingForm;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#e27b00",
    padding: 15,
    position: "absolute",
    borderRadius: 3,
    top: 470,
    elevation: 0,
    zIndex: -10,
    width: "100%",
  },
  buttontext: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  select: {
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 25,
    height: 58,
    lineHeight: 10,
  },
  selectt: {
    //width: 200,
    height: 44,
    // backgroundColor: "green",
  },
  selectoption: {},
  label: {
    marginBottom: 7,
    fontWeight: "600",
  },
  textinput: {
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 0,
    height: 58,
    padding: 15,
  },
  addeditems: {
    paddingVertical: 10,
  },
});
