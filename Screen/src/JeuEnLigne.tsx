import React, { useEffect, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import Snackbar from "react-native-snackbar";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Importez les images des pions
import Reine from "../assets/soldat.png";
import Soldat from "../assets/soldat.png";
import GlobaleVariable from "../../GlobaleVariable";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JeuEnLigne = () => {
  const [pionsMachine, setPionsMachine] = useState([]);
  const [pions, setPions] = useState([]);
  const [pionsCount, setPionsCount] = useState(0);
  const [touchable, setTouchable] = useState(true);
  const [touchPoints, setTouchPoints] = useState([]);
  const [monTour, setTour] = useState(true);
  const [score, setScore] = useState(0);
  const [scoreMachine, setScoreMachine] = useState(0);
  const [showMachineScore, setShowMachineScore] = useState(false);
  const [touchableMachine, settouchableMachine] = useState([]);
  const [countTourMachine, setCountTourMachine] = useState(0);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // 'Moi' or 'Machine'
  const [pionHeight, setPionHeight] = useState(screenHeight / 5); // Hauteur disponible pour chaque pion
  const [pionWidth, setPionWidth] = useState(pionHeight); // Largeur des pions, pour les garder carrés
  const [touchedByMachine, setTouchedByMachine] = useState(null); // État pour suivre le point touché par la machine
  const navigation = useNavigation();
  const nameAdversaire = 
  useEffect(() => {
    Snackbar.show({
      text: "Placez vos pions !",
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
  }, []);

  useEffect(() => {
    const fetchMonNom = async () => {
      try {
        const myInfo = await getData("userProfile"); // Récupérer monNom depuis AsyncStorage
        const monNom = myInfo?.name;
        if (monNom && pionsCount === 5) {
          const gamesRef = firestore().collection("PourJeu");
          const query = gamesRef.where("gameId", "==", GlobaleVariable.globalString);

          // Vérifier si un document existe avec le gameId spécifié
          const querySnapshot = await query.get();
          const participantData = { nom: monNom, positionImages: pions };

          if (querySnapshot.empty) {
            // Aucun document trouvé, créer un nouveau document
            const newDocumentData = {
              gameId: GlobaleVariable.globalString,
              MailParticipant: [participantData],
              // Autres champs nécessaires à votre document
            };

            await gamesRef.add(newDocumentData);
            console.log("Nouveau document créé avec succès !");
          } else {
            // Document existant trouvé, mettre à jour le tableau MailParticipant
            querySnapshot.forEach((doc) => {
              const docRef = gamesRef.doc(doc.id);

              // Mettre à jour le tableau MailParticipant avec monNom et la position des images
              docRef
                .update({
                  MailParticipant: firestore.FieldValue.arrayUnion(participantData),
                })
                .then(() => {
                  console.log("Document mis à jour avec succès !");
                })
                .catch((error) => {
                  console.error("Erreur lors de la mise à jour du document :", error);
                });
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de monNom depuis AsyncStorage :", error);
      }
    };

    fetchMonNom();
  }, [pionsCount]);

  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  const generateRandomNumber = () => {
    const randomNumber = Math.random();
    return randomNumber;
  };

  useEffect(() => {
    if (score === 5 || scoreMachine === 5) {
      setGameOver(true);
      if (score === 5) {
        setWinner("Moi");
      } else {
        setWinner("Machine");
      }
    }
  }, [score, scoreMachine]);

  const checkPointMachineMatch = (touchPoint) => {
    if (!touchableMachine || !touchableMachine[countTourMachine]) {
      return false;
    }

    for (let i = 0; i < pions.length; i++) {
      const pion = pions[i];
      if (
        touchPoint.x >= pion.x &&
        touchPoint.x <= pion.x + pionWidth &&
        touchPoint.y >= pion.y &&
        touchPoint.y <= pion.y + pionHeight
      ) {
        setTouchedByMachine(pion);
        pions.splice(i, 1);
        return true;
      }
    }

    return false;
  };

  const handleBoardPress = (event) => {
    if (pionsCount >= 5) {
      if (touchable) {
        const { locationX, locationY } = event.nativeEvent;
        const normalizedX = locationX / screenWidth;
        const normalizedY = 1 - locationY / screenHeight;

        const newTouchPoint = {
          id: touchPoints.length + 1,
          x: locationX - 5,
          y: locationY - 5,
          normalizedX: normalizedX.toFixed(2),
          normalizedY: normalizedY.toFixed(2),
          color: "red",
        };

        setTouchPoints((prevPoints) => [...prevPoints, newTouchPoint]);

        if (checkPointMachineMatch(touchableMachine[countTourMachine])) {
          setScoreMachine((prevScore) => prevScore + 1);
          setTouchedByMachine(touchableMachine[countTourMachine]);
          Snackbar.show({
            text: "La machine vous a touché !",
            duration: Snackbar.LENGTH_LONG,
          });
        } else {
          Snackbar.show({
            text: "Raté !",
            duration: Snackbar.LENGTH_LONG,
          });
        }

        setTouchable(false);
        Toast.show({
          type: "success",
          position: "top",
          text1: "La machine joue maintenant",
          visibilityTime: 5000,
        });
        generatePoints();

        setCountTourMachine((previousCount) => previousCount + 1);
      }
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = locationX / screenWidth;
    const normalizedY = 1 - locationY / screenHeight;

    const newPion = {
      id: pions.length + 1,
      x: locationX - pionWidth / 2,
      y: locationY - pionHeight / 2,
      normalizedX: normalizedX.toFixed(2),
      normalizedY: normalizedY.toFixed(2),
      type: pionsCount === 0 ? "Reine" : "Soldat",
      touche: "",
    };

    setPions((prevPions) => [...prevPions, newPion]);
    setPionsCount((prevCount) => prevCount + 1);
    if (pionsCount + 1 === 5) {
      setTouchable(true);
      setShowMachineScore(true);
    }
  };

  const handleGemini = async () => {
    const API_KEY = "AIzaSyBnYcO9geA8JOgXOGyN9kkp56iK8OeJy2A"; // Replace with your actual API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent("Write a story about AI and magic");
      const text = result.response.text;
      console.log(text);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  const initializeGameState = () => {
    setPionsMachine([]);
    setPions([]);
    setPionsCount(0);
    setTouchable(true);
    setTouchPoints([]);
    setTour(true);
    setScore(0);
    setScoreMachine(0);
    setShowMachineScore(false);
    settouchableMachine([]);
    setCountTourMachine(0);
    setScreenWidth(Dimensions.get("window").width);
    setScreenHeight(Dimensions.get("window").height);
    setPionHeight(screenHeight / 5);
    setPionWidth(pionHeight);
    setTouchedByMachine(null);
  };

  return (
    <View style={styles.container}>
      {showMachineScore && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Score: Moi {score} - {scoreMachine} Machine
          </Text>
        </View>
      )}

      {/* Plateau de jeu */}
      <TouchableWithoutFeedback onPress={handleBoardPress} disabled={!touchable}>
        <View style={styles.board}>
          {pions.map((pion) => (
            <Image
              key={pion.id}
              source={pion.type === "Reine" ? Reine : Soldat}
              style={[
                styles.pion,
                {
                  width: pionWidth,
                  height: pionHeight,
                  left: pion.x,
                  top: pion.y,
                  opacity:
                    touchedByMachine && touchedByMachine.id === pion.id ? 0 : 1,
                },
              ]}
            />
          ))}
          {touchPoints.map((point) => (
            <View
              key={point.id}
              style={[
                styles.touchPoint,
                {
                  width: 10,
                  height: 10,
                  left: point.x,
                  top: point.y,
                  backgroundColor: point.color,
                },
              ]}
            ></View>
          ))}
        </View>
      </TouchableWithoutFeedback>
      {showMachineScore && (
        <TouchableOpacity style={styles.buttonContainer} onPress={handleGemini}>
          <Text style={styles.buttonText}>Demandez à Gemini</Text>
        </TouchableOpacity>
      )}
      <Modal visible={gameOver} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{winner} a gagné!</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  initializeGameState();
                  setGameOver(false);
                  setWinner(null);
                }}
              >
                <Text style={styles.buttonText}>Recommencer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={styles.buttonText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  board: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    position: "relative",
  },
  pion: {
    position: "absolute",
    resizeMode: "contain",
    zIndex: 1,
  },
  touchPoint: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    zIndex: 2,
  },
  scoreContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
    zIndex: 3,
  },
  scoreText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 5,
    zIndex: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default JeuEnLigne;
