import React, { useEffect, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Snackbar from "react-native-snackbar";

// Importez les images des pions
import Reine from "../assets/soldat.png";
import Soldat from "../assets/soldat.png";
import ToucheImage from "../assets/reine_morte.png"; // Image pour le point touché par la machine
import Toast from "react-native-toast-message";

const PageDeJeu = () => {
  const [pionsMachine, setPionsMachine] = useState([]);
  const [pions, setPions] = useState([]);
  const [pionsCount, setPionsCount] = useState(0);
  const [touchable, setTouchable] = useState(true);
  const [touchPoints, setTouchPoints] = useState([]);
  const [monTour, setTour] = useState(true);
  const [score, setScore] = useState(0);
  const [scoreMachine, setScoreMachine] = useState(0);
  const [showMachineScore, setShowMachineScore] = useState(false); // Nouvel état pour afficher le score de la machine
  const [touchableMachine, settouchableMachine] = useState([]);
  const [countTourMachine, setCountTourMachine] = useState(0);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );
  const [pionHeight, setPionHeight] = useState(screenHeight / 5); // Hauteur disponible pour chaque pion
  const [pionWidth, setPionWidth] = useState(pionHeight); // Largeur des pions, pour les garder carrés
  const [touchedByMachine, setTouchedByMachine] = useState(null); // État pour suivre le point touché par la machine

  useEffect(() => {
    Snackbar.show({
      text: "Placez vos pions !",
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
  }, []);

  useEffect(() => {
    if (pionsCount === 5) {
      generateRandomPoints();
      Snackbar.show({
        text: "Commencez à jouer, c'est votre tour",
        duration: Snackbar.LENGTH_LONG, // 3 seconds
      });
    }
  }, [pionsCount]);

  const generateRandomPoints = () => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const randomX = Math.random();
      const randomY = Math.random();
      points.push({
        id: i + 1,
        x: randomX * screenWidth - pionWidth / 2,
        y: (1 - randomY) * screenHeight - pionHeight / 2,
        normalizedX: randomX.toFixed(2),
        normalizedY: randomY.toFixed(2),
        type: i === 0 ? "Reine" : "Soldat",
      });
    }
    setPionsMachine(points);
    setTouchable(true); // Permettre les touches après avoir généré les points de la machine
    Snackbar.show({
      text: "C'est votre tour, jouez !",
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
  };

  const generatePoints = () => {
    const points = [];

    // Nombre de lignes et de colonnes en fonction de pionWidth et pionHeight
    const columns = Math.ceil(screenWidth / pionWidth);
    const rows = Math.ceil(screenHeight / pionHeight);

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({
          x: i * pionWidth,
          y: j * pionHeight,
          type: "Soldat",
        });
      }
    }
    console.log(points);

    // Mettre à jour l'état touchableMachine avec les points générés
    settouchableMachine(points);
  };

  const checkPointMatch = (touchPoint) => {
    // Vérifie si les coordonnées du touchPoint correspondent à celles d'un pionMachine
    for (let i = 0; i < pionsMachine.length; i++) {
      const pion = pionsMachine[i];
      if (
        touchPoint.x >= pion.x &&
        touchPoint.x <= pion.x + pionWidth &&
        touchPoint.y >= pion.y &&
        touchPoint.y <= pion.y + pionHeight
      ) {
        return true; // Correspondance trouvée
      }
    }
    return false; // Aucune correspondance trouvée
  };

  const checkPointMachineMatch = (touchPoint) => {
    // Vérifie si touchableMachine ou l'élément actuel est défini
    if (!touchableMachine || !touchableMachine[countTourMachine]) {
      return false; // Si non défini, retourne false
    }

    // Récupère l'élément de touchableMachine correspondant à countTourMachine
    const pion = touchableMachine[countTourMachine];

    // Vérifie si les coordonnées du touchPoint correspondent à celles du pion
    if (
      touchPoint.x >= pion.x &&
      touchPoint.x <= pion.x + pionWidth &&
      touchPoint.y >= pion.y &&
      touchPoint.y <= pion.y + pionHeight
    ) {
      // Met à jour l'état touchedByMachine avec le pion correspondant
      setTouchedByMachine(pion);
      return true; // Correspondance trouvée
    }

    return false; // Aucune correspondance trouvée
  };

  const handleBoardPress = (event) => {
    if (pionsCount >= 5) {
      if (touchable) {
        const { locationX, locationY } = event.nativeEvent;
        const normalizedX = locationX / screenWidth; // Coordonnée x normalisée
        const normalizedY = 1 - locationY / screenHeight; // Coordonnée y normalisée

        const newTouchPoint = {
          id: touchPoints.length + 1,
          x: locationX - 5, // Ajustement pour le point rouge
          y: locationY - 5, // Ajustement pour le point rouge
          normalizedX: normalizedX.toFixed(2),
          normalizedY: normalizedY.toFixed(2),
          color: "red",
        };

        setTouchPoints((prevPoints) => [...prevPoints, newTouchPoint]);
        const isPointMatched = checkPointMatch(newTouchPoint);

        if (isPointMatched) {
          // Point correspondant trouvé dans pionsMachine
          Snackbar.show({
            text: "Touché  🎊 ! Bonne direction pour vous !",
            duration: Snackbar.LENGTH_LONG, // 3 seconds
          });
          // Logique pour augmenter le score ou effectuer d'autres actions
          setScore((prevScore) => prevScore + 1);
        } else {
          // Aucun point correspondant trouvé
          Snackbar.show({
            text: "Raté ! vous n'avez pas touche un point !",
            duration: Snackbar.LENGTH_LONG, // 3 seconds
          });
        }
        // Désactiver les touches après le placement du point rouge
        setTouchable(false);
        Toast.show({
          type: "success",
          position: "top",
          text1: "l'ordinateur joue",
          text2: "une fois ce message quitte de votre ecran vous pourrez jouer",
          visibilityTime: 5000, // 5 seconds
        });
        generatePoints();

        if (checkPointMachineMatch(touchableMachine[countTourMachine])) {
          setScoreMachine((prevScore) => prevScore + 1);
          // Mettre à jour le point touché par la machine
          setTouchedByMachine(touchableMachine[countTourMachine]);
          // Afficher un Snackbar pour indiquer que la machine a touché un point
          Snackbar.show({
            text: "La machine vous a touché !",
            duration: Snackbar.LENGTH_LONG, // 3 seconds
          });
        }
        setCountTourMachine((previousCount) => previousCount + 1);

        console.log(`Touch Point: x=${newTouchPoint.x}, y=${newTouchPoint.y}`);
        console.log(`Machine Points:`, pionsMachine);
        console.log(`Player Points:`, pions);
        console.log(`touchabe:`, touchPoints);
        console.log(`Pions Machine: `, touchableMachine);

        setTimeout(() => {
          setTouchable(true);
        }, 5000); // Délai de 5000 millisecondes (5 secondes)
      }
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = locationX / screenWidth; // Coordonnée x normalisée
    const normalizedY = 1 - locationY / screenHeight; // Coordonnée y normalisée

    const newPion = {
      id: pions.length + 1,
      x: locationX - pionWidth / 2, // Centre le pion
      y: locationY - pionHeight / 2, // Centre le pion
      normalizedX: normalizedX.toFixed(2), // Coordonnée x normalisée arrondie à 2 décimales
      normalizedY: normalizedY.toFixed(2), // Coordonnée y normalisée arrondie à 2 décimales
      type: pionsCount === 0 ? "Reine" : "Soldat", // Le premier pion est la reine, les autres sont des soldats
    };

    setPions((prevPions) => [...prevPions, newPion]);
    setPionsCount((prevCount) => prevCount + 1);
    if (pionsCount + 1 === 5) {
      setTouchable(true); // Activer les touches après avoir placé 5 pions
      setShowMachineScore(true); // Afficher le score de la machine une fois que les pions sont placés
    }
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
                  opacity: touchedByMachine && touchedByMachine.id === pion.id ? 0 : 1, // Masquer l'image si elle correspond à touchedByMachine
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
          {touchedByMachine ? (
            <Image
              source={ToucheImage} // Image pour indiquer le point touché par la machine
              style={[
                styles.pion,
                {
                  width: pionWidth,
                  height: pionHeight,
                  left: touchedByMachine.x,
                  top: touchedByMachine.y,
                },
              ]}
            />
          ) : null /* Aucun point touché par la machine */}
        </View>
      </TouchableWithoutFeedback>
      {showMachineScore && (
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Demandez à Gemini</Text>
        </TouchableOpacity>
      )}
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
    zIndex: 1, // Assurer que les pions sont en dessous des points de contact
  },
  touchPoint: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5, // Rond
    zIndex: 2, // Assurer que les points de contact sont au-dessus des pions
  },
  scoreContainer: {
    position: "absolute",
    top: 20, // Position verticale en haut
    right: 20, // Position horizontale à droite
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent noir
    padding: 10, // Espacement intérieur
    borderRadius: 5, // Coins arrondis
    zIndex: 3, // Assurer que le score est au-dessus des autres éléments
  },
  scoreText: {
    color: "white", // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: "bold", // Police en gras
  },
  // Styles pour le bouton Gemini
  buttonContainer: {
    position: "absolute",
    bottom: 20, // Position verticale en bas
    alignSelf: "flex-end", // Centrer horizontalement
    backgroundColor: "#4CAF50", // Couleur de fond du bouton
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
});

export default PageDeJeu;
