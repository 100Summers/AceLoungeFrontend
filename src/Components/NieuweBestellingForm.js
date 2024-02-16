import React, { useState } from "react";
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
import ProductSearchDropDown from "./ProductSearchDropDown";

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

  const onSearch = (text) => {
    if (text) {
      setSearching(true); //to show dropdown make it true
      const temp = text.toLowerCase(); //making text lowercase to search
      //filter main dataSource and put result in temp array
      const tempList = dataSource.filter((item) => {
        if (item.match(temp)) return item;
      });
      //at the end of search setFiltered array to searched temp array.
      setFiltered(tempList);
    }
    //if nothing was searched
    else {
      setSearching(false); //set searching to false
    }
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
            <Text style={styles.label}>Kies product(en):</Text>
            <View>
              <TextInput
                style={styles.textinput}
                placeholder="Selecteer product(en)..."
                onChangeText={onSearch}
              />
            </View>

            {searching && (
              <ProductSearchDropDown
                onPress={() => setSearching(false)}
                dataSource={filtered}
              />
            )}
          </View>

          {/* <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttontext}>Klaar</Text>
          </Pressable> */}
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
  },
  buttontext: {
    color: "white",
    textAlign: "center",
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
  },
  textinput: {
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 0,
    height: 58,
    padding: 15,
  },
});
