import { createStackNavigator } from "@react-navigation/stack";
import Home from "./HomeScreen";
import Session from "./SessionScreen";
import { NavigationContainer } from "@react-navigation/native";
import SalleAttente from "./SalleAttente";
import ListeDesParties from "./ListePartie";
import PageDeJeu from "./PageDeJeu";

const Stack = createStackNavigator();

function MyStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Session" options={{
          headerLeft: null, // Cela supprime le bouton de retour
        }} component={Session} />
        <Stack.Screen name="Attente" component={SalleAttente} />
        <Stack.Screen name="Liste"    component={ListeDesParties} />
        <Stack.Screen name="PageDeJeu" options={{ headerShown: false } } component={PageDeJeu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MyStack;
