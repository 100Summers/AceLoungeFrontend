// @AceLoungeFrontend\src\Components\Omzetcijfers.js

import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import axios from "axios";

const Omzetcijfers = () => {
  const [dailyRevenue, setDailyRevenue] = useState([]);

  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        const response = await axios.get(
          "http://208.109.231.135/orders/revenue/daily"
        );
        const validData = response.data.filter((item) => {
          return item.totalRevenue !== null && isFinite(item.totalRevenue);
        });
        setDailyRevenue(validData);
      } catch (error) {
        console.error("Error fetching daily revenue:", error);
      }
    };

    fetchDailyRevenue();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: "#e27b00",
      fill: "#e27b00",
    },
  };

  const screenWidth = Dimensions.get("window").width;

  const data = {
    labels: dailyRevenue.map((revenue) => revenue._id || "N/A"),
    datasets: [
      {
        data: dailyRevenue.map((revenue) => {
          const revenueValue = Number(revenue.totalRevenue);
          return isNaN(revenueValue) ? 0 : revenueValue;
        }),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Omzet per dag</Text>
      {dailyRevenue.length > 0 ? (
        <BarChart
          data={data}
          width={screenWidth}
          height={250}
          fromZero
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>Geen data beschikbaar.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e0d5d6",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 0,
  },
  noDataText: {
    fontSize: 18,
    color: "#666",
  },
});

export default Omzetcijfers;
