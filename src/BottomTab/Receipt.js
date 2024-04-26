import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const Receipt = ({ route }) => {
  const { order } = route.params;
  const viewShotRef = useRef(null);

  const saveReceipt = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to save the receipt.');
        return;
      }

      const uri = await viewShotRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Receipts', asset, false);
      Alert.alert('Success', 'Receipt saved to your photo library.');
    } catch (error) {
      Alert.alert('Error', `An error occurred while saving the receipt: ${error.message}`);
    }
  };

  const productMap = {};
  order.products.forEach((product) => {
    if (productMap[product.name]) {
      productMap[product.name].quantity += 1;
      productMap[product.name].subtotal += product.price;
    } else {
      productMap[product.name] = {
        price: product.price,
        quantity: 1,
        subtotal: product.price,
      };
    }
  });

  return (
    <View style={styles.container}>
      {/* Add padding to ViewShot */}
      <ViewShot ref={viewShotRef} style={styles.viewShot} options={{ format: 'jpeg', quality: 1 }}>
        {/* Inner container with additional padding */}
        <View style={styles.content}>
          <View style={styles.top}>
            <Image source={require('../../assets/AceLogo.png')} style={styles.logo} />
            <Text style={styles.h2}>AceLounge</Text>
            <Text style={styles.p}>Contact Us</Text>
            <Text style={styles.p}>Address: Street, City, State 00000</Text>
            <Text style={styles.p}>Email: info@acelounge.com</Text>
            <Text style={styles.p}>Phone: 555-555-5555</Text>
            
            <View style={styles.space}></View>

            <View style={styles.headerRow}>
              <Text style={[styles.header, styles.itemHeader]}>Item</Text>
              <Text style={[styles.header, styles.qtyHeader]}>Qty</Text>
              <Text style={[styles.header, styles.subtotalHeader]}>Sub Total</Text>
            </View>
          </View>

          <View style={styles.bot}>
            {Object.keys(productMap).map((key) => (
              <View style={styles.tableRow} key={key}>
                <Text style={[styles.itemText, styles.itemData]}>{key}</Text>
                <Text style={[styles.itemText, styles.qtyData]}>{productMap[key].quantity}</Text>
                <Text style={[styles.itemText, styles.subtotalData]}>{`$${productMap[key].subtotal.toFixed(2)}`}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.total}>Total</Text>
              <Text style={[styles.total, styles.totalAmount]}>{`$${order.totalPrice.toFixed(2)}`}</Text>
            </View>

            <Text style={styles.legal}>
              <Text style={styles.strong}>Thank you for your business!</Text> Payment is expected within 31 days. There will be a 5% interest charge per month on late invoices.
            </Text>
          </View>
        </View>
      </ViewShot>

      <Button title="Save Receipt" onPress={saveReceipt} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    width: '100%',
  },
  viewShot: {
    padding: 30, // Add padding around the entire ViewShot
  },
  content: {
    backgroundColor: '#fff',
    padding: 20, // Add additional padding inside the content
  },
  top: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  logo: {
    height: 40,
    width: 40,
    marginBottom: 10,
  },
  h2: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  p: {
    fontSize: 10,
  },
  space: {
    height: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemHeader: {
    flex: 3,
    textAlign: 'left',
  },
  qtyHeader: {
    flex: 1,
    textAlign: 'center',
  },
  subtotalHeader: {
    flex: 2,
    textAlign: 'right',
  },
  bot: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 10,
  },
  itemData: {
    flex: 3,
    textAlign: 'left',
  },
  qtyData: {
    flex: 1,
    textAlign: 'center',
  },
  subtotalData: {
    flex: 2,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  total: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  legal: {
    fontSize: 8,
    marginTop: 10,
  },
  strong: {
    fontWeight: 'bold',
  },
});

export default Receipt;
