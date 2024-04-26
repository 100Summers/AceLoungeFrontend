import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from "react-native";
import Header from "../Components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../Components/FloatingButton";
import { useRoute } from "@react-navigation/native";
import { printAsync, PrintOptions } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';

const Bestellingen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const flatListRef = useRef(null);
  const route = useRoute();

  // Abstract the fetch logic into a function
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://208.109.231.135/orders");
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
                `http://208.109.231.135/products/${product.product}`
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
      console.error("Error ofetching orders", error);
    }
  };

  const getBase64Logo = async () => {
    try {
      const asset = Asset.fromModule(require('../../assets/AceLogo.png'));
      await asset.downloadAsync();  // Ensure the asset is downloaded
  
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      return base64;
    } catch (error) {
      console.error("Failed to load logo:", error);
    }
  }

  const generateReceipt = async (order) => {
    const logoBase64 = await getBase64Logo();
    // Create a map to store product quantities and details
    const productMap = {};

    order.products.forEach(product => {
      if (productMap[product.name]) {
        productMap[product.name].quantity += 1; // Increment quantity
        productMap[product.name].subtotal += product.price;
      } else {
        productMap[product.name] = {
          price: product.price,
          quantity: 1,
          subtotal: product.price
        };
      }
    });

    const htmlContent = `
      <html>
      <head>
        <style>
          #invoice-POS{
            box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5);
            padding:4mm;
            margin: 0 auto;
            width: 44mm;
            background: #FFF;
          }
          h1, h2, h3, p {
            margin: 0;
            padding: 0;
          }
          h1 {
            font-size: 1.5em;
            color: #222;
          }
          h2 {
            font-size: .9em;
          }
          h3 {
            font-size: 1.2em;
            font-weight: 300;
            line-height: 2em;
          }
          p {
            font-size: .7em;
            color: #666;
            line-height: 1.2em;
          }
          #top, #mid, #bot {
            border-bottom: 1px solid #EEE;
          }
          #top {
            min-height: 100px;
          }
          #mid {
            min-height: 80px;
          }
          #bot {
            min-height: 50px;
          }
          .info {
            display: block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .tabletitle {
            padding: 5px;
            font-size: .5em;
            background: #EEE;
          }
          .service {
            border-bottom: 1px solid #EEE;
          }
          .item {
            width: 24mm;
          }
          .itemtext {
            font-size: .5em;
          }
          #legalcopy {
            margin-top: 5mm;
            text-align: center;
          }
          .legal {
            font-size: .7em; /* Adjust font size as needed */
            line-height: 1.2em; /* Adjust line height for better readability */
          }
          .logo img {
            height: 50px;  /* Adjust this value as needed */
            width: auto;   /* This will maintain the aspect ratio */
          }          
        </style>
      </head>
      <body>
        <div id="invoice-POS">
        <center id="top">
        <div class="logo">
        <img src="data:image/png;base64,${logoBase64}" alt="AceLoung
        </div>
        <div class="info"> 
          <h2>AceLounge</h2>
        </div><!--End Info-->
      </center><!--End InvoiceTop-->
          <div id="bot">
            <div id="table">
              <table>
                <tr class="tabletitle">
                  <td class="item"><h2>Item</h2></td>
                  <td class="Hours"><h2>Qty</h2></td>
                  <td class="Rate"><h2>Sub Total</h2></td>
                </tr>
                ${Object.keys(productMap).map(key => `
                  <tr class="service">
                    <td class="tableitem"><p class="itemtext">${key}</p></td>
                    <td class="tableitem"><p class="itemtext">${productMap[key].quantity}</p></td>
                    <td class="tableitem"><p class="itemtext">$${productMap[key].subtotal.toFixed(2)}</p></td>
                  </tr>
                `).join('')}
                <tr class="tabletitle">
                  <td></td>
                  <td class="Rate"><h2>Total</h2></td>
                  <td class="payment"><h2>$${order.totalPrice.toFixed(2)}</h2></td>
                </tr>
              </table>
            </div>
            <div id="legalcopy">
              <p class="legal"><strong>Thank you.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { uri } = await printAsync({
      html: htmlContent,
      width: 612,
      height: 792,
      base64: true
    });

    const imageUri = await convertToImage(uri);
    saveImageToGallery(imageUri);
  };



  const convertToImage = async (pdfUri) => {
    // This function needs to be implemented based on your specific requirements
    // For example, using a server-side service to convert PDF to JPG
    return pdfUri; // Placeholder
  };

  const saveImageToGallery = async (imageUri) => {
    const asset = await MediaLibrary.createAssetAsync(imageUri);
    await MediaLibrary.createAlbumAsync("Download", asset, false);
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
    console.log(order);
    navigation.navigate("EditBestelling", { order: order });
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(
        `http://208.109.231.135/orders/${orderId}`
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
      let patchUrl = `http://208.109.231.135/orders/${orderId}/${newStatus}`;
      const response = await axios.patch(patchUrl);
      if (response.status === 200) {
        // Call fetchOrders to refresh the list after status change
        fetchOrders();

        // Optionally, handle any additional logic with the response data
        // For example, if you need to check for low stock products as in the original function
        if (response.data.lowStockProducts && response.data.lowStockProducts.length > 0) {
          // Display an alert or some form of notification to the user
          alert('Some products are running low on stock!');

          // Optionally, list the products that are low on stock
          response.data.lowStockProducts.forEach(product => {
            console.log(`Product ${product.name} is low on stock. Only ${product.qty} left.`);
          });
        }

        console.log('Order status updated:', response.data.updatedOrder);
      } else {
        throw new Error("Status bijwerken mislukt.");
      }
    } catch (error) {
      console.error("Fout tijdens bijwerken status:", error);
      Alert.alert("Fout", error.message || "Status bijwerken mislukt.");
    }
  };



  const showStatusOptions = (orderId, currentStatus) => {
    let newStatus = currentStatus === "unprocessed" ? "processed" : "paid";
    Alert.alert(
      "Status aanpassen",
      `Bestelling markeren als ${newStatus === "processed" ? "Afgehandeld" : "Betaald"
      }?`,
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
    <View style={styles.container} nestedScrollEnabled={false}>
      <SafeAreaView style={styles.safeArea}>
        <Header name="Bestellingen" />
      </SafeAreaView>

      <ScrollView nestedScrollEnabled={true}>
        <View style={[styles.mainContent, { marginBottom: 70 }]}>
          <Text style={styles.screendescription}>
            Bekijk hier alle geplaatste bestellingen. "Niet afgehandeld" moet
            nog verwerkt worden. Nadat bestelling is afgehandeld: druk op
            'Afhandelen'. Nadat bestelling is betaald: druk op 'Betaald'.
          </Text>
          <View style={{ flex: 1 }}>
            <FlatList
              scrollEnabled={false}
              ref={flatListRef}
              data={orders}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <View style={styles.centerSingleItem}>
                    <Text style={styles.orderId}>Tafel {item.table}</Text>

                    <Text style={[styles.orderDetail, { fontSize: 18 }]}>
                      {new Date(item.orderDate).toDateString() ===
                        new Date().toDateString()
                        ? new Date(item.orderDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false, // Add this option to use 24-hour format
                        })
                        : new Date(item.orderDate).toLocaleDateString("nl", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                    </Text>
                  </View>
                  <View style={styles.spaceBetweenRow}>
                    <Text>&nbsp;</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        marginBottom: 5,
                        fontWeight: "bold",
                        color:
                          item.status === "unprocessed"
                            ? "red"
                            : item.status === "processed"
                              ? "orange"
                              : "#4a9c3a",
                      }}
                    >
                      {item.status === "unprocessed"
                        ? "NIET AFGEHANDELD"
                        : item.status === "processed"
                          ? "AFGEHANDELD"
                          : "BETAALD"}
                    </Text>
                  </View>
                  <View style={styles.productCards}>
                    {item.products.map((product, index) => (
                      <View key={index} style={styles.productItem}>
                        <View style={styles.spaceBetweenRow}>
                          <Text
                            style={[styles.productDetail, { fontWeight: 600 }]}
                          >
                            {index + 1}. {product.name}
                          </Text>
                          <Text
                            style={[styles.productDetail, { fontWeight: 600 }]}
                          >
                            SRD {product.price.toFixed(2)}
                          </Text>
                        </View>
                        {product.selectedOptions.map((option, index) => (
                          <View
                            key={index}
                            style={[styles.spaceBetweenRow, styles.option]}
                          >
                            <Text
                              style={[styles.optionText, { color: "grey" }]}
                            >
                              + {option.name}
                            </Text>
                            <Text
                              style={[styles.optionText, { color: "grey" }]}
                            >
                              SRD {option.price.toFixed(2)}
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

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "#eee",
                      padding: 8,
                      marginBottom: 15,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 600 }}>
                      Totaal:
                    </Text>
                    <View>
                      <Text style={styles.price}>
                        SRD {item.totalPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {item.notes && (
                    <View style={styles.notes}>
                      <Text>Notities:</Text>
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
                          <Icon name="edit" size={18} color="white" />
                          <Text style={{ color: "white", marginLeft: 5 }}>
                            Bewerken
                          </Text>
                        </TouchableOpacity>
                      )}

                      {item.status !== "paid" && (
                        <TouchableOpacity
                          style={styles.statusButton}
                          onPress={() =>
                            showStatusOptions(item._id, item.status)
                          }
                        >
                          <Icon name="arrow-right" size={18} color="#fff" />
                          <Text style={{ color: "white", marginLeft: 5 }}>
                            {item.status === "unprocessed"
                              ? "Afhandelen"
                              : "Betaald"}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {item.status !== "paid" &&
                        item.status !== "processed" && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteOrder(item._id)}
                          >
                            <Icon name="trash" size={18} color="white" />
                          </TouchableOpacity>
                        )}
                      <TouchableOpacity
                        style={styles.receiptButton}
                        onPress={() => generateReceipt(item)}
                      >
                        <Icon name="file-alt" size={18} color="white" />
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>

      <FloatingButton />
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
    marginBottom: 25,
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
    fontSize: 14,
  },
  statusButton: {
    padding: 10,
    backgroundColor: "#4a9c3a",
    borderRadius: 5,
    marginRight: 5,
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
    fontSize: 14,
    fontWeight: "bold",
  },
  centerSingleItem: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productCards: {
    marginTop: 10,
    marginBottom: 20,
  },
  deleteButton: {
    padding: 11,
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
    width: "auto",
    padding: 10,
    backgroundColor: "#e27b00", // You can choose a different color
    borderRadius: 5,
    marginRight: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "center",
  },
  option: {
    paddingLeft: 20,
  },
  optionText: {
    fontSize: 13,
    textTransform: "capitalize",
  },
  notes: {
    marginBottom: 10,
  },
  receiptButton: {
    marginLeft: 4,
    padding: 10.75,
    backgroundColor: "#007bff", // Set to a blue color
    borderRadius: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  }
});