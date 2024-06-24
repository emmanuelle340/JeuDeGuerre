import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

GoogleSignin.configure({
  webClientId: '1003020346357-pmkmmhl9ajmgupkq6noloovv07b6l93n.apps.googleusercontent.com',
});

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`Data stored successfully for key: ${key}`);
  } catch (e) {
    console.error('Failed to store data', e);
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch data', e);
  }
};

const Home = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  const loadUserProfile = async () => {
    const storedProfile = await getData('userProfile');
    if (storedProfile) {
      const playersCollectionRef = firestore().collection("Players");
      const userDoc = await playersCollectionRef.doc(storedProfile.Email).get();
      if (userDoc.exists) {
        console.log('Loaded User Profile:', storedProfile);
        setProfile(storedProfile);
        navigation.navigate('Session');
      } else {
        console.log('User not found in Firestore');
      }
    } else {
      console.log('No user profile found');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken, user } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      
      const profile = {
        name: user.name,
        Email: user.email,
        photo: user.photo
      };
      setProfile(profile);
      await storeData("userProfile", profile);
      
      const playersCollectionRef = firestore().collection("Players");
      const userDoc = await playersCollectionRef.doc(profile.Email).get();
      if (!userDoc.exists) {
        await playersCollectionRef.doc(profile.Email).set({
          userName: profile.name,
          userPicture: profile.photo,
        });
      }
      
      console.log('User Profile:', profile);
      navigation.navigate('Session');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <GoogleSignInButton onPress={onGoogleButtonPress} />
    </View>
  );
};

const GoogleSignInButton = ({ onPress }) => (
  <Button
    title="Google Sign-In"
    onPress={onPress}
  />
);

export default Home;
