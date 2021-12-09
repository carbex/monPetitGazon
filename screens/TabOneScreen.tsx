import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Picker,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
  Image,
} from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";

import axios from "axios";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [clubs, setClubs] = useState<any>();
  const [players, setPlayers] = useState<string[]>([]);
  const [list, setList] = useState<string[]>([]);
  const [uniqPlayers, setUniqPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("0");
  const [selectedPosition, setSelectedPosition] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalBody, setModalBody] = useState<any>({
    clubId: "",
    stats: {
      averageRating: 0,
      totalGoals: 0,
      totalMatches: 0,
      totalStartedMatches: 0,
      totalPlayedMatches: 0,
    },
  });

  useEffect(() => {
    getAllClubs();
    getAllPlayers();
  }, []);

  // Add all clubs
  const getAllClubs = async (): Promise<any> => {
    try {
      let response = await axios.get(
        "https://api.mpg.football/api/data/championship-clubs"
      );
      if (response) {
        setClubs(response.data.championshipClubs);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Add all players
  const getAllPlayers = async (): Promise<any> => {
    setIsLoading(true);
    try {
      let response = await axios.get(
        "https://api.mpg.football/api/data/championship-players-pool/1"
      );
      if (response) {
        setPlayers(response.data.poolPlayers.sort((a: any,b: any) => {
          const lastNameA = a.lastName.split(' ').slice(-1);
          const lastNameB = b.lastName.split(' ').slice(-1);
          return (lastNameA > lastNameB) ? 1 : ((lastNameB > lastNameA) ? -1 : 0)
        }));
        setList(response.data.poolPlayers);

        const filtered = response.data.poolPlayers.map(
          (player: { lastName: string }) => player.lastName
        );
        setUniqPlayers([...new Set(filtered)].sort());
      }
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  // Filter
  const filter = (name: string, position: string): void => {
    setIsLoading(true);
    let filteredPlayers: React.SetStateAction<string[]>;
    if (name !== "0") {
      if (position !== "0") {
        filteredPlayers = [...players].filter(
          (player: any) =>
            player.ultraPosition === +position && player.lastName === name
        );
      } else {
        filteredPlayers = [...players].filter(
          (player: any) => player.lastName === name
        );
      }
    } else {
      if (position !== "0") {
        filteredPlayers = [...players].filter(
          (player: any) => player.ultraPosition === +position
        );
      } else {
        filteredPlayers = [...players];
      }
    }
    setList(filteredPlayers);
    setIsLoading(false);
  };

  const displayStats = (player: {
    clubId: string;
    stats: {
      averageRating: number;
      totalGoals: number;
      totalMatches: number;
      totalStartedMatches: number;
      totalPlayedMatches: number;
    };
  }) => {
    setModalVisible(true);
    setModalBody({
      stats: player.stats,
      url: clubs ? clubs[player.clubId].defaultJerseyUrl : null,
      clubName: clubs ? clubs[player.clubId].name["fr-FR"] : null,
    });
  };

  return (
    <View style={styles.container}>
      <Modal
        statusBarTranslucent={true}
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: modalBody.url }}
            />
            <Text style={styles.modalText}>
              Club name : {modalBody.clubName}
            </Text>
            <Text style={styles.modalText}>
              Average rating :{" "}
              {modalBody.stats.averageRating ? Math.round(modalBody.stats.averageRating * 100) / 100 : 0}
            </Text>
            <Text style={styles.modalText}>
              Total goals : {modalBody.stats.totalGoals ? modalBody.stats.totalGoals : 0}
            </Text>
            <Text style={styles.modalText}>
              Total matches : {modalBody.stats.totalMatches ? modalBody.stats.totalMatches : 0}
            </Text>
            <Text style={styles.modalText}>
              Total started matches : {modalBody.stats.totalStartedMatches ? modalBody.stats.totalStartedMatches : 0}
            </Text>
            <Text style={styles.modalText}>
              Total played matches : {modalBody.stats.totalPlayedMatches ? modalBody.stats.totalPlayedMatches : 0}
            </Text>
            <Pressable
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View style={styles.filtersWrapper}>
          <Text style={styles.title}>Choisir un nom et/ou une position</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedPlayer}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedPlayer(itemValue)
              }
            >
              <Picker.Item
                key={"unselectable"}
                label="Veuillez sélectionner un nom"
                value="0"
              />
              {uniqPlayers &&
                uniqPlayers.map((player, id) => (
                  <Picker.Item key={id} label={player} value={player} />
                ))}
            </Picker>

            <Picker
              selectedValue={selectedPosition}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedPosition(itemValue)
              }
            >
              <Picker.Item
                key={"unselectable"}
                label="Veuillez sélectionner une position"
                value="0"
              />
              <Picker.Item label="Gardien" value="10" />
              <Picker.Item label="Défenseur" value="20" />
              <Picker.Item label="Lateral" value="21" />
              <Picker.Item label="Milieu défenseur" value="30" />
              <Picker.Item label="Milieu offensif" value="31" />
              <Picker.Item label="Attaquant" value="40" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => filter(selectedPlayer, selectedPosition)}
          >
            <Text style={styles.buttonText}>Filtrer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.playersWrapper}>
          <Text style={styles.title}>Liste des joueurs:</Text>
          {isLoading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <>
              {list &&
                list.map((player: any, id) => (
                  <TouchableOpacity
                    key={id}
                    style={styles.player}
                    onPress={() => displayStats(player)}
                  >
                    {player.firstName && (
                      <Text>{player.firstName}{" "}</Text>
                    )}
                    {player.lastName && (
                      <Text>{player.lastName}</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  filtersWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  playersWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  player: {
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    marginBottom: 5,
    backgroundColor: 'orange'
  },
  button: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "orange",
  },
  buttonText: {
    fontWeight: "bold",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  loading: {
    textAlign: "center",
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    borderWidth: 1,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "orange",
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
