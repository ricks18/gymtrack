import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  Easing 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, [fadeAnim, scaleValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleValue },
              { rotate: spin }
            ]
          }
        ]}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={80}
            color="#007AFF"
          />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>GymTracker Pro</Text>
          <Text style={styles.subtitle}>Seu progresso é nossa prioridade</Text>
        </Animated.View>

        <Animated.View style={[styles.loadingBar, { opacity: fadeAnim }]}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
  }
});
