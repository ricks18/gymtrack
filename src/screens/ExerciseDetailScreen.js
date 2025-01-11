import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveExerciseProgress, getExerciseProgress } from '../utils/storage';
import RestTimer from '../components/RestTimer';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exercise, day } = route.params;
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [currentSet, setCurrentSet] = useState({
    weight: '',
    reps: '',
    technique: 'regular'
  });
  const [lastSet, setLastSet] = useState(null);

  useEffect(() => {
    loadHistory();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={confirmDeleteExercise}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#FF453A" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, day, exercise.id]); // Adicionando dependências corretas

  const loadHistory = async () => {
    try {
      const progress = await getExerciseProgress(exercise.id);
      const today = new Date().toISOString().split('T')[0];
      const todayProgress = progress.filter(p =>
        p.date.split('T')[0] === today && p.day === day
      );
      setHistory(todayProgress);

      if (todayProgress.length > 0) {
        setLastSet(todayProgress[todayProgress.length - 1]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const confirmDeleteExercise = () => {
    Alert.alert(
      'Deletar Exercício',
      'Tem certeza que deseja remover este exercício da sua rotina?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: deleteExercise
        }
      ]
    );
  };

  const deleteExercise = async () => {
    try {
      const dayKey = `exercises_${day}`;
      const dayData = await AsyncStorage.getItem(dayKey);

      if (dayData) {
        const exercises = JSON.parse(dayData);
        const updatedExercises = exercises.filter(e => e.id !== exercise.id);
        await AsyncStorage.setItem(dayKey, JSON.stringify(updatedExercises));

        // Atualizar o histórico geral também
        const progressKey = `progress_${exercise.id}`;
        const progressData = await AsyncStorage.getItem(progressKey);
        if (progressData) {
          const progress = JSON.parse(progressData);
          const updatedProgress = progress.filter(p => p.day !== day);
          await AsyncStorage.setItem(progressKey, JSON.stringify(updatedProgress));
        }

        // Notificar a tela anterior para atualizar
        navigation.navigate('DayWorkout', {
          day: day,
          shouldRefresh: true
        });
      }
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      Alert.alert('Erro', 'Não foi possível deletar o exercício');
    }
  };

  const saveSet = async () => {
    if (!currentSet.weight || !currentSet.reps) {
      Alert.alert('Erro', 'Preencha o peso e as repetições');
      return;
    }

    try {
      const newSet = {
        ...currentSet,
        date: new Date().toISOString(),
        setNumber: history.length + 1
      };

      const success = await saveExerciseProgress(exercise, newSet, day);

      if (success) {
        setHistory([...history, newSet]);
        setLastSet(newSet);

        const suggestion = generateProgressSuggestion(newSet);
        if (suggestion) {
          Alert.alert('Sugestão de Progresso', suggestion);
        }

        setShowTimer(true);
        setModalVisible(false);
        Vibration.vibrate(200);

        setCurrentSet({ weight: '', reps: '', technique: 'regular' });
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o progresso');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o progresso');
    }
  };

  const generateProgressSuggestion = (set) => {
    const weight = parseFloat(set.weight);
    const reps = parseInt(set.reps);

    if (set.technique === 'boa') {
      if (reps >= 9) {
        return `Ótimo trabalho! Você pode aumentar o peso em 2.5kg na próxima série.`;
      } else if (reps >= 6) {
        return `Bom trabalho! Tente aumentar para ${reps + 2} repetições na próxima série.`;
      }
    } else if (set.technique === 'regular') {
      return `Mantenha o peso atual e foque em melhorar a técnica.`;
    } else if (set.technique === 'ruim') {
      return `Considere reduzir o peso e focar na execução correta.`;
    }
    return null;
  };

  const getTechniqueColor = (technique) => {
    switch (technique) {
      case 'ruim': return '#FF453A';
      case 'regular': return '#FFD60A';
      case 'boa': return '#30D158';
      default: return '#666';
    }
  };

  const renderSetModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Série</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {lastSet && (
              <View style={styles.lastSetInfo}>
                <Text style={styles.lastSetTitle}>Última Série:</Text>
                <Text style={styles.lastSetText}>
                  {lastSet.weight}kg x {lastSet.reps} reps
                </Text>
              </View>
            )}

            <ScrollView>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <View style={styles.weightInput}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={currentSet.weight}
                    onChangeText={(text) => setCurrentSet({ ...currentSet, weight: text })}
                    placeholder="0.0"
                    placeholderTextColor="#666"
                  />
                  <View style={styles.weightButtons}>
                    <TouchableOpacity
                      style={styles.weightButton}
                      onPress={() => {
                        const current = parseFloat(currentSet.weight) || 0;
                        setCurrentSet({ ...currentSet, weight: (current + 2.5).toString() });
                      }}
                    >
                      <Text style={styles.weightButtonText}>+2.5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.weightButton}
                      onPress={() => {
                        const current = parseFloat(currentSet.weight) || 0;
                        if (current >= 2.5) {
                          setCurrentSet({ ...currentSet, weight: (current - 2.5).toString() });
                        }
                      }}
                    >
                      <Text style={styles.weightButtonText}>-2.5</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Repetições</Text>
                <View style={styles.repsInput}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={currentSet.reps}
                    onChangeText={(text) => setCurrentSet({ ...currentSet, reps: text })}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                  <View style={styles.repsButtons}>
                    <TouchableOpacity
                      style={styles.repsButton}
                      onPress={() => {
                        const current = parseInt(currentSet.reps) || 0;
                        setCurrentSet({ ...currentSet, reps: (current + 1).toString() });
                      }}
                    >
                      <Text style={styles.repsButtonText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.repsButton}
                      onPress={() => {
                        const current = parseInt(currentSet.reps) || 0;
                        if (current > 0) {
                          setCurrentSet({ ...currentSet, reps: (current - 1).toString() });
                        }
                      }}
                    >
                      <Text style={styles.repsButtonText}>-1</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.techniqueContainer}>
                <Text style={styles.inputLabel}>Técnica</Text>
                <View style={styles.techniqueButtons}>
                  {['ruim', 'regular', 'boa'].map((technique) => (
                    <TouchableOpacity
                      key={technique}
                      style={[
                        styles.techniqueButton,
                        currentSet.technique === technique && {
                          backgroundColor: getTechniqueColor(technique)
                        }
                      ]}
                      onPress={() => setCurrentSet({ ...currentSet, technique })}
                    >
                      <Text style={styles.techniqueText}>
                        {technique.charAt(0).toUpperCase() + technique.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSet}
            >
              <Text style={styles.saveButtonText}>Salvar Série</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.setsInfo}>
            {exercise.workingSets} séries de trabalho
          </Text>
        </View>

        {showTimer && <RestTimer />}

        <View style={styles.historyContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Hoje</Text>
            <TouchableOpacity
              onPress={() => setShowTimer(!showTimer)}
              style={styles.timerToggle}
            >
              <MaterialCommunityIcons
                name="timer"
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          {history.map((set, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.setHeader}>
                <Text style={styles.setNumber}>Série {set.setNumber}</Text>
                <Text style={[
                  styles.technique,
                  { color: getTechniqueColor(set.technique) }
                ]}>
                  {set.technique.charAt(0).toUpperCase() + set.technique.slice(1)}
                </Text>
              </View>
              <View style={styles.setDetails}>
                <Text style={styles.detailText}>{set.weight}kg</Text>
                <Text style={styles.detailText}>{set.reps} reps</Text>
              </View>
            </View>
          ))}

          {history.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma série registrada hoje
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Adicionar Série</Text>
      </TouchableOpacity>

      {renderSetModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  setsInfo: {
    color: '#666',
    fontSize: 16,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
  },
  timerToggle: {
    padding: 8,
  },
  historyCard: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  setNumber: {
    color: '#FFF',
    fontSize: 16,
  },
  technique: {
    fontSize: 16,
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#FFF',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  lastSetInfo: {
    backgroundColor: '#2C2C2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  lastSetTitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  lastSetText: {
    color: '#FFF',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 10,
  },
  weightInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  weightButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  weightButton: {
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  weightButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  repsInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repsButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  repsButton: {
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  repsButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  techniqueContainer: {
    marginBottom: 20,
  },
  techniqueButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  techniqueButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  techniqueText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});