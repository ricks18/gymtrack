import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import BodyMeasuresScreen from './BodyMeasuresScreen';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const [showExerciseProgress, setShowExerciseProgress] = useState(false);
  const [showBodyProgress, setShowBodyProgress] = useState(false);
  const [exercisesWithProgress, setExercisesWithProgress] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    weight: '',
    measures: {
      peitoral: '',
      biceps: '',
      cintura: '',
      quadril: '',
      coxa: '',
      panturrilha: ''
    }
  });
  const [bodyHistory, setBodyHistory] = useState([]);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadExercisesWithProgress();
      await loadBodyHistory();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercisesWithProgress = async () => {
    try {
      const weekDays = [
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
        'Domingo'
      ];

      let exercisesWithHistory = new Set();

      for (const day of weekDays) {
        const exercisesData = await AsyncStorage.getItem(`exercises_${day}`);
        if (exercisesData) {
          const exercises = JSON.parse(exercisesData);
          exercises.forEach(exercise => {
            if (exercise.history && exercise.history.length > 0) {
              exercisesWithHistory.add({
                id: exercise.id,
                name: exercise.name,
                history: exercise.history
              });
            }
          });
        }
      }

      setExercisesWithProgress(Array.from(exercisesWithHistory));
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  };

  const loadBodyHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('bodyHistory');
      if (data) {
        const history = JSON.parse(data);
        setBodyHistory(history);
        setLastUpdateDate(history[history.length - 1]?.date);
        
        // Carregar últimas medidas
        if (history.length > 0) {
          const lastEntry = history[history.length - 1];
          setBodyMeasurements({
            weight: lastEntry.weight.toString(),
            measures: lastEntry.measures
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico corporal:', error);
    }
  };

  const canUpdateBodyMeasures = () => {
    if (!lastUpdateDate) return true;
    
    const nextUpdateDate = addWeeks(new Date(lastUpdateDate), 1);
    return isBefore(nextUpdateDate, new Date());
  };

  const handleSaveBodyMeasures = async () => {
    try {
      const today = new Date();
      
      // Verificar se já existe uma atualização na última semana
      if (lastUpdateDate) {
        const lastUpdate = new Date(lastUpdateDate);
        const diffTime = Math.abs(today - lastUpdate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
          Alert.alert(
            'Atualização não permitida',
            'Você só pode atualizar suas medidas uma vez por semana.'
          );
          return;
        }
      }

      const newMeasurement = {
        date: today.toISOString(),
        weight: bodyMeasurements.weight,
        measures: bodyMeasurements.measures
      };

      const updatedHistory = [...bodyHistory, newMeasurement];
      await AsyncStorage.setItem('bodyMeasurementsHistory', JSON.stringify(updatedHistory));
      
      setBodyHistory(updatedHistory);
      setLastUpdateDate(today.toISOString());
      
      Alert.alert('Sucesso', 'Medidas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar medidas:', error);
      Alert.alert('Erro', 'Não foi possível salvar as medidas.');
    }
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  const renderExerciseList = () => (
    <View style={styles.exerciseListContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Selecione um exercício
      </Text>
      <ScrollView style={styles.exerciseList}>
        {exercisesWithProgress.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseItem,
              { backgroundColor: theme.colors.card },
              selectedExercise?.id === exercise.id && {
                ...styles.selectedExerciseItem,
                borderColor: theme.colors.primary
              }
            ]}
            onPress={() => handleExerciseSelect(exercise)}
          >
            <Text style={[styles.exerciseText, { color: theme.colors.text }]}>
              {exercise.name}
            </Text>
            <MaterialCommunityIcons 
              name="chart-line" 
              size={24} 
              color={selectedExercise?.id === exercise.id ? theme.colors.primary : theme.colors.text} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderExerciseChart = () => {
    if (!selectedExercise?.history?.length) return null;

    const screenWidth = Dimensions.get('window').width - 40;
    const chartData = {
      labels: selectedExercise.history.slice(-7).map(entry => 
        format(new Date(entry.date), 'dd/MM')
      ),
      datasets: [{
        data: selectedExercise.history.slice(-7).map(entry => parseFloat(entry.weight))
      }]
    };

    const maxWeight = Math.max(...selectedExercise.history.map(entry => parseFloat(entry.weight)));
    const minWeight = Math.min(...selectedExercise.history.map(entry => parseFloat(entry.weight)));
    const progress = ((maxWeight - minWeight) / minWeight * 100).toFixed(1);

    return (
      <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            {selectedExercise.name}
          </Text>
          <Text style={[styles.progressText, { color: theme.colors.primary }]}>
            +{progress}% de evolução
          </Text>
        </View>
        
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => theme.colors.text,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: theme.colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
              Carga Inicial
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {minWeight}kg
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
              Carga Atual
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {maxWeight}kg
            </Text>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    const loadBodyMeasurements = async () => {
      try {
        const data = await AsyncStorage.getItem('bodyMeasurementsHistory');
        if (data) {
          const history = JSON.parse(data);
          setBodyHistory(history);
          
          if (history.length > 0) {
            const lastMeasurement = history[history.length - 1];
            setBodyMeasurements({
              weight: lastMeasurement.weight,
              measures: lastMeasurement.measures
            });
            setLastUpdateDate(lastMeasurement.date);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar medidas:', error);
      }
    };

    loadBodyMeasurements();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowExerciseProgress(true)}
            >
              <MaterialCommunityIcons 
                name="dumbbell" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Progresso dos Exercícios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowBodyProgress(true)}
            >
              <MaterialCommunityIcons 
                name="human" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Medidas Corporais
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showExerciseProgress}
            animationType="slide"
            onRequestClose={() => {
              setShowExerciseProgress(false);
              setSelectedExercise(null);
            }}
          >
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowExerciseProgress(false);
                    setSelectedExercise(null);
                  }}
                  style={styles.backButton}
                >
                  <MaterialCommunityIcons 
                    name="arrow-left" 
                    size={24} 
                    color={theme.colors.text} 
                  />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Progresso dos Exercícios
                </Text>
                <View style={styles.headerRight} />
              </View>
              
              <ScrollView style={styles.modalContent}>
                {renderExerciseList()}
                {selectedExercise && renderExerciseChart()}
              </ScrollView>
            </SafeAreaView>
          </Modal>

          <Modal
            visible={showBodyProgress}
            animationType="slide"
            onRequestClose={() => setShowBodyProgress(false)}
          >
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
              <BodyMeasuresScreen
                measurements={bodyMeasurements}
                setMeasurements={setBodyMeasurements}
                history={bodyHistory}
                setHistory={setBodyHistory}
                lastUpdateDate={lastUpdateDate}
                setLastUpdateDate={setLastUpdateDate}
                theme={theme}
                onClose={() => setShowBodyProgress(false)}
              />
            </SafeAreaView>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  mainButton: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseListContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  exerciseList: {
    maxHeight: 200,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedExerciseItem: {
    borderWidth: 2,
  },
  exerciseText: {
    fontSize: 16,
    flex: 1,
  },
  chartCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    width: 40, // Largura fixa para manter alinhamento
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40, // Espaço vazio do mesmo tamanho do botão para manter o título centralizado
  },
});
