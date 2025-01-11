import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import DayWorkoutScreen from './src/screens/DayWorkoutScreen';
import AddExerciseScreen from './src/screens/AddExerciseScreen';
import ExerciseDetailScreen from './src/screens/ExerciseDetailScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ 
          title: 'GymTracker Pro',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="DayWorkout" 
        component={DayWorkoutScreen}
        options={({ route }) => ({ 
          title: route.params.day,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
        })}
      />
      <Stack.Screen 
        name="AddExercise" 
        component={AddExerciseScreen}
        options={{ 
          title: 'Adicionar Exercício',
          presentation: 'modal',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="ExerciseDetail" 
        component={ExerciseDetailScreen}
        options={({ route }) => ({ 
          title: route.params.exercise.name,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
        })}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Treino',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          title: 'Progresso',
          tabBarLabel: 'Progresso',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { onboardingComplete } = JSON.parse(userData);
        setIsOnboardingComplete(onboardingComplete);
      }
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: theme.colors
      }}
    >
      {!isOnboardingComplete ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
