import React, { useState } from "react"; 
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {StyleSheet, View, ScrollView, Text, Alert} from "react-native"; 
import { TouchableOpacity } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';
import { Input, Icon } from '@rneui/themed';
import {Button} from '@rneui/base';
import DateTimePicker from '@react-native-community/datetimepicker';
import {globalStyles} from '../GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';



  
export default function CreatePostScreen({navigation}) {

	const[screen, setScreen] = useState(1);

	const [openCategory, setOpenCategory] = useState(false);
	const [valueCategory, setValueCategory] = useState(null);
	const [itemsCategory, setItemsCategory] = useState([
		{label: 'Food',
		value: 'food',
		icon: () => <Icon name="food-fork-drink" type = 'material-community'/>

		},
		{label: 'Performance',
		value: 'performance',
		icon: () => <Icon name="music" type = 'font-awesome'/>

	},
		{label: 'Social',
		value: 'social',
		icon: () => <Icon name="user-friends" type = 'font-awesome-5'/>
	},
		{label: 'Academic',
		value: 'academic',
		icon: () => <Icon name="book" type = 'entypo'/>
	},
		{label: 'Athletic',
		value: 'athletic',
		icon: () => <Icon name="running" type = 'font-awesome-5'/>
	},

	]);

	const [text, setText] = useState('');
	const [title, setTitle] = useState('');
	const [startDate, setStartDate] = useState(formatDate(new Date()));
	const [endDate, setEndDate] = useState(formatDate(new Date()));
	const [startTime, setStartTime] = useState(formatTime(new Date()));
	const [endTime, setEndTime] = useState(formatTime(new Date()));
	const [locationDescription, setLocationDescription] = useState('');
	const [link, setLink] = useState('');
	const [canArriveDuring, setCanArriveDuring] = useState(true);
	const [isStart, setIsStart] = useState(true);
	const [show, setShow] = useState(false);
	const [mode, setMode] = useState('time')
	const [address, setAddress] = useState('')
	const [latitude, setLatitude] = useState(null)
	const [longitude, setLongitude] = useState(null)
	const [postalAddress, setPostalAddress] = useState(null)

	const getUser = async () => {
		try {
		const value = await AsyncStorage.getItem('@user')
		if(value !== null) {
			return value;
		}
		} catch(e) {
			console.log(e);
		}
	}
  

	async function storeText() {
		var user = await getUser();
		firebase
		  .database()
		  .ref('Posts')
		  .push({
			author: user,
			title: title,
			startDate: startDate,
			endDate: endDate,
			startTime: startTime,
			endTime: endTime,
			post: text,
			link: link,
			latitude: latitude,
			longitude: longitude,
			locationDescription: locationDescription,
			category: valueCategory,
			canArriveDuring: canArriveDuring,
		  });
		  Alert.alert('Your post has been successfully published!')
	  }
	
	  function handlePost(){
			storeText()
			navigation.navigate('Posts')
	}

	function verifyFieldsFilled(){
		if (screen == 1){
			if (valueCategory == null){
				Alert.alert('Please select a category.')
			}
			else{
				setScreen(2)
			}
		}
		else if (screen == 2){
			if (latitude == null || longitude == null){
				Alert.alert('Please search for a location.')
			}
			else{
				setScreen(3)
			}
		}
		else if (screen == 3){
			if (startDate == null || endDate == null || startTime == null || endTime == null){
				Alert.alert('Please provide start and end dates/times for your post.')
			}
			else if (canArriveDuring == null){
				Alert.alert('Please specify whether people can arrive to your event during your specified time range.')
			}
			else {
				setScreen(4)
			}
		}
		else if (screen == 4){
			if (title == ''){
				Alert.alert('All posts need a title')
			}
			else if (locationDescription == ''){
				Alert.alert('Please describe where your post is located.')
			}
			else{
				Alert.alert(
					"Confirmation",
					"Press continue if you are sure.",
					[
						{
						text: "Cancel",
						style: "cancel"
						},
						{ text: "Continue", onPress: () => handlePost()}
					],
					{ cancelable: false }
					);
			}
		}
		else {
			console.log('Invalid Screen')
		}

	}

	
	const changeDateTime = (event, selectedDate) => {
		const currentDateTime = selectedDate;
		setShow(false);
		if (event.type == 'set'){
			if (mode == 'date'){
				if (isStart){
					setStartDate(formatDate(currentDateTime));
				}
				else{
					setEndDate(formatDate(currentDateTime));
				}

			}
			else if (mode == 'time'){
				if (isStart){
					setStartTime(formatTime(currentDateTime));
				}
				else{
					setEndTime(formatTime(currentDateTime));
				}
			}
			else {
				console.log('Invalid mode')
			}
		}
		
	  };

	  const showMode = (currentMode, isStart) => {
		setShow(true);
		setIsStart(isStart);
		setMode(currentMode);
	  };

	  function formatDate(day) {
		var dd = String(day.getDate()).padStart(2, '0');
		var mm = String(day.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = day.getFullYear();

        return mm + '/' + dd + '/' + yyyy;;
	}

	function formatTime(day) {
		var hh = day.getHours();
		var min = day.getMinutes();
		var ampm = "AM";
		if (hh > 12){
			hh -= 12;
			ampm = "PM";
		}
		if (min < 10){
			min = "0" + min
		}

		day = hh + ":" + min + " " + ampm;
        return day;
	}
	
	async function search(){
		var coordinates = await Location.geocodeAsync(address)
		if (coordinates[0] == undefined){
			coordinates = await Location.geocodeAsync(address + " Harvard, Cambridge MA")
		}


		if (coordinates[0] != undefined){
			setLatitude(coordinates[0].latitude)
			setLongitude(coordinates[0].longitude)
			var addy = await Location.reverseGeocodeAsync(coordinates[0])
			if (addy != undefined){
				setPostalAddress(addy[0].streetNumber + ' ' + addy[0].street + ' ' + addy[0].city + ', ' + addy[0].region + ' ' + addy[0].country + ' ' + addy[0].postalCode)
			}
			else{
				setPostalAddress('We found coordinates for your search, but we are unsure what the postal address is.')
			}
		}
		else{
			setLatitude(null)
			setLongitude(null)
			setPostalAddress('Location not found.')
		}
	}
	
	if(screen == 1){
		return(

			<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>

				<Text style={styles.question}>Which of the following categories best describe your post?</Text>

				<DropDownPicker
					containerStyle={{
						marginTop: '10%'
					}}
					open={openCategory}
					value={valueCategory}
					items={itemsCategory}
					setOpen={setOpenCategory}
					setValue={setValueCategory}
					setItems={setItemsCategory}
					
					/>

				</View>

				<View style={{height: 100}}>
					<Button onPress = {() => verifyFieldsFilled()} title="Next" />
				</View>
				

				</View>
			</View>	
			
		);

	}

	if (screen == 2){
		return(
		<ScrollView style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Where is the location of your post?</Text>

				<Input 
				// label = ''
				placeholder="Pforzheimer House"
						style={styles.textInput} 
						onChangeText={address => setAddress(address)}
          				value={address} 
						// maxLength={25}
				/> 

				<View>
				<Button
				title="Search"
				onPress={() => search()}
				/>
				</View>


				<View style={{marginVertical: 20}}>
				<Text style={styles.postalAddress}>{postalAddress}</Text>
				</View>
				</View>
				<View style={{height: 50}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(1)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => verifyFieldsFilled()} title="Next" />
					</View>
	
				</View>
				</View>
				

				</View>
			</ScrollView>	
		
		);
	}
	
	if (screen == 3){
		return (
			<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Start Date and Time</Text>

				<Text onPress={() => showMode('date', true)} >{startDate}</Text>

				<Text onPress={() => showMode('time', true)}>{startTime}</Text>

				
				<Text style={styles.question}>End Date and Time</Text>

				<Text onPress={() => showMode('date', false)}>{endDate}</Text>
				<Text onPress={() => showMode('time', false)}>{endTime}</Text>

				{ show?				
				<DateTimePicker
					mode={mode}
					value = {new Date()}
					onChange={(event, date) => changeDateTime(event, date)}
				/>
				: null
				}
			

				
				</View>

				<View style={{height: 100}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(2)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => verifyFieldsFilled()} title="Next" />
					</View>
	
				</View>
				</View>
				

				</View>
			</View>	
			
		);
	}

	return ( 
		<View style={globalStyles.container}> 
			
			<ScrollView style={{marginVertical: '10%', marginHorizontal: '5%', flex: 1}}>

				<Input 
				label = 'Title'
				placeholder="Free sushi"
						style={styles.textInput} 
						onChangeText={title => setTitle(title)}
          				value={title} 
						maxLength={25}
				/> 

					<Input
					label = "Specific location description"
					onChangeText={locationDescription => setLocationDescription(locationDescription)}
					placeholder='Science Center Room 206'
					leftIcon={
						<Icon
						name='location'
						type = 'entypo'
						size={24}
						color='black'
						/>
					}
					/>

				
				<Input 
						label = "Description"
						placeholder="Free sushi if you attend this club meeting!"

						multiline
						style={styles.textInput} 
						onChangeText={text => setText(text)}
						  value={text}
						  maxLength={250}
					/> 


				<Input
					label = "Website link"
					placeholder='https://example.com'
					onChangeText={link => setLink(link)}

					leftIcon={
						<Icon
						name='web'
						size={24}
						color='black'
						/>
					}
					/>
			
			<View style={{height: 100}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(3)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button title="Post"
					onPress = {() => verifyFieldsFilled()}
					
					/>
					</View>
	
				</View>
				</View>

			
			</ScrollView>

		</View> 
	); 

}

// These are user defined styles 
const styles = StyleSheet.create({ 
	container: { 
		flex: 1, 
		alignItems: "center", 
		justifyContent: "center", 
		backgroundColor: "#ededed", 
	}, 
	textInput: { 
		width: "80%", 
		// borderRadius: 10, 
		// paddingVertical: 8, 
		// paddingHorizontal: 16, 
		// borderColor: "rgba(0, 0, 0, 0.2)", 
		// borderWidth: 1, 
		// marginBottom: 8, 
		// backgroundColor: '#FFF'
	}, 
	button: {
		backgroundColor: '#871609',
		padding: 10,
		paddingHorizontal: 30,
		alignItems: "center", 
		borderRadius: 10,
	},
	question: {
		fontSize: 20,
		fontFamily: 'Montserrat',
		textAlign: 'center'
	},
	postalAddress: {
		fontSize: 15,
		fontFamily: 'Montserrat',
	}
});
