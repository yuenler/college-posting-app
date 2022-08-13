/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  View, Platform, StatusBar, Alert, Appearance,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import 'firebase/compat/database';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import LoadDataScreen from './components/screens/LoadData.Screen';
import ApiKeys from './ApiKeys';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';
import { LiveUserSpecificPost } from './types/Post';
import globalStyles from './globalStyles';
import { ThemeProvider, useTheme } from './ThemeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

declare global {
  var user: any;
  var posts: LiveUserSpecificPost[];
  var archive: LiveUserSpecificPost[];
  var starred: LiveUserSpecificPost[];
  var ownPosts: LiveUserSpecificPost[];
  var latitude: number;
  var longitude: number;
}

export default function App() {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedForUpdates, setCheckedForUpdates] = useState(false);

  const onAuthStateChanged = (user: any) => {
    setIsAuthenticationReady(true);
    if (!user) {
      setIsAuthenticated(false);
    }
    if (user) {
      const idxHarvard = user.email.indexOf('harvard.edu');
      if (idxHarvard === -1 && user.email !== 'theofficialbhsapptesting@gmail.com' && user.email !== 'cykai168@gmail.com' && user.email !== 'tlkm4sh@gmail.com') {
        Alert.alert(
          '',
          'Please sign in using your Harvard email address!',
          [
            { text: 'Ok', onPress: () => firebase.auth().signOut() },
          ],
          { cancelable: false },
        );
      } else {
        setIsAuthenticated(true);
        global.user = user;
        firebase.database().ref(`/users/${user.uid}`).set({
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
        });
        registerForPushNotificationsAsync().then((pushNotificationToken) => firebase.database().ref(`/users/${user.uid}`).update({
          pushNotificationToken,
        }));
      }
    }
  };

  if (!firebase.apps.length) {
    const app = firebase.initializeApp(ApiKeys.FirebaseConfig);
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  const loadFonts = async () => {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      Montserrat: require('./assets/Montserrat-Regular.ttf'),
      MontserratBold: require('./assets/Montserrat-Bold.ttf'),
    });
    setIsLoadingComplete(true);
  };

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Alert.alert('There is an update available!', 'Wado is restarting to apply this update.');
        Updates.reloadAsync();
      }
    } catch (e) {
      // handle or log error
    }
    setCheckedForUpdates(true);
  };

  useEffect(() => {
    checkForUpdates();
    loadFonts();
  }, []);

  if (!isLoadingComplete || !(isAuthenticationReady || isAuthenticated) || !checkedForUpdates) {
    return (
      null
    );
  }
  return (
    <ThemeProvider>
      <NavigationContainer>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          {(isAuthenticated) ? <LoadDataScreen /> : <NotLoggedInNavigator />}
        </View>
      </NavigationContainer>
    </ThemeProvider>

  );
}
