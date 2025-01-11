import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SectionList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exerciseDatabase, getAllTypes, getExercisesByType, searchExercises } from '../data/exercises';
import { useTheme } from '../context/ThemeContext';

export default function AddExerciseScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { day, onExerciseAdded } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workingSets, setWorkingSets] = useState(4);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);

  useEffect(() => {
    // Carregar todos os tipos de exercícios
    const types = getAllTypes();
    setExerciseTypes(types);
    
    // Preparar dados iniciais
    const initialSections = types.map(type => ({
      title: type,
      data: getExercisesByType(type)
    }));
    setFilteredExercises(initialSections);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = searchExercises(searchQuery);
      const sections = getAllTypes()
        .map(type => ({
          title: type,
          data: results.filter(exercise => exercise.type === type)
        }))
        .filter(section => section.data.length > 0);
      setFilteredExercises(sections);
    } else {
      const sections = getAllTypes().map(type => ({
        title: type,
        data: getExercisesByType(type)
      }));
      setFilteredExercises(sections);
    }
  }, [searchQuery]);

  const handleAddExercise = async () => {
    if (!selectedExercise) {
      Alert.alert('Erro', 'Selecione um exercício');
      return;
    }

    try {
      const exerciseData = {
        ...selectedExercise,
        workingSets,
        history: []
      };

      const existingData = await AsyncStorage.getItem(`exercises_${day}`);
      const exercises = existingData ? JSON.parse(existingData) : [];
      
      // Verificar se o exercício já existe
      if (exercises.some(e => e.id === selectedExercise.id)) {
        Alert.alert('Erro', 'Este exercício já está na sua rotina');
        return;
      }

      exercises.push(exerciseData);
      await AsyncStorage.setItem(`exercises_${day}`, JSON.stringify(exercises));
      
      if (onExerciseAdded) {
        onExerciseAdded();
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      Alert.alert('Erro', 'Não foi possível salvar o exercício');
    }
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.exerciseItem,
        { backgroundColor: theme.colors.card },
        selectedExercise?.id === item.id && styles.selectedItem
      ]}
      onPress={() => setSelectedExercise(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.exerciseDetail, { color: theme.colors.secondary }]}>
          {item.equipment} • {item.muscle}
        </Text>
      </View>
      {selectedExercise?.id === item.id && (
        <MaterialCommunityIcons 
          name="check-circle" 
          size={24} 
          color={theme.colors.primary} 
        />
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
      {section.title}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color={theme.colors.secondary} 
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar exercício..."
          placeholderTextColor={theme.colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {selectedExercise ? (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedTitle, { color: theme.colors.text }]}>
            {selectedExercise.name}
          </Text>
          
          <View style={styles.setsContainer}>
            <Text style={[styles.setsLabel, { color: theme.colors.text }]}>
              Séries de Trabalho:
            </Text>
            <View style={styles.setsButtons}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.setButton,
                    { backgroundColor: theme.colors.card },
                    workingSets === num && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setWorkingSets(num)}
                >
                  <Text style={[
                    styles.setText,
                    { color: workingSets === num ? '#FFF' : theme.colors.text }
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddExercise}
          >
            <Text style={styles.addButtonText}>Adicionar ao Treino</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={filteredExercises}
          renderItem={renderExerciseItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exercisesList}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  exercisesList: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedItem: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseDetail: {
    fontSize: 14,
  },
  selectedContainer: {
    padding: 20,
  },
  selectedTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
  },
  setsContainer: {
    marginBottom: 30,
  },
  setsLabel: {
    fontSize: 16,
    marginBottom: 15,
  },
  setsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setText: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
