import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function DayWorkoutScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { day } = route.params;
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadExercises();
    }, [refreshKey])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.shouldRefresh) {
        setRefreshKey(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.shouldRefresh]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const data = await AsyncStorage.getItem(`exercises_${day}`);
      if (data) {
        setExercises(JSON.parse(data));
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exercícios');
    } finally {
      setIsLoading(false);
    }
  };

  const getLastPerformance = (exercise) => {
    if (!exercise.history || exercise.history.length === 0) {
      return null;
    }
    return exercise.history[exercise.history.length - 1];
  };

  const getTechniqueColor = (technique) => {
    switch (technique) {
      case 'ruim': return '#FF453A';
      case 'regular': return '#FFD60A';
      case 'boa': return '#30D158';
      default: return theme.colors.secondary;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => {
            const lastPerformance = getLastPerformance(exercise);
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, { backgroundColor: theme.colors.card }]}
                onPress={() => navigation.navigate('ExerciseDetail', { exercise, day })}
              >
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <MaterialCommunityIcons
                      name="weight-lifter"
                      size={24}
                      color={theme.colors.primary}
                    />
                    <View style={styles.exerciseText}>
                      <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.exerciseSets, { color: theme.colors.secondary }]}>
                        {exercise.workingSets} séries de trabalho
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.secondary}
                  />
                </View>

                {lastPerformance && (
                  <View style={styles.lastPerformance}>
                    <Text style={[styles.lastPerformanceTitle, { color: theme.colors.secondary }]}>
                      Última série:
                    </Text>
                    <View style={styles.performanceDetails}>
                      <Text style={[styles.performanceText, { color: theme.colors.text }]}>
                        {lastPerformance.weight}kg × {lastPerformance.reps} reps
                      </Text>
                      <Text style={[
                        styles.techniqueText,
                        { color: getTechniqueColor(lastPerformance.technique) }
                      ]}>
                        {lastPerformance.technique.charAt(0).toUpperCase() + 
                         lastPerformance.technique.slice(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={50}
              color={theme.colors.secondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>
              Nenhum exercício adicionado
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>
              Toque no + para começar
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddExercise', { 
          day,
          onExerciseAdded: () => setRefreshKey(prev => prev + 1)
        })}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  exerciseCard: {
    borderRadius: 15,
    marginBottom: 10,
    padding: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseText: {
    marginLeft: 15,
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '500',
  },
  exerciseSets: {
    fontSize: 14,
    marginTop: 4,
  },
  lastPerformance: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  lastPerformanceTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  performanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 16,
  },
  techniqueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
