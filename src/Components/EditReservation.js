import React, { useState } from 'react';
import { View, Text, TextInput,ScrollView,Button, StyleSheet, Alert, Platform,TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const EditReservation = ({ route, navigation }) => {
  const reservation = route.params?.reservation;

  if (!reservation) {
    Alert.alert('Error', 'No reservation data provided.');
    navigation.goBack();
    return null;
  }

  const [name, setName] = useState(reservation.name);
  const [phone, setPhone] = useState(reservation.phone);
  const [date, setDate] = useState(new Date(reservation.dateTime));
  const [time, setTime] = useState(new Date(reservation.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [numGuests, setNumGuests] = useState(reservation.numGuests.toString());
  const [notes, setNotes] = useState(reservation.notes);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const handleSave = async () => {
    console.log('Save button pressed');
    try {
      const dateTime = new Date(date);
      const [hours, minutes] = time.split(':');
      dateTime.setHours(parseInt(hours, 10));
      dateTime.setMinutes(parseInt(minutes, 10));

      const updatedReservation = {
        name,
        phone,
        dateTime,
        numGuests: parseInt(numGuests, 10),
        notes,
      };

      console.log('Attempting to save:', updatedReservation);

      const response = await axios.patch(`https://nl-app.onrender.com/reservations/${reservation._id}`, updatedReservation);

      console.log('Save successful:', response.data);
      Alert.alert('Success', 'Reservation updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save changes:', error);
      Alert.alert('Error', 'Could not update the reservation');
    }
  };
  // Render the form with the state variables and handleSave function
  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter guest name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Guests:</Text>
        <TextInput
          style={styles.input}
          value={numGuests}
          onChangeText={setNumGuests}
          placeholder="Enter number of guests"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes:</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter any notes"
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity onPress={showTimepicker} style={styles.input}>
          <Text style={styles.input}>{time}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={date}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}
      </View>
      <Button title="SaveChanges" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  // Add any additional styles you may need here
});

export default EditReservation;
