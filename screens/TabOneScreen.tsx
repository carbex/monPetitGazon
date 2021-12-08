import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Picker, TouchableOpacity } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";

import axios from "axios";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [clubs, setClubs] = useState<{}>({});
  const [players, setPlayers] = useState<string[]>([]);
  const [list, setList] = useState<string[]>([]);
  const [lastName, setLastName] = useState<string>("");
  const [ultraPosition, setUltraPosition] = useState<number>(0);
  const [uniqPlayers, setUniqPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("0");
  const [selectedPosition, setSelectedPosition] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAllPlayers();
  }, []);

  // Add all clubs
  const getAllClubs = async (): Promise<any> => {
    let response = await axios.get(
      "https://api.mpg.football/api/data/championship-clubs"
    );
    setClubs(response.data.championshipClubs);
    // const filtered = Object.keys(response.data.championshipClubs)
    //   .filter((key) => key)
    //   .map((e) => response.data.championshipClubs[e].name["fr-FR"]);
    // setClubs(filtered);
  };

  // Add all players
  const getAllPlayers = async (): Promise<any> => {
    setIsLoading(true);
    try {
      let response = await axios.get(
        "https://api.mpg.football/api/data/championship-players-pool/1"
      );

      if (response) {
        setPlayers(response.data.poolPlayers);
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
    setIsLoading(true)
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
    setIsLoading(false)
  };

  return (
    <View style={styles.container}>
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
            <Text>Filtrer</Text>
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
                    onPress={() => console.log("Player : ", player.lastName)}
                  >
                    <Text>{player.firstName}</Text>
                    <Text>{player.lastName}</Text>
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    marginBottom: 5,
  },
  button: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "orange",
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
});
