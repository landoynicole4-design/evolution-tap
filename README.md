# 🧬 Evolution Tap

Short reflection (300–500 words) answering:

What was your game idea?

Evolution Tap is a mobile game in which you tap to evolve your species to 20 different stages of life, from a tiny microbe to an omniscient species. Each stage has a bar that bounces left and right on the screen, and you need to tap at exactly the right time when it hits in the highlighted zone to move to the next stage. If you fail, your species goes extinct, and there are no retries or second chances.
Each stage also comes with the real scientific name of your species, the time in which it lived, and some interesting fact about its biology, so you are also learning something as you play.

There is also a mutation feature in which every 4th time you successfully tap, your zone is temporarily made larger, giving you a slight edge.

The game has 4 screens: a loading screen, a home screen, a gameplay screen, and a results screen, all made using React Native and Expo.

What was the most difficult part to implement?

The biggest challenge was getting the game over screen to fit perfectly on all phone screen sizes without having to scroll through it. The screen has five different sections: a header, a results card, a creature info card, a progress tracker, and action buttons. It took a lot of trial and error to get all of these sections to fit perfectly on small and large phone screens at the same time.

The trick to getting it right was removing the scroll view and using weights instead, where each section is assigned a weight based on how much space it should take up on the screen. I also created a scaling helper called sc() that will scale font sizes, spacing, and padding based on screen widths, ensuring everything is in proportion on any screen size.

Animations on this screen were also challenging, with cards sliding in, a floating emoji, a progress bar filling up, star ratings, and a 60-particle confetti explosion when you win, all happening without slowing the app down.

What would you improve with more time?

The biggest addition would be the addition of a global leaderboard, where users can compete against each other instead of competing against their personal best score. At the moment, the high score is only saved on the device itself. The other addition would be more variety in the gameplay, such as speed boosts or zones where the enemies are smaller, as the difficulty increases in one straight line at the moment. The final addition would be to publish it on the Google Play Store and Apple App Store, where real users could download and play it.
> *Evolve or go extinct.*

A fast-paced mobile game where you tap to evolve your species through 20 stages of life — from a single-celled microbe all the way to modern human. One wrong move and your species is gone.

---

## 📱 About the App

**Evolution Tap** is a mobile game built with React Native and Expo. Players are challenged to tap at the right moment to evolve their creature to the next stage of life. The game features 20 unique evolutionary stages, each with real scientific names, fun facts, and historical time periods — making it as educational as it is addictive.

When the game ends, players are shown a detailed results screen displaying their score, evolution progress, a creature fact card, and their best score — all wrapped in a polished, animated UI.

---

## ✨ Features

- 🦠 20 evolutionary stages from Amoeba to Human
- 💀 Animated game over screen with outcome-based theming
- 📚 Educational creature cards with scientific names and fun facts
- 📊 Evolution progress tracker with emoji stage grid
- 🎉 Confetti burst animation on winning
- 🔊 Sound effects and haptic feedback
- 📸 Screenshot and share functionality
- 🏆 High score tracking with "New Record" badge

---

## 🛠️ Tech Stack

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Google Fonts](https://github.com/expo/google-fonts)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Expo Media Library](https://docs.expo.dev/versions/latest/sdk/media-library/)
- [react-native-view-shot](https://github.com/gre/react-native-view-shot)

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Expo Go app (for device testing)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/evolution-tap.git

# Navigate into the project
cd evolution-tap

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with **Expo Go** on your phone to run the app instantly.

---

## 📦 Building the APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK
eas build -p android --profile preview
```

---

## 🎮 How to Play

1. Launch the app
2. Tap the screen at the right moment to evolve
3. Survive all 20 stages to win
4. Miss the timing — your species goes extinct
5. Check your results, learn about your creature, and try again

---

## 📸 Screenshots

*Coming soon*

---

## 👤 Author

Built solo by **[Nicole James S. Landoy]**

- GitHub: [@landoynicole4@gmail.com](https://github.com/landoynicole4-design)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
