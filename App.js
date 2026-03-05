import { registerRootComponent } from "expo";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StartScreen from "./screens/StartScreen";
import GameScreen from "./screens/GameScreen";
import GameOverScreen from "./screens/GameOverScreen";

function App() {
  const [screen, setScreen] = useState("start");
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("evo_highScore").then(val => { if (val) setHighScore(parseInt(val)); }).catch(() => {});
  }, []);

  const handleGameOver = async (score) => {
    setFinalScore(score);
    const newRecord = score > highScore;
    setIsNewRecord(newRecord);
    if (newRecord) { setHighScore(score); await AsyncStorage.setItem("evo_highScore", String(score)).catch(() => {}); }
    setScreen("gameover");
  };

  return (
    <>
      <StatusBar style="light" />
      {screen === "start" && <StartScreen onStart={() => setScreen("game")} highScore={highScore} />}
      {screen === "game" && <GameScreen key={Date.now()} onGameOver={handleGameOver} />}
      {screen === "gameover" && <GameOverScreen score={finalScore} highScore={highScore} isNewRecord={isNewRecord} onRestart={() => { setIsNewRecord(false); setScreen("game"); }} onHome={() => { setIsNewRecord(false); setScreen("start"); }} />}
    </>
  );
}

registerRootComponent(App);
