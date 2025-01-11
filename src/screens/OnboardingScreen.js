import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        await savePhotoToStorage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto');
    }
  };

  const savePhotoToStorage = async (uri) => {
    try {
      await AsyncStorage.setItem('userPhoto', uri);
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome');
      return;
    }

    try {
      const userData = {
        name,
        photoUri: photoUri || 'default',
        onboardingComplete: true
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar seus dados');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao GymTracker Pro</Text>
      
      <View style={styles.photoContainer}>
        <Image
          source={photoUri ? { uri: photoUri } : require('../../assets/images/profile.png')}
          style={styles.profilePhoto}
        />
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={pickImage}
        >
          <MaterialCommunityIcons name="camera" size={24} color="#FFF" />
          <Text style={styles.photoButtonText}>
            {photoUri ? 'Trocar Foto' : 'Escolher Foto'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Como podemos te chamar?</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  photoButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
