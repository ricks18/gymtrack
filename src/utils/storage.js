import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveExerciseProgress = async (exercise, set, day) => {
  try {
    // Salvar no histórico do dia
    const dayKey = `exercises_${day}`;
    const dayData = await AsyncStorage.getItem(dayKey);
    const exercises = dayData ? JSON.parse(dayData) : [];
    
    const exerciseIndex = exercises.findIndex(e => e.id === exercise.id);
    if (exerciseIndex !== -1) {
      if (!exercises[exerciseIndex].history) {
        exercises[exerciseIndex].history = [];
      }
      exercises[exerciseIndex].history.push(set);
      await AsyncStorage.setItem(dayKey, JSON.stringify(exercises));
    }

    // Salvar no histórico geral
    const progressKey = `progress_${exercise.id}`;
    const progressData = await AsyncStorage.getItem(progressKey);
    const progress = progressData ? JSON.parse(progressData) : [];
    progress.push({
      ...set,
      day,
      exerciseId: exercise.id,
      exerciseName: exercise.name
    });
    await AsyncStorage.setItem(progressKey, JSON.stringify(progress));

    return true;
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    return false;
  }
};

export const getExerciseProgress = async (exerciseId) => {
  try {
    const progressKey = `progress_${exerciseId}`;
    const progressData = await AsyncStorage.getItem(progressKey);
    return progressData ? JSON.parse(progressData) : [];
  } catch (error) {
    console.error('Erro ao carregar progresso:', error);
    return [];
  }
};

export const getDayExercises = async (day) => {
  try {
    const dayKey = `exercises_${day}`;
    const data = await AsyncStorage.getItem(dayKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar exercícios:', error);
    return [];
  }
};
