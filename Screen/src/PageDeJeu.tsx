import React, { useEffect, useState } from 'react';
import { View, TouchableWithoutFeedback, Image, StyleSheet, Dimensions, Text } from 'react-native';
import Snackbar from 'react-native-snackbar';
import DropdownAlert from 'react-native-dropdownalert';
// Importez les images des pions
import Reine from "../assets/soldat.png";
import Soldat from '../assets/soldat.png';
import Toast from 'react-native-toast-message';




const PageDeJeu = () => {
  const [pionsMachine, setPionsMachine] = useState([]);
  const [pions, setPions] = useState([]);
  const [pionsCount, setPionsCount] = useState(0);
  const [touchable, setTouchable] = useState(true);
  const [touchPoints, setTouchPoints] = useState([]);
  const [monTour, setTour] = useState(true);
  const [score, setScore] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const pionHeight = screenHeight / 5; // Hauteur disponible pour chaque pion
  const pionWidth = pionHeight; // Largeur des pions, pour les garder carrés
  

   
  useEffect(() => {
    Snackbar.show({
      text: 'Placez vos pions !',
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
  }, []);

  useEffect(() => {
    if (pionsCount === 5) {
      generateRandomPoints();
      Snackbar.show({
        text: 'Commencez à jouer, c\'est votre tour',
        duration: Snackbar.LENGTH_LONG, // 3 seconds
      });
    }
    if(monTour){
        setTouchable(true);
    }else{
        setTouchable(false);
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
        type: i === 0 ? 'Reine' : 'Soldat',
      });
    }
    setPionsMachine(points);
    setTouchable(true); // Permettre les touches après avoir généré les points de la machine
    Snackbar.show({
      text: 'C\'est votre tour, jouez !',
      duration: Snackbar.LENGTH_LONG, // 3 seconds
    });
  };

  ;

  const checkPointMatch = (touchPoint) => {
    // Vérifie si les coordonnées du touchPoint correspondent à celles d'un pionMachine
    for (let i = 0; i < pionsMachine.length; i++) {
      const pion = pionsMachine[i];
      if (touchPoint.x >= pion.x &&
          touchPoint.x <= pion.x + pionWidth &&
          touchPoint.y >= pion.y &&
          touchPoint.y <= pion.y + pionHeight) {
        return true; // Correspondance trouvée
      }
    }
    return false; // Aucune correspondance trouvée
  };
  

  const handleBoardPress = (event) => {
    if (pionsCount >= 5) {
      if (touchable) {
        const { locationX, locationY } = event.nativeEvent;
        const normalizedX = locationX / screenWidth; // Coordonnée x normalisée
        const normalizedY = 1 - (locationY / screenHeight); // Coordonnée y normalisée

        const newTouchPoint = {
          id: touchPoints.length + 1,
          x: locationX - 5, // Ajustement pour le point rouge
          y: locationY - 5, // Ajustement pour le point rouge
          normalizedX: normalizedX.toFixed(2),
          normalizedY: normalizedY.toFixed(2),
          color: 'red',
        };

        setTouchPoints((prevPoints) => [...prevPoints, newTouchPoint]);
    
         // Désactiver les touches après le placement du point rouge
    setTouchable(false);
    Toast.show({
        type: 'success',
        position: 'top',
        text1: 'l\'ordinateur joue',
        text2: 'une fois ce message quitte de votre ecran vous pourrez jouer',
        visibilityTime: 5000, // 3 seconds
      });
      
    const isPointMatched = checkPointMatch(newTouchPoint);

    if (isPointMatched) {
        // Point correspondant trouvé dans pionsMachine
        Snackbar.show({
        text: 'Touché ! Bonne direction pour vous !',
        duration: Snackbar.LENGTH_LONG, // 3 seconds
        });
        // Logique pour augmenter le score ou effectuer d'autres actions
    } else {
        // Aucun point correspondant trouvé
        Snackbar.show({
        text: 'Raté ! Mauvaise direction pour vous !',
        duration: Snackbar.LENGTH_LONG, // 3 seconds
        });
        // Exemple avec setTimeout
        setTimeout(() => {
            setTouchable(true)
        }, 5000); // Délai de 3000 millisecondes (3 secondes)
    }
   
      }
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = locationX / screenWidth; // Coordonnée x normalisée
    const normalizedY = 1 - (locationY / screenHeight); // Coordonnée y normalisée

    const newPion = {
      id: pions.length + 1,
      x: locationX - (pionWidth / 2), // Centre le pion
      y: locationY - (pionHeight / 2), // Centre le pion
      normalizedX: normalizedX.toFixed(2), // Coordonnée x normalisée arrondie à 2 décimales
      normalizedY: normalizedY.toFixed(2), // Coordonnée y normalisée arrondie à 2 décimales
      type: pionsCount === 0 ? 'Reine' : 'Soldat', // Le premier pion est la reine, les autres sont des soldats
    };

    setPions((prevPions) => [...prevPions, newPion]);
    setPionsCount((prevCount) => prevCount + 1);
    if (pionsCount + 1 === 5) {
      setTouchable(true); // Activer les touches après avoir placé 5 pions
    }
  };

  return (
    <View style={styles.container}>
        
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      
      {/* Plateau de jeu */}
      <TouchableWithoutFeedback onPress={handleBoardPress} disabled={!touchable}>
        <View style={styles.board}>
          {pions.map((pion) => (
            <Image
              key={pion.id}
              source={pion.type === 'Reine' ? Reine : Soldat}
              style={[
                styles.pion,
                { width: pionWidth, height: pionHeight, left: pion.x, top: pion.y }
              ]}
            />
          ))}
          {touchPoints.map((point) => (
            <View
              key={point.id}
              style={[
                styles.touchPoint,
                { width: 10, height: 10, left: point.x, top: point.y, backgroundColor: point.color }
              ]}
            >
            </View>
          ))}
        </View>
      </TouchableWithoutFeedback>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  board: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  pion: {
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 1, // Ensure pions are below touch points
  },
  touchPoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5, // Rond
    zIndex: 2, // Ensure touch points are above pions
  },
  scoreContainer: {
    position: 'absolute',
    top: 20, // Position verticale en haut
    right: 20, // Position horizontale à droite
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent noir
    padding: 10, // Espacement intérieur
    borderRadius: 5, // Coins arrondis
  },
  scoreText: {
    color: 'white', // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: 'bold', // Police en gras
  },
});

export default PageDeJeu;
