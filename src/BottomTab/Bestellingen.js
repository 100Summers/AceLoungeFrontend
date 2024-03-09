import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Header from "../Components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../Components/FloatingButton";
import { useRoute } from "@react-navigation/native";

const Bestellingen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const flatListRef = useRef(null);
  const route = useRoute();

  // Abstract the fetch logic into a function
  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://nl-app.onrender.com/orders");
      // Sort the orders by date from newest to oldest
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      // Map products to new array with details
      const ordersWithDetails = await Promise.all(
        sortedOrders.map(async (order) => {
          order.products = await Promise.all(
            order.products.map(async (product) => {
              const productDetails = await axios.get(
                `https://nl-app.onrender.com/products/${product.product}`
              );
              return {
                ...product,
                name: productDetails.data.name,
                price: productDetails.data.price,
              };
            })
          );
          return order;
        })
      );
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  useEffect(() => {
    // Subscribe to the focus event to refresh orders whenever the screen is focused
    const unsubscribe = navigation.addListener("focus", () => {
      // Call fetchOrders to refresh the list of orders
      fetchOrders();
    });

    // Return the function to unsubscribe from the event when the component unmounts
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.orderId) {
        const index = orders.findIndex(
          (order) => order._id === route.params.orderId
        );
        if (index !== -1 && flatListRef.current) {
          flatListRef.current.scrollToIndex({
            animated: true,
            index: index,
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation, orders, route.params?.orderId]);

  const handleEditOrder = (order) => {
    // Navigate to the EditBestelling screen and pass the entire order object
    navigation.navigate("EditBestelling", { order: order });
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(
        `https://nl-app.onrender.com/orders/${orderId}`
      );
      if (response.status === 200) {
        // Call fetchOrders to refresh the list after deletion
        fetchOrders();
        Alert.alert("Voltooid", "Bestelling verwijderd.");
      } else {
        throw new Error("Bestelling verwijderen mislukt.");
      }
    } catch (error) {
      Alert.alert("Fout", error.message || "Bestelling verwijderen mislukt.");
    }
  };

  const changeOrderStatus = async (orderId, newStatus) => {
    try {
      let patchUrl = `https://nl-app.onrender.com/orders/${orderId}/${newStatus}`;
      const response = await axios.patch(patchUrl);
      if (response.status === 200) {
        // Call fetchOrders to refresh the list after status change
        fetchOrders();
      } else {
        throw new Error("Status bijwerken mislukt.");
      }
    } catch (error) {
      console.error("Fout tijdens bijwerken status:", error);
    }
  };

  const showStatusOptions = (orderId, currentStatus) => {
    let newStatus = currentStatus === "unprocessed" ? "processed" : "paid";
    Alert.alert(
      "Bestelling status aanpassen",
      `Bestelling markeren als ${newStatus}?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Bevestig",
          onPress: () => changeOrderStatus(orderId, newStatus),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <Header name="Bestellingen" />
        </SafeAreaView>

        <View style={styles.mainContent}>
          <Text style={styles.screendescription}>
            Bekijk hier alle geplaatste bestellingen. "Niet afgehandeld" moet
            nog verwerkt worden. Nadat bestelling is afgehandeld: druk op
            'Afhandelen'. Nadat bestelling is betaald: druk op 'Betaald'.
          </Text>
          <View contentContainerStyle={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <View style={styles.centerSingleItem}>
                    <Text style={styles.orderId}>Tafel {item.table}</Text>
                  </View>
                  <View style={styles.spaceBetweenRow}>
                    <Text style={styles.orderDetail}>
                      {new Date(item.orderDate).toDateString() ===
                      new Date().toDateString()
                        ? new Date(item.orderDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(item.orderDate).toLocaleDateString("nl", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontWeight: "bold",
                        color:
                          item.status === "unprocessed" ? "red" : "#73bf5c",
                      }}
                    >
                      {item.status === "unprocessed"
                        ? "NIET AFGEHANDELD"
                        : "AFGEHANDELD"}
                    </Text>
                  </View>
                  <View style={styles.productCards}>
                    {item.products.map((product, index) => (
                      <View key={index} style={styles.productItem}>
                        <View style={styles.spaceBetweenRow}>
                          <Text style={styles.productDetail}>
                            {index + 1}. {product.name}
                          </Text>
                          <Text style={styles.productDetail}>
                            €{product.price.toFixed(2)}
                          </Text>
                        </View>
                        {product.selectedOptions.map((option, index) => (
                          <View
                            key={index}
                            style={[styles.spaceBetweenRow, styles.option]}
                          >
                            <Text style={styles.optionText}>
                              + {option.name}
                            </Text>
                            <Text style={styles.optionText}>
                              €{option.price.toFixed(2)}
                            </Text>
                          </View>
                        ))}
                        {/* <Text style={styles.productDetail}>
											{product.selectedOptions
												.map((option) => option.name)
												.join(", ")}
										</Text> */}
                      </View>
                    ))}
                  </View>
                  {item.notes && (
                    <View style={styles.notes}>
                      <Text>Notes:</Text>
                      <Text>{item.notes}</Text>
                    </View>
                  )}
                  <View style={styles.spaceBetweenRow}>
                    <View style={styles.buttonGroup}>
                      {item.status === "unprocessed" && (
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditOrder(item._id)}
                        >
                          <Text>Bewerken</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => showStatusOptions(item._id, item.status)}
                      >
                        <Icon name="arrow-right" size={20} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteOrder(item._id)}
                      >
                        <Icon name="trash" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.price}>
                      €{item.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        <FloatingButton />
      </SafeAreaView>
    </View>
  );
};

export default Bestellingen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0d5d6",
  },
  safeArea: {
    backgroundColor: "#311213",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  screendescription: {
    marginBottom: 40,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDetail: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  productItem: {
    // marginVerical: 10,
    padding: 2,
    // backgroundColor: "#f2f2f2",
    // borderRadius: 5,
  },
  productDetail: {
    fontSize: 13,
  },
  statusButton: {
    padding: 10,
    backgroundColor: "#e27b00",
    borderRadius: 5,
    marginRight: 10,
    alignSelf: "flex-start", // Align button to the start of the flex container
    flexDirection: "row", // Align icon and text in a row
    alignItems: "center", // Center items vertically
    justifyContent: "center", // Center items horizontally
  },
  spaceBetweenRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
  },
  centerSingleItem: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  productCards: {
    marginTop: 10,
    marginBottom: 20,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    padding: 10,
    backgroundColor: "#007bff", // You can choose a different color
    borderRadius: 5,
    marginRight: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "center",
  },
  option: {
    paddingLeft: 20,
  },
  optionText: {
    fontSize: 10,
    textTransform: "capitalize",
  },
  notes: {
    marginBottom: 10,
  },
});
