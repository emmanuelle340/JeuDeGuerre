import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

// Configurer Google Sign-In
GoogleSignin.configure({
  webClientId: '1003020346357-pmkmmhl9ajmgupkq6noloovv07b6l93n.apps.googleusercontent.com',
});

// Fonction pour stocker des données dans AsyncStorage
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`Data stored successfully for key: ${key}`);
  } catch (e) {
    console.error('Failed to store data', e);
  }
};

// Fonction pour récupérer des données depuis AsyncStorage
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch data', e);
  }
};

async function onGoogleButtonPress(setProfile) {
  try {
    // Vérifier si le dispositif supporte Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Obtenir le token ID de l'utilisateur
    const { idToken, user } = await GoogleSignin.signIn();

    // Créer une credential Google avec le token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Connecter l'utilisateur avec la credential
    await auth().signInWithCredential(googleCredential);

    // Enregistrer le profil utilisateur
    const profile = {
      name: user.name,
      Email: user.email,
      photo: user.photo
    };
    setProfile(profile);
    await storeData("userProfile", profile); // Stocker le profil dans AsyncStorage

    // Vérifier si la collection "Players" existe dans Firestore
    const playersCollectionRef = firestore().collection("Players");
    

    // Vérifier si l'utilisateur existe dans la base de données Firestore
    const userDoc = await playersCollectionRef.doc(profile.Email).get();
    if (!userDoc.exists) {
      // Si l'utilisateur n'existe pas, l'ajouter à la base de données
      await playersCollectionRef.doc(profile.Email).set({
        userEmail: profile.name,
        userPicture: profile.photo,
      });
    }

    console.log('User Profile:', profile);
    return profile;
  } catch (error) {
    console.error(error);
  }
}



const Home = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  // Charger le profil utilisateur au chargement de la page
  const loadUserProfile = async () => {
    const storedProfile = await getData('userProfile');
    if (storedProfile) {
      console.log('Loaded User Profile:', storedProfile);
      setProfile(storedProfile);
      navigation.navigate('Session');
    } else {
      console.log('No user profile found');
    }
  };

  // Charger le profil utilisateur une seule fois lors du montage du composant
  useEffect(() => {
    loadUserProfile();
  }, []);

  

  return (
    <View>

      <GoogleSignInButton onPress={() => onGoogleButtonPress(setProfile).then(() => console.log('Signed in with Google!'))} />
    </View>
  );
};

// Composant de bouton pour la connexion Google
const GoogleSignInButton = ({ onPress }) => (
  <Button
    title="Google Sign-In"
    onPress={onPress}
  />
);

export default Home;