import { StyleSheet, View } from "react-native";
import { WheelOfFortune } from "./src/components/WheelOfFortune";

export default function App() {
  const segments = ["🐶", "🐺", "🐱", "🐯", "🦁", "🦄", "🐈", "🦭"];

  return (
    <View style={styles.container}>
      <WheelOfFortune segments={segments} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
