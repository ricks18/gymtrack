import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { format, differenceInDays } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MeasureCard = ({ title, value, icon, isSelected, onSelect, theme }) => (
  <TouchableOpacity
    style={[
      styles.measureCard,
      { backgroundColor: theme.colors.card },
      isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
    ]}
    onPress={onSelect}
  >
    <MaterialCommunityIcons
      name={icon}
      size={28}
      color={isSelected ? theme.colors.primary : theme.colors.text}
    />
    <Text style={[styles.measureTitle, { color: theme.colors.text }]}>
      {title}
    </Text>
    <Text style={[styles.measureValue, { color: theme.colors.primary }]}>
      {value}cm
    </Text>
  </TouchableOpacity>
);

const WeightCard = ({ weight, theme }) => (
  <View style={[styles.weightCard, { backgroundColor: theme.colors.card }]}>
    <View style={styles.weightHeader}>
      <MaterialCommunityIcons name="scale-bathroom" size={32} color={theme.colors.primary} />
      <Text style={[styles.weightTitle, { color: theme.colors.text }]}>Peso Atual</Text>
    </View>
    <Text style={[styles.weightValue, { color: theme.colors.primary }]}>{weight}kg</Text>
  </View>
);

const renderProgressView = ({ measurements, selectedMeasure, setSelectedMeasure, theme, history }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  const measureIcons = {
    peitoral: 'human-male',
    biceps: 'arm-flex',
    cintura: 'human-male-height',
    quadril: 'human',
    coxa: 'human-male-height-variant',
    panturrilha: 'human-male-height-variant'
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <WeightCard weight={measurements.weight} theme={theme} />
      
      <View style={styles.measureCardsContainer}>
        <View style={styles.measureCardsGrid}>
          {Object.entries(measurements.measures).map(([key, value]) => (
            <MeasureCard
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              icon={measureIcons[key]}
              isSelected={selectedMeasure === key}
              onSelect={() => setSelectedMeasure(key)}
              theme={theme}
            />
          ))}
        </View>
      </View>

      {selectedMeasure && (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Evolução - {selectedMeasure.charAt(0).toUpperCase() + selectedMeasure.slice(1)}
          </Text>
          <LineChart
            data={{
              labels: history.slice(-6).map(item => format(new Date(item.date), 'dd/MM')),
              datasets: [{
                data: history.slice(-6).map(item => 
                  parseFloat(selectedMeasure === 'weight' ? 
                    item.weight : 
                    item.measures[selectedMeasure]
                  ) || 0
                )
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  weightCard: {
    padding: 20,
    borderRadius: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weightTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  weightValue: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  measureCardsContainer: {
    marginVertical: 10,
  },
  measureCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  measureCard: {
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  measureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  measureValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  chartContainer: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  addButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function BodyMeasuresScreen({ theme, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [measurements, setMeasurements] = useState({
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
  const [history, setHistory] = useState([]);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  const [canUpdate, setCanUpdate] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const data = await AsyncStorage.getItem('bodyMeasurementsHistory');
      if (data) {
        const parsedHistory = JSON.parse(data);
        setHistory(parsedHistory);
        
        if (parsedHistory.length > 0) {
          const lastMeasurement = parsedHistory[parsedHistory.length - 1];
          setLastUpdateDate(lastMeasurement.date);
          
          const daysSinceLastUpdate = differenceInDays(
            new Date(),
            new Date(lastMeasurement.date)
          );
          setCanUpdate(daysSinceLastUpdate >= 7);
        } else {
          setShowInputForm(true);
        }
      } else {
        setShowInputForm(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar medidas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas medidas.');
      setIsLoading(false);
    }
  };

  const handleSaveMeasurements = async () => {
    try {
      const newMeasurement = {
        ...measurements,
        date: new Date().toISOString(),
      };

      const updatedHistory = [...history, newMeasurement];
      await AsyncStorage.setItem('bodyMeasurementsHistory', JSON.stringify(updatedHistory));
      
      setHistory(updatedHistory);
      setShowInputForm(false);
      setLastUpdateDate(new Date().toISOString());
      setCanUpdate(false);
    } catch (error) {
      console.error('Erro ao salvar medidas:', error);
      Alert.alert('Erro', 'Não foi possível salvar as medidas.');
    }
  };

  const renderMeasurementForm = () => {
    return (
      <ScrollView style={styles.formContainer}>
        <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Atualizar Medidas
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={measurements.weight}
              onChangeText={(value) => setMeasurements(prev => ({
                ...prev,
                weight: value
              }))}
              keyboardType="numeric"
              placeholder="Ex: 75.5"
              placeholderTextColor={theme.colors.text + '50'}
            />
          </View>

          {Object.entries(measurements.measures).map(([key, value]) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={value}
                onChangeText={(newValue) => setMeasurements(prev => ({
                  ...prev,
                  measures: {
                    ...prev.measures,
                    [key]: newValue
                  }
                }))}
                keyboardType="numeric"
                placeholder="Ex: 90"
                placeholderTextColor={theme.colors.text + '50'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSaveMeasurements}
          >
            <Text style={styles.saveButtonText}>Salvar Medidas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Medidas Corporais
        </Text>
        {canUpdate && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowInputForm(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name="plus" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          showInputForm ? (
            renderMeasurementForm()
          ) : (
            renderProgressView({
              measurements: history[history.length - 1] || measurements,
              selectedMeasure,
              setSelectedMeasure,
              theme,
              history
            })
          )
        )}
      </View>
    </SafeAreaView>
  );
} 