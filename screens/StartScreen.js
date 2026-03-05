import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, SafeAreaView } from "react-native";
import { STAGES } from "../utils/gameConfig";

export default function StartScreen({ onStart, highScore }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const titleO = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(-30)).current;
  const bodyO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleO, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(bodyO, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.07, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.00, duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Animated.View style={{ opacity: titleO, transform: [{ translateY: titleY }], alignItems: "center" }}>
          <Text style={s.egg}>🥚</Text>
          <Text style={s.title}>EVOLUTION</Text>
          <Text style={s.sub}>T A P</Text>
          <Text style={s.tagline}>one tap · one life · evolve or die</Text>
        </Animated.View>

        {highScore > 0 && (
          <Animated.View style={[s.hsBadge, { opacity: bodyO }]}>
            <Text style={s.hsLabel}>BEST</Text>
            <Text style={s.hsVal}>{highScore}<Text style={s.hsMax}> / {STAGES.length}</Text></Text>
            <Text style={{ fontSize: 22 }}>{STAGES[Math.min(highScore - 1, STAGES.length - 1)].emoji}</Text>
          </Animated.View>
        )}

        <Animated.View style={[s.chainBox, { opacity: bodyO }]}>
          <Text style={s.chainLabel}>YOUR JOURNEY</Text>
          <View style={s.chainRow}>
            {STAGES.map((st, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 18 }}>{st.emoji}</Text>
                {i < STAGES.length - 1 && <Text style={[s.arr, { color: st.color }]}>›</Text>}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[s.rules, { opacity: bodyO }]}>
          {[["🎯","Tap when the marker hits the zone"],["⚡","Zone shrinks and speeds up each stage"],["🧬","Every 3rd tap gives a Mutation Boost!"],["💀","Miss once — extinction is permanent"]].map(([icon, txt], i) => (
            <View key={i} style={s.ruleRow}><Text style={s.ruleIcon}>{icon}</Text><Text style={s.ruleTxt}>{txt}</Text></View>
          ))}
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable style={s.btn} onPress={onStart}>
            <Text style={s.btnTxt}>BEGIN EVOLUTION</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: "#050510" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 20 },
  egg:       { fontSize: 60, marginBottom: 4 },
  title:     { fontSize: 40, fontWeight: "900", color: "#fff", letterSpacing: 8 },
  sub:       { fontSize: 20, fontWeight: "300", color: "#4ade80", letterSpacing: 16, marginTop: -4 },
  tagline:   { fontSize: 12, color: "#333", letterSpacing: 2, marginTop: 8 },
  hsBadge:   { flexDirection: "row", alignItems: "center", backgroundColor: "#0f0f25", borderRadius: 50, paddingVertical: 10, paddingHorizontal: 22, borderWidth: 1, borderColor: "#f472b680", gap: 10 },
  hsLabel:   { color: "#f472b6", fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  hsVal:     { color: "#fff", fontSize: 22, fontWeight: "800" },
  hsMax:     { fontSize: 14, color: "#444", fontWeight: "400" },
  chainBox:  { backgroundColor: "#0a0a20", borderRadius: 18, padding: 18, width: "100%", borderWidth: 1, borderColor: "#1a1a35" },
  chainLabel:{ color: "#333", fontSize: 10, letterSpacing: 3, textAlign: "center", marginBottom: 10 },
  chainRow:  { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  arr:       { fontSize: 16, marginHorizontal: 2, opacity: 0.6 },
  rules:     { gap: 10, width: "100%" },
  ruleRow:   { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  ruleIcon:  { fontSize: 16, width: 24 },
  ruleTxt:   { color: "#777", fontSize: 13, lineHeight: 20, flex: 1 },
  btn:       { backgroundColor: "#4ade80", paddingHorizontal: 48, paddingVertical: 18, borderRadius: 50, elevation: 10, shadowColor: "#4ade80", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
  btnTxt:    { color: "#050510", fontSize: 17, fontWeight: "900", letterSpacing: 2 },
});
