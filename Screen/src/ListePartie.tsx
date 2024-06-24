import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore, {doc} from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobaleVariable from '../../GlobaleVariable';

const ListeDesParties = () => {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("Games")
      .where("gameStatus", "==", false)
      .onSnapshot((snapshot) => {
        const gamesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          nom: doc.data().gameName,
          createur: doc.data().createdBy,
        }));
        setParties(gamesData);
      });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleLeaveGame = async () => {
      try {

        const gamesCollection = firestore().collection('Games');
        const querySnapshot = await gamesCollection.get();
        const deviceId = await getData("userProfile")
  
        let deviceRemoved = false;
  
        for (const doc of querySnapshot.docs) {
          const gameData = doc.data();
  
          if (gameData.GameParticipantDeviceId && gameData.GameParticipantDeviceId.includes(deviceId)) {
            await doc.ref.update({
              GameParticipantDeviceId: firestore.FieldValue.arrayRemove(deviceId),
            });
            deviceRemoved = true;
          }
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
  }, []); 


  const addParticipantsGame = async (docId) => {
    try {
      const docRef = firestore().collection("Games").doc(docId);
      const docSnapshot = await docRef.get();
      const storedProfile = await getData("userProfile");
      if (docSnapshot.exists) {
        await docRef.update({
          GameParticipantDeviceId: firestore.FieldValue.arrayUnion(storedProfile.Email),
        });

        console.log(
          `Element '${storedProfile.Email}' added to attribute 'GameParticipantDeviceId' in document with ID '${docId}'.`
        );

        GlobaleVariable.globalString= docId;
        // Naviguer vers la page "Attente" avec l'ID de la partie en paramètre
        navigation.navigate('Attente', { gameId: docId });

      } else {
        console.log(`Document with ID '${docId}' does not exist.`);
      }
    } catch (error) {
      console.error("Error updating or adding attribute to document: ", error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        addParticipantsGame(item.id);
      }}
    >
      <Text style={styles.itemText}>Nom de la partie: {item.nom}</Text>
      <Text style={styles.itemText}>Créateur: {item.createur}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Parties</Text>
      <FlatList
        data={parties}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
  },
});

export default ListeDesParties;
