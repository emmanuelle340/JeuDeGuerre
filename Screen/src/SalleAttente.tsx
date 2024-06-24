import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import GlobaleVariable from "../../GlobaleVariable";
import { useNavigation } from "@react-navigation/native";

const SalleAttente = ({ gameId }) => {
  const [gameName, setGameName] = useState("");
  const [participantsCount, setParticipantsCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const gamesRef = firestore().collection("Games").doc(GlobaleVariable.globalString);

    // Observer les changements du document pour mettre à jour le nombre de participants
    const unsubscribe = gamesRef.onSnapshot((doc) => {
      if (doc.exists) {
        const gameData = doc.data();
        setGameName(gameData.gameName);

        // Mettre à jour le nombre de participants
        if (gameData.GameParticipantDeviceId) {
          setParticipantsCount(gameData.GameParticipantDeviceId.length);
        }
        
        // Vérifier la condition pour mettre à jour le statut du jeu
        if (gameData.GameParticipantDeviceId && gameData.GameParticipantDeviceId.length >= 2 && gameData.gameStatus !== "En cours") {
          // Mettre à jour le statut du jeu à "En cours"
          gamesRef.update({
            gameStatus: true
          })
          navigation.navigate("Jeu")
          
         
        }
      } else {
        console.log("Aucun document trouvé avec cet ID.");
      }
    }, (error) => {
      console.error("Erreur lors de la récupération du jeu:", error);
    });

    return () => unsubscribe();
  }, [gameId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nom du jeu: {gameName}</Text>
      <Text style={styles.message}>
        Nombre de participants: {participantsCount}
      </Text>
      <Text style={styles.message}>
        Veuillez patienter, la partie  commencera des que quelqu'un rejoindra votre partie.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: "#333",
  },
});

export default SalleAttente;
