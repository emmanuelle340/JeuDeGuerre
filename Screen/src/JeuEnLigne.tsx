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
  BackHandler,
} from "react-native";
import Snackbar from "react-native-snackbar";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import firestore, { firebase } from "@react-native-firebase/firestore";
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

  const [score, setScore] = useState(0);
  const [scoreMachine, setScoreMachine] = useState(0);
  const [showMachineScore, setShowMachineScore] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // 'Moi' or 'Machine'
  const [pionHeight, setPionHeight] = useState(screenHeight / 5); // Hauteur disponible pour chaque pion
  const [pionWidth, setPionWidth] = useState(pionHeight); // Largeur des pions, pour les garder carrés
  const [touched, setTouched] = useState(null); // État pour suivre le point touché par la machine
  const navigation = useNavigation();
  const [peutjouer, setpeutjouer] = useState("non");
  const [idJeu, setIdJeu] = useState("");
  const [adversaireNom, setAdversaireNom] = useState("");
  const [pionsAdversaire, setPionsAdversaire] = useState([]);
  const [monNom, setMonNom] = useState("");
  const [premierPassage, setPremierPassage] = useState(false);
  const [piontTouche, setPiontTouche] = useState(false);

  useEffect(() => {
    const Maj = async () => {
      if (piontTouche) {
        try {
          console.log("Fetching document...");
          const docSnapshot = await firestore()
            .collection("PourJeu")
            .doc(idJeu)
            .get(); // Attendre la récupération du document
          console.log("Document fetched:", docSnapshot.exists);

          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            console.log("Document data:", data);

            if (data.MailParticipant) {
              console.log("MailParticipant field exists");
              const opponentIndex = data.MailParticipant.findIndex(
                (participant) => participant.nom !== monNom
              ); // Trouver l'index de l'adversaire
              console.log("Opponent index:", opponentIndex);

              if (opponentIndex !== -1) {
                // Vérifier si un adversaire a été trouvé
                console.log(
                  "Opponent found:",
                  data.MailParticipant[opponentIndex]
                );
                data.MailParticipant[opponentIndex].positionImages =
                  pionsAdversaire; // Mettre à jour les positions des images de l'adversaire
                console.log(
                  "Updating opponent positionImages with:",
                  pionsAdversaire
                );
                await firestore().collection("PourJeu").doc(idJeu).update(data); // Mettre à jour le document Firestore
                setScore((prev) => prev + 1);
                setPiontTouche(false);
                console.log("Firebase updated successfully");
              } else {
                console.log("Opponent not found");
              }
            } else {
              console.log("MailParticipant field does not exist");
            }
          } else {
            console.log("Document does not exist");
          }
        } catch (error) {
          console.error("Error updating Firebase:", error);
        }
      }
    };
    Maj();
  }, [piontTouche]);

  useEffect(() => {
    const Maj = async () => {
      if (premierPassage) {
        console.log("Setting up Firestore listener for pions update");

        const gamesRef = firestore().collection("PourJeu");
        const query = gamesRef.where(
          "gameId",
          "==",
          GlobaleVariable.globalString
        );

        const unsubscribe = query.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (pionsCount === 5) {
              if (data.MailParticipant && data.MailParticipant.length >= 2) {
                setTouchable(true);
                setShowMachineScore(true);
                const opponent = data.MailParticipant.find(
                  (participant) => participant.nom === monNom
                );
                if (opponent) {
                  const tmp = pions;
                  setPions(opponent.positionImages);
                  if (pions.length != tmp.length)
                    setScoreMachine((prev) => prev + 1);
                }
              } else {
              }
            }
          });
        });

        return () => unsubscribe();
      }
    };

    Maj();
  }, [premierPassage, idJeu, monNom]);

  useEffect(() => {
    Snackbar.show({
      text: "Placez vos pions !",
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
    const recupNom = async () => {
      const myInfo = await getData("userProfile");
      setMonNom(myInfo.name);
    };
    recupNom();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Session");
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchMonNom = async () => {
      try {
        if (monNom != "" && !premierPassage && pionsCount === 5) {
          const gamesRef = firestore().collection("PourJeu");
          const query = gamesRef.where(
            "gameId",
            "==",
            GlobaleVariable.globalString
          );

          const querySnapshot = await query.get();
          const participantData = {
            nom: monNom,
            positionImages: pions,
          };

          if (querySnapshot.empty) {
            const newDocumentData = {
              gameId: GlobaleVariable.globalString,
              MailParticipant: [participantData],
            };
            await gamesRef.add(newDocumentData);
            console.log("Nouveau document créé avec succès !");
            setIdJeu(gamesRef.id);
          } else {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const existingParticipants = data.MailParticipant;
              const opponent = existingParticipants.find(
                (participant) => participant.nom !== monNom
              );
              if (opponent) {
                setAdversaireNom(opponent.nom);
              }
              const docRef = gamesRef.doc(doc.id);
              docRef
                .update({
                  MailParticipant:
                    firestore.FieldValue.arrayUnion(participantData),
                })
                .then(() => {
                  setIdJeu(docRef.id);
                  console.log("Document mis à jour avec succès !");
                })
                .catch((error) => {
                  console.error(
                    "Erreur lors de la mise à jour du document :",
                    error
                  );
                });
            });
          }
          setPremierPassage(true);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de monNom depuis AsyncStorage :",
          error
        );
      }
    };

    fetchMonNom();
  }, [pionsCount]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unsubscribe = firestore()
          .collection("PourJeu")
          .doc(idJeu)
          .onSnapshot((docSnapshot) => {
            if (docSnapshot.exists) {
              const data = docSnapshot.data();
              if (data.MailParticipant) {
                const opponent = data.MailParticipant.find(
                  (participant) => participant.nom !== monNom
                );
                if (opponent) {
                  setPionsAdversaire(opponent.positionImages);
                }
              }
            }
          });

        // Retourne la fonction de désabonnement
        return () => unsubscribe();
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData(); // Appel de la fonction fetchData
  });

  useEffect(() => {
    if (score === 5 || scoreMachine === 5) {
      setGameOver(true);
      if (score === 5) {
        setWinner("Moi");
      } else {
        if (adversaireNom) setWinner(adversaireNom);
      }
    }
  }, [score, scoreMachine]);

  useEffect(() => {
    const gamesRef = firestore().collection("PourJeu");
    const query = gamesRef.where("gameId", "==", GlobaleVariable.globalString);

    // Function to handle snapshot changes
    const handleSnapshot = (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (pionsCount === 5) {
          if (data.MailParticipant && data.MailParticipant.length >= 2) {
            //setTouchable(true);
            setShowMachineScore(true);
            setpeutjouer("oui");
          } else {
            setpeutjouer("pas encore");
          }
        }
      });
    };

    // Start listening to snapshot changes
    const unsubscribe = query.onSnapshot(handleSnapshot);

    // Cleanup: stop listening to snapshot changes on component unmount
    return () => unsubscribe();
  }, [pionsCount]); // Trigger this effect whenever pionsCount changes

  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  useEffect(() => {
    const gamesRef = firestore().collection("PourJeu");
    const query = gamesRef.where("gameId", "==", GlobaleVariable.globalString);

    const unsubscribe = query.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (pionsCount === 5) {
          if (data.MailParticipant && data.MailParticipant.length >= 2) {
            setTouchable(true);
            setShowMachineScore(true);
            setpeutjouer("oui");

            const opponent = data.MailParticipant.find(
              (participant) => participant.nom !== monNom
            );
            if (opponent) {
              setAdversaireNom(opponent.nom);
            }
          } else {
            setpeutjouer("pas encore");
          }
        }
      });
    });

    return () => unsubscribe();
  }, [pionsCount, monNom]);



  const checkPointMatch = (touchPoint) => {
    for (let i = 0; i < pionsAdversaire.length; i++) {
      const pionX = parseFloat(pionsAdversaire[i].normalizedX, 10);
      const pionY = parseFloat(pionsAdversaire[i].normalizedY, 10);
      console.log(pionsAdversaire[i].normalizedX)
      // Vérification si le point touché correspond au point adverse avec une tolérance
      if (
        Math.abs(pionX - touchPoint.normalizedX) <= 0.3 &&
        Math.abs(pionY - touchPoint.normalizedY) <= 0.3
      ) {
        pionsAdversaire.splice(i, 1); 
        setPiontTouche(true);
        return true;
      }
    }
    return false;
  };
  

  const handleBoardPress = async (event) => {
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
        
        const isMatch = checkPointMatch(newTouchPoint);

        if (isMatch) {
          setScore((prevScore) => prevScore + 1);

          Snackbar.show({
            text: "Vous venez de toucher un pion 🎊 !",
            duration: Snackbar.LENGTH_LONG,
          });
        } else {
          Snackbar.show({
            text: "Raté ! ",
            duration: Snackbar.LENGTH_LONG,
          });
        }
      } else {
        setCountTour((previousCount) => previousCount + 1);
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
  };

  const handleGemini = async () => {
    const API_KEY = "AIzaSyBnYcO9geA8JOgXOGyN9kkp56iK8OeJy2A"; // Replace with your actual API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(
        "Write a story about AI and magic"
      );
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
    //setCountTourMachine(0);
    setScreenWidth(Dimensions.get("window").width);
    setScreenHeight(Dimensions.get("window").height);
    setPionHeight(screenHeight / 5);
    setPionWidth(pionHeight);
    setTouched(null);
  };

  return (
    <View style={styles.container}>
      {peutjouer === "pas encore" ? (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            {" "}
            L'autre joueur n'a pas encore place ses pions
          </Text>
        </View>
      ) : (
        <>
          {showMachineScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: Moi {score} - {scoreMachine} {adversaireNom}
              </Text>
            </View>
          )}

          {/* Plateau de jeu */}
          <TouchableWithoutFeedback
            onPress={handleBoardPress}
            disabled={!touchable}
          >
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
                      opacity: touched && touched.id === pion.id ? 0 : 1,
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
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleGemini}
            >
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
        </>
      )}
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
  waitingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  waitingText: {
    fontSize: 18,
    color: "black",
  },
});

export default JeuEnLigne;
