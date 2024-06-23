import firestore from '@react-native-firebase/firestore';

class Players {
  constructor(email) {
    this.email = email;
    this.collection = firestore().collection('players');
  }

  async emailExists(email) {
    try {
      const querySnapshot = await this.collection.where('email', '==', email).get();
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if email exists: ', error);
      throw new Error('Error checking if email exists');
    }
  }

  async addPlayer() {
    try {
      const exists = await this.emailExists(this.email);
      if (exists) {
        console.log('Email already exists');
        throw new Error('Email already exists');
      }
      const playerRef = await this.collection.add({
        email: this.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Player added with ID: ', playerRef.id);
      return playerRef.id;
    } catch (error) {
      console.error('Error adding player: ', error);
      throw new Error('Error adding player');
    }
  }

  async deletePlayer(playerId) {
    try {
      await this.collection.doc(playerId).delete();
      console.log('Player deleted with ID: ', playerId);
    } catch (error) {
      console.error('Error deleting player: ', error);
      throw new Error('Error deleting player');
    }
  }

  async getPlayerById(playerId) {
    try {
      const playerDoc = await this.collection.doc(playerId).get();
      if (playerDoc.exists) {
        console.log('Player data: ', playerDoc.data());
        return playerDoc.data();
      } else {
        console.log('No such player!');
        return null;
      }
    } catch (error) {
      console.error('Error getting player: ', error);
      throw new Error('Error getting player');
    }
  }
}

export default Players;
