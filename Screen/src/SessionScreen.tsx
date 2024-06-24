import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GlobaleVariable from '../../GlobaleVariable';

const Session = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [userName, setUserName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    // Récupérer l'URL de la photo lors de la première charge du composant
    const fetchImageUrl = async () => {
      const storedProfile = await getData('userProfile');
      if (storedProfile && storedProfile.photo) {
        setImageUrl(storedProfile.photo);
        setUserName(storedProfile.name)
      }
    };

    fetchImageUrl();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const handleLeaveGame = async () => {
        try {
          const gamesCollection = firestore().collection('Games');
          const querySnapshot = await gamesCollection.get();
          const storedProfile = await getData("userProfile");
          const deviceId = storedProfile.Email;
          let deviceRemoved = false;

          for (const doc of querySnapshot.docs) {
            const gameData = doc.data();

            if (gameData.GameParticipantDeviceId && gameData.GameParticipantDeviceId.includes(deviceId)) {
              await doc.ref.update({
                GameParticipantDeviceId: firestore.FieldValue.arrayRemove(deviceId),
              });
              deviceRemoved = true;
            }
            // if(gameData.CreatedBy && gameData.CreatedBy.includes(getData("userProfile").name){

            // }
          }

          if (deviceRemoved) {
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'You have left the game!',
            });
          } else {
            //console.log("je suis ici ohhh")
          }
        } catch (error) {
          console.error("Error leaving game: ", error);
          console.log('An error occurred while trying to leave the game.')
        }
      };

      handleLeaveGame();

      // Optionally, return a cleanup function if needed
      return () => {
        // cleanup if necessary
      };
    }, [])
  );



  const handleCreateGame = () => {
    // Logique pour créer une partie
    createGame();

  };

  const handleJoinGame = () => {
    // Logique pour rejoindre une partie
    navigation.navigate("Liste");
  };

  const handleCreateSoloGame = () => {
    navigation.navigate("PageDeJeu");
  };

  const generateRandomName = () => {
    const firstWords = [
      "Chat", "Pizza", "Montagne", "Jungle", "Aventure",
      "Secret", "Super", "Cosmique", "Galaxie",
    ];
    const secondWords = [
      "Rapide", "Glace", "Magique", "Infini", "Mystère",
      "Légendaire", "Explorateur", "Sauvage", "Ninja",
    ];
  
    const firstWord = firstWords[Math.floor(Math.random() * firstWords.length)];
    const secondWord = secondWords[Math.floor(Math.random() * secondWords.length)];
  
    return `${firstWord}${secondWord}`;
  };

  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  const createGame = async () => {
    try {
      const storedProfile = await getData('userProfile');
      const gameRef = await firestore().collection("Games").add({
        createdBy: storedProfile.Email,
        gameStatus: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        GameParticipantDeviceId: [storedProfile.Email],
        gameName: generateRandomName(),
      });
      GlobaleVariable.globalString = gameRef.id;
      navigation.navigate("Attente",{gameId: gameRef.id});
      console.log(`Game created with ID: ${gameRef.id}`);
    } catch (error) {
      console.error("Error creating game: ", error);
    }
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <Text>Loading image...</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateGame}>
        <Text style={styles.buttonText}>Créer une partie en ligne</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
        <Text style={styles.buttonText}>Rejoindre une partie en ligne</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCreateSoloGame}>
        <Text style={styles.buttonText}>Jouer en locale</Text>
      </TouchableOpacity>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 200,
  },
});

export default Session;
