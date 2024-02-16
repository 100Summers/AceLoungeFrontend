import {
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
} from "react-native";
import React from "react";

function ProductSearchDropDown(props) {
  const { dataSource } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress} style={styles.container}>
      <View style={styles.subContainer}>
        {dataSource.length ? (
          dataSource.map((item) => {
            return (
              <View style={styles.itemView} key={item}>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.noResultView}>
            <Text style={styles.noResultText}>No search items matched</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ProductSearchDropDown;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subContainer: {
    backgroundColor: "#84DCC6",
    paddingTop: 0,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "# ",
    //flexWrap: "wrap",

    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  itemView: {
    // marginHorizontal: '10%',
    backgroundColor: "white",
    height: 40,
    width: "100%",
    marginBottom: 0,
    justifyContent: "center",
    borderRadius: 0,
  },
  itemText: {
    color: "black",
    paddingHorizontal: 10,
  },
  noResultView: {
    alignSelf: "center",
    // margin: 20,
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  noResultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
