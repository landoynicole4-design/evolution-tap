import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView } from "react-native";
import * as Haptics from "expo-haptics";
import { STAGES } from "../utils/gameConfig";

export default function GameOverScreen({ score, highScore, isNewRecord, onRestart, onHome }) {
  const isWin = score >= STAGES.length;
  const reached = STAGES[Math.min(score, STAGES.length - 1)];
  const pct = Math.round((score / STAGES.length) * 100);
  const stars = score === STAGES.length ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
  const iconScale = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isWin ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}) : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    Animated.sequence([
      Animated.spring(iconScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.parallel([Animated.timing(slideY, { toValue: 0, duration: 500, useNativeDriver: true }), Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true })]),
      ...(isNewRecord ? [Animated.spring(badgeScale, { toValue: 1, friction: 4, useNativeDriver: true })] : []),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Animated.Text style={[s.icon, { transform: [{ scale: iconScale }] }]}>{isWin ? "🏆" : score >= 4 ? "🌿" : "💀"}</Animated.Text>
        {isNewRecord && <Animated.View style={[s.record, { transform: [{ scale: badgeScale }] }]}><Text style={s.recordTxt}>🎉  NEW RECORD!</Text></Animated.View>}
        <Animated.View style={[s.content, { opacity, transform: [{ translateY: slideY }] }]}>
          <Text style={s.headline}>{isWin ? "FULLY EVOLVED" : "EXTINCT"}</Text>
          <Text style={s.sub}>{isWin ? "You conquered every era of life!" : "Stopped at " + reached.emoji + "  " + reached.name}</Text>
          <View style={s.card}>
            <View style={s.scoreRow}>
              {[["STAGES", score + "/" + STAGES.length, "#fff"], ["BEST", highScore + "/" + STAGES.length, "#f472b6"], ["EVOLVED", pct + "%", "#4ade80"]].map(([lbl, val, col], i) => (
                <View key={i} style={s.scoreItem}><Text style={s.scoreLabel}>{lbl}</Text><Text style={[s.scoreVal, { color: col }]}>{val}</Text></View>
              ))}
            </View>
            <View style={s.starsRow}>{[1,2,3].map(i => <Text key={i} style={[s.star, i > stars && { color: "#1a1a35" }]}>★</Text>)}</View>
          </View>
          <View style={s.progBar}><View style={[s.progFill, { width: pct + "%" }]} /></View>
          <Text style={s.progLabel}>Evolution Progress</Text>
          <View style={s.chain}>
            {STAGES.map((st, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[{ fontSize: 20 }, i >= score && !isWin && { opacity: 0.1 }]}>{st.emoji}</Text>
                {i < STAGES.length - 1 && <Text style={[s.arr, { color: i < score ? st.color : "#1a1a35" }]}>›</Text>}
              </View>
            ))}
          </View>
          <Pressable style={s.btn} onPress={onRestart}><Text style={s.btnTxt}>🔄  TRY AGAIN</Text></Pressable>
          <Pressable style={s.home} onPress={onHome}><Text style={s.homeTxt}>← Back to Start</Text></Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#050510" },
  container:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 14 },
  icon:       { fontSize: 80 },
  record:     { backgroundColor: "#f472b620", borderRadius: 50, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1, borderColor: "#f472b6" },
  recordTxt:  { color: "#f472b6", fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  content:    { width: "100%", alignItems: "center", gap: 14 },
  headline:   { fontSize: 34, fontWeight: "900", color: "#fff", letterSpacing: 6 },
  sub:        { color: "#555", fontSize: 14, textAlign: "center" },
  card:       { backgroundColor: "#0a0a20", borderRadius: 20, padding: 20, width: "100%", borderWidth: 1, borderColor: "#1a1a35", gap: 12 },
  scoreRow:   { flexDirection: "row", justifyContent: "space-around" },
  scoreItem:  { alignItems: "center" },
  scoreLabel: { color: "#444", fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  scoreVal:   { fontSize: 22, fontWeight: "900" },
  starsRow:   { flexDirection: "row", justifyContent: "center", gap: 8 },
  star:       { fontSize: 26, color: "#fbbf24" },
  progBar:    { height: 6, backgroundColor: "#0a0a20", borderRadius: 3, overflow: "hidden", width: "100%" },
  progFill:   { height: "100%", backgroundColor: "#4ade80", borderRadius: 3 },
  progLabel:  { color: "#2a2a3a", fontSize: 11, letterSpacing: 2 },
  chain:      { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  arr:        { fontSize: 16, marginHorizontal: 1 },
  btn:        { backgroundColor: "#4ade80", paddingHorizontal: 52, paddingVertical: 17, borderRadius: 50, width: "85%", alignItems: "center", elevation: 8, shadowColor: "#4ade80", shadowOpacity: 0.4, shadowRadius: 12 },
  btnTxt:     { color: "#050510", fontSize: 17, fontWeight: "900", letterSpacing: 2 },
  home:       { paddingVertical: 12 },
  homeTxt:    { color: "#333", fontSize: 14 },
});
