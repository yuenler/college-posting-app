import React, { useState } from "react"; 
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';import user from "../User";
import { Button, StyleSheet, Modal, View, TextInput, Dimensions, TouchableOpcaity, Text, Alert} from "react-native"; 
import { TouchableOpacity } from "react-native-gesture-handler";
import formatTime from '../../FormatTime'
import {globalStyles} from '../GlobalStyles';

export default class CreateAnnouncementsScreen extends React.Component {
	storeText(title, text) {
		let today = formatTime()
		firebase
		  .database()
		  .ref('Announcements')
		  .push({
			postTitle: title,
			postDate: today,
			post: text,
			postUID: user.uid
		  });
		  Alert.alert('You post has been successfully published!')
	  }

	handlePost(title, text){
		this.storeText(title, text)
		this.props.navigation.navigate('Announcements')
	}
	  

	state = {
        title: "",
        text: ""
	};

	render() {
	return ( 
		<View style={globalStyles.container}> 
			<View style={{alignItems: 'center'}}>
				<TextInput placeholder="Announcement title (25 char limit)"
						style={styles.textInput} 
						onChangeText={title => this.setState({ title })}
          				value={this.state.title} 
						maxLength={25}
						  /> 
				<TextInput placeholder="Describe your announcement... (250 char limit)"
						multiline
						style={styles.textInput} 
						onChangeText={text => this.setState({ text })}
						  value={this.state.text}
						  maxLength={250}
						   /> 
			<TouchableOpacity style = {styles.button} onPress = {() => {
					Alert.alert(
						"Are you sure you want to post?",
						"If you continue, your post, along with your full name and the date/time you post on, will be publicly viewable by everyone who has downloaded this app. You will not be able to delete it. By continuing, you acknowledge that your post is relevant and appropriate for the Brookline High School community. If our team deems that your post does not satisfy these conditions, we reserve the right to remove your post from our app. ",
						[
						  {
							text: "Cancel",
							style: "cancel"
						  },
						  { text: "Continue", onPress: () => this.handlePost(this.state.title, this.state.text)}
						],
						{ cancelable: false }
					  );

					
				}}>
					<Text style={globalStyles.buttonText}>Post</Text>
			</TouchableOpacity>
			</View>
		</View> 
	); 
} 
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
		borderRadius: 10, 
		paddingVertical: 8, 
		paddingHorizontal: 16, 
		borderColor: "rgba(0, 0, 0, 0.2)", 
		borderWidth: 1, 
		marginBottom: 8, 
		backgroundColor: '#FFF'
	}, 
	button: {
		backgroundColor: '#871609',
		padding: 10,
		paddingHorizontal: 30,
		alignItems: "center", 
		borderRadius: 10,
	},
	/*buttonText: {
		fontSize: 20,
		color: '#fff',
		fontFamily: 'Red Hat Display'
	},*/
});
