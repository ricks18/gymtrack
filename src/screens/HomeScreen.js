import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme, isBarbieMode, setIsBarbieMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [exercises, setExercises] = useState({});

  const weekDays = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  useEffect(() => {
    loadUserData();
    loadExercises();
    setupHeaderButton();
  }, []);

  const setupHeaderButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowThemeModal(true)}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons 
            name="heart" 
            size={24} 
            color={isBarbieMode ? theme.colors.primary : theme.colors.secondary} 
          />
        </TouchableOpacity>
      ),
    });
  };

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      const photo = await AsyncStorage.getItem('userPhoto');
      
      if (data) {
        setUserData(JSON.parse(data));
      }
      if (photo) {
        setPhotoUri(photo);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const exercisesData = {};
      for (const day of weekDays) {
        const data = await AsyncStorage.getItem(`exercises_${day}`);
        if (data) {
          exercisesData[day] = JSON.parse(data);
        } else {
          exercisesData[day] = [];
        }
      }
      setExercises(exercisesData);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  };

  const getCurrentDay = () => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const today = new Date().getDay();
    return days[today];
  };

  const renderThemeModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showThemeModal}
      onRequestClose={() => setShowThemeModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowThemeModal(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Tema Especial
          </Text>
          
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => {
              setIsBarbieMode(!isBarbieMode);
              setShowThemeModal(false);
            }}
          >
            <MaterialCommunityIcons 
              name={isBarbieMode ? "heart" : "heart-outline"}
              size={24}
              color={isBarbieMode ? '#FF69B4' : theme.colors.secondary}
            />
            <Text style={[styles.themeText, { color: theme.colors.text }]}>
              Versão da Carol Cabeça de Minhoca
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Image
          source={photoUri ? { uri: photoUri } : require('../../assets/images/profile.png')}
          style={styles.profilePic}
        />
        <View style={styles.headerText}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Olá, {userData?.name || 'Atleta'}!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
            Vamos treinar?
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.todayCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.todayTitle, { color: theme.colors.text }]}>
            Treino de Hoje
          </Text>
          <Text style={[styles.currentDay, { color: theme.colors.primary }]}>
            {getCurrentDay()}
          </Text>
          <TouchableOpacity
            style={[styles.workoutButton, { backgroundColor: theme.colors.border }]}
            onPress={() => navigation.navigate('DayWorkout', { day: getCurrentDay() })}
          >
            <MaterialCommunityIcons 
              name="dumbbell" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.workoutButtonText, { color: theme.colors.text }]}>
              Ver treino de hoje
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.secondary} 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Todos os Treinos
        </Text>
        
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCard,
              { backgroundColor: theme.colors.card },
              getCurrentDay() === day && styles.currentDayCard
            ]}
            onPress={() => navigation.navigate('DayWorkout', { day })}
          >
            <View style={styles.dayInfo}>
              <MaterialCommunityIcons
                name="calendar-week"
                size={24}
                color={getCurrentDay() === day ? theme.colors.primary : theme.colors.secondary}
              />
              <Text style={[
                styles.dayText,
                { color: theme.colors.text },
                getCurrentDay() === day && { color: theme.colors.primary }
              ]}>
                {day}
              </Text>
            </View>
            <View style={styles.dayStats}>
              <Text style={[styles.statsText, { color: theme.colors.secondary }]}>
                {exercises[day]?.length || 0} exercícios
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.secondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderThemeModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2C2C2E',
  },
  headerText: {
    marginLeft: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  todayCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentDay: {
    fontSize: 16,
    marginBottom: 15,
  },
  workoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  workoutButtonText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  currentDayCard: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    marginLeft: 10,
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  themeText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
