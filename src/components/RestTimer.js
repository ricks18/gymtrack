import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RestTimer() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(90); // 90 segundos padrão
  const [defaultTime, setDefaultTime] = useState(90);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      Vibration.vibrate([500, 500, 500]);
      setIsActive(false);
      setTime(defaultTime);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(defaultTime);
  };

  const adjustTime = (seconds) => {
    if (!isActive) {
      const newTime = defaultTime + seconds;
      if (newTime > 0) {
        setDefaultTime(newTime);
        setTime(newTime);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <Text style={styles.timerTitle}>Descanso</Text>
        <Text style={styles.timerText}>
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
        </Text>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.adjustButton}
            onPress={() => adjustTime(-15)}
          >
            <Text style={styles.adjustButtonText}>-15s</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainButton, isActive && styles.activeButton]}
            onPress={toggleTimer}
          >
            <MaterialCommunityIcons
              name={isActive ? "pause" : "play"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.adjustButton}
            onPress={() => adjustTime(15)}
          >
            <Text style={styles.adjustButtonText}>+15s</Text>
          </TouchableOpacity>
        </View>

        {isActive && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetTimer}
          >
            <Text style={styles.resetButtonText}>Resetar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  timerCard: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerTitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
  },
  timerText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '600',
    marginVertical: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  mainButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  activeButton: {
    backgroundColor: '#FF453A',
  },
  adjustButton: {
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  resetButton: {
    marginTop: 10,
    padding: 8,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
