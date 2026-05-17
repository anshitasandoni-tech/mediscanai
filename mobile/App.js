import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('Scan');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MediScan <Text style={{ color: '#8b5cf6' }}>AI</Text></Text>
      </View>

      <View style={styles.content}>
        {activeTab === 'Scan' && <ScanScreen />}
        {activeTab === 'Chat' && <ChatScreen />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Scan')}>
          <Text style={[styles.tabText, activeTab === 'Scan' && styles.activeTabText]}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Chat')}>
          <Text style={[styles.tabText, activeTab === 'Chat' && styles.activeTabText]}>Chat AI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ScanScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#f8fafc' }}>Intelligent Scanner</Text>
            <Text style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 40 }}>Take a photo of your medicines or prescriptions to understand them instantly.</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Action', 'Camera opened (Mock)')}>
                <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3b82f6', marginTop: 15 }]} onPress={() => Alert.alert('Action', 'Gallery opened (Mock)')}>
                <Text style={[styles.buttonText, { color: '#3b82f6' }]}>Upload from Gallery</Text>
            </TouchableOpacity>
        </View>
    )
}

function ChatScreen() {
    const [msgs, setMsgs] = useState([{ role: 'bot', text: 'Hello! I am MediScan AI.' }]);
    const [input, setInput] = useState('');

    const send = () => {
        if (!input.trim()) return;
        setMsgs([...msgs, { role: 'user', text: input }, { role: 'bot', text: 'Simulated AI Response for: ' + input }]);
        setInput('');
    };

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <ScrollView style={{ flex: 1, marginBottom: 15 }}>
                {msgs.map((m, i) => (
                    <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
                        <Text style={{ color: '#fff' }}>{m.text}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#94a3b8"
                    placeholder="Ask about your health..." 
                    value={input} 
                    onChangeText={setInput} 
                />
                <TouchableOpacity style={styles.sendButton} onPress={send}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a'
  },
  tabItem: {
    flex: 1,
    padding: 15,
    alignItems: 'center'
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600'
  },
  activeTabText: {
    color: '#3b82f6'
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  bubble: {
      padding: 15,
      borderRadius: 20,
      marginBottom: 10,
      maxWidth: '80%',
  },
  userBubble: {
      backgroundColor: '#3b82f6',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 5
  },
  botBubble: {
      backgroundColor: '#1e293b',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 5
  },
  input: {
      flex: 1,
      backgroundColor: '#1e293b',
      color: '#fff',
      padding: 15,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#334155'
  },
  sendButton: {
      backgroundColor: '#8b5cf6',
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25
  }
});
