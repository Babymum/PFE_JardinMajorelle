import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Calendar, Search, Filter, EyeOff, Plus, X, Trash2, ArrowLeft } from 'lucide-react-native';
import { getZones, createZone, updateZone, deleteZone } from '../../api/api';
import { Modal } from 'react-native';

export default function ZoneManagementScreen({ route, navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', description: '', typeZone: 'jardin_cactus', 
    position3D: { x: 0, y: 0, z: 0 }
  });
  
  // Utiliser le token transmis lors de la connexion, ou une valeur de test
  const adminToken = route?.params?.token || "votre_token_jwt_ici";

  // Fetch zones on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getZones();
      setZones(data);
    } catch (error) {
      console.log('Error fetching zones from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper mapper to map backend enum types to our frontend design tokens
  const getZoneDesignProps = (typeZone) => {
    switch (typeZone) {
      case 'bassin':
        return { type: 'BASSIN', typeColor: '#B4EAA5', typeTextColor: '#127A3A', image: require('../../assets/bassin.png') };
      case 'jardin_bambou':
        return { type: 'BAMBOU', typeColor: '#E0DDD3', typeTextColor: '#68778D', image: require('../../assets/jardin-bambou.png') };
      case 'musee_berbere':
        return { type: 'MUSEE', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', image: require('../../assets/musee-berbere.png') };
      case 'villa_bleue':
        return { type: 'VILLA', typeColor: '#DCE4F8', typeTextColor: '#0A2B5E', image: require('../../assets/villa-bleue.png') };
      case 'jardin_cactus':
        return { type: 'CACTUS', typeColor: '#E0DDD3', typeTextColor: '#68778D', image: require('../../assets/jardin-cactus.png') };
      case 'boutique': case 'librairie': case 'cafe_majorelle': case 'cafe_bousafsaf':
        return { type: 'COMMERCIAL', typeColor: '#F0EFE9', typeTextColor: '#68778D', image: require('../../assets/boutique.jpg') };
      default:
        return { type: 'GARDEN', typeColor: '#EAE6D8', typeTextColor: '#0A2B5E', image: require('../../assets/villa-bleue.png') };
    }
  };

  const openModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        nom: zone.nom || '',
        description: zone.description || '',
        typeZone: zone.typeZone || 'jardin_cactus',
        position3D: {
          x: zone.position3D?.x || 0,
          y: zone.position3D?.y || 0,
          z: zone.position3D?.z || 0,
        }
      });
    } else {
      setEditingZone(null);
      setFormData({ nom: '', description: '', typeZone: 'jardin_cactus', position3D: { x: 0, y: 0, z: 0 } });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (editingZone) {
        await updateZone(editingZone._id, formData, adminToken);
      } else {
        await createZone(formData, adminToken);
      }
      setModalVisible(false);
      setLoading(true);
      fetchData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la zone');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer cette zone ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await deleteZone(id, adminToken);
            setLoading(true);
            fetchData();
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer la zone');
          }
        } 
      }
    ]);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
          <ArrowLeft color="#0A2B5E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JARDIN MAJORELLE</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Title Group */}
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>CONNECTED INFRASTRUCTURE</Text>
          <View>
            <Text style={styles.title}>Zone Management</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        {/* Top Cards block */}
        <View style={styles.totalZonesCard}>
          <Text style={styles.cardHeaderLight}>TOTAL ZONES</Text>
          <Text style={styles.cardHugeTextLight}>{zones.length < 10 ? `0${zones.length}` : zones.length}</Text>
          <Text style={styles.cardSubLight}>Synced from /api/zones</Text>
          {/* Watermark grid could be represented with absolute positioning, omitting for simplicity */}
        </View>

        <View style={styles.activeStatusCard}>
          <Text style={styles.cardHeaderDark}>ACTIVE STATUS</Text>
          <View style={styles.activeRow}>
            <Text style={styles.cardHugeTextDark}>18</Text>
            <Text style={styles.activeLabel}>Live</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        <View style={styles.rowCards}>
          <View style={styles.halfCard}>
            <Text style={styles.cardHeaderDark}>MAINTENANCE</Text>
            <Text style={styles.cardHugeTextDark}>04</Text>
            <View style={styles.scheduledRow}>
              <Calendar color="#868305" size={12} />
              <Text style={styles.scheduledText}>Scheduled for Week 42</Text>
            </View>
          </View>

          <View style={styles.halfCard}>
            <Text style={styles.cardHeaderDark}>HIDDEN ZONES</Text>
            <Text style={styles.cardHugeTextDark}>02</Text>
            <View style={styles.hiddenDotsRow}>
              <View style={[styles.dot, {backgroundColor: '#0A2B5E'}]} />
              <View style={[styles.dot, {backgroundColor: '#127A3A', marginLeft: -8}]} />
            </View>
          </View>
        </View>

        {/* List Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>Connected{'\n'}Zones</Text>
            <View style={styles.searchBox}>
              <Search color="#68778D" size={16} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search nomadic zones"
                placeholderTextColor="#8C9BB0"
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Filter color="#0A2B5E" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 2.5 }]}>ZONE NAME (NOM)</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5 }]}>TYPE{'\n'}(TYPE ZONE)</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0A2B5E" style={{ marginVertical: 30 }} />
          ) : (
            zones.map((zone, idx) => {
              const props = getZoneDesignProps(zone.typeZone);
              return (
                <View key={zone._id || idx} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2.5, flexDirection: 'row', alignItems: 'center' }]}>
                    <Image source={props.image} style={styles.rowImage} />
                    <View style={{marginLeft: 10, flex: 1}}>
                      <Text style={styles.rowName} numberOfLines={2}>{zone.nom}</Text>
                      <Text style={styles.rowId}>ID: {zone._id ? zone._id.substring(0, 8) : 'NEW'}</Text>
                    </View>
                  </View>

                  <View style={[styles.tableCell, { flex: 1.5, justifyContent: 'center' }]}>
                    <View style={[styles.badge, { backgroundColor: props.typeColor }]}>
                      <Text style={[styles.badgeText, { color: props.typeTextColor }]}>{props.type}</Text>
                    </View>
                  </View>

                  <View style={[styles.tableCell, { flex: 1, justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row', gap: 10 }]}>
                    <TouchableOpacity onPress={() => openModal(zone)}>
                        <Text style={{color: '#0A2B5E', fontSize: 10, fontWeight: '700'}}>EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(zone._id)}>
                        <Trash2 color="#D9534F" size={14} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.paginationRow}>
            <Text style={styles.showingText}>SHOWING {zones.length}</Text>
            <View style={styles.pageBtns}>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'<'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>{'>'}</Text></TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Spacer for bottom tab and FAB */}
        <View style={{height: 120}} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Plus color="#0A2B5E" size={24} />
      </TouchableOpacity>

      {/* CRUD Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingZone ? 'Modifier Zone' : 'Nouvelle Zone'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#0A2B5E" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Nom de la zone</Text>
              <TextInput 
                style={styles.modalInput} 
                value={formData.nom} 
                onChangeText={(text) => setFormData({...formData, nom: text})}
                placeholder="Ex: Le Grand Bassin"
              />

              <Text style={styles.inputLabel}>Type de zone</Text>
              <TextInput 
                style={styles.modalInput} 
                value={formData.typeZone} 
                onChangeText={(text) => setFormData({...formData, typeZone: text.toLowerCase()})}
                placeholder="Ex: bassin, jardin_cactus..."
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                style={[styles.modalInput, { height: 80 }]} 
                value={formData.description} 
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Description de la zone..."
                multiline
              />

              <Text style={styles.inputLabel}>Position 3D (X, Y, Z)</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextInput 
                  style={[styles.modalInput, {flex: 1, marginRight: 5}]} 
                  value={formData.position3D.x.toString()} 
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData({...formData, position3D: {...formData.position3D, x: parseFloat(text) || 0}})}
                  placeholder="X"
                />
                <TextInput 
                  style={[styles.modalInput, {flex: 1, marginHorizontal: 5}]} 
                  value={formData.position3D.y.toString()} 
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData({...formData, position3D: {...formData.position3D, y: parseFloat(text) || 0}})}
                  placeholder="Y"
                />
                <TextInput 
                  style={[styles.modalInput, {flex: 1, marginLeft: 5}]} 
                  value={formData.position3D.z.toString()} 
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData({...formData, position3D: {...formData.position3D, z: parseFloat(text) || 0}})}
                  placeholder="Z"
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAUVEGARDER</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F8F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 2,
  },
  backBtn: {
    backgroundColor: 'rgba(10, 43, 94, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#C5C90A',
    marginTop: 4,
  },
  totalZonesCard: {
    backgroundColor: '#004B9E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeaderLight: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  cardHugeTextLight: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    marginVertical: 10,
  },
  cardSubLight: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  activeStatusCard: {
    backgroundColor: '#60EE8A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  cardHeaderDark: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A2B5E',
    letterSpacing: 1,
  },
  cardHugeTextDark: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A2B5E',
    marginLeft: 10,
    marginTop: 15,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 10,
  },
  progressBarFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#0A2B5E',
    borderRadius: 2,
  },
  rowCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  halfCard: {
    backgroundColor: '#EAE6D8',
    width: '48%',
    borderRadius: 15,
    padding: 20,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scheduledText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#868305',
    marginLeft: 5,
  },
  hiddenDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  listSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2B5E',
    flex: 1,
  },
  searchBox: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFE9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#0A2B5E',
  },
  filterBtn: {
    backgroundColor: '#F0EFE9',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F8F4',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAE6D8',
  },
  tableColHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#68778D',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#F0EFE9',
  },
  tableCell: {
    // Basic structural styling handled inline
  },
  rowImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  hiddenIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0EFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  rowId: {
    fontSize: 9,
    color: '#8C9BB0',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F9F8F4',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  showingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#68778D',
    letterSpacing: 0.5,
  },
  pageBtns: {
    flexDirection: 'row',
  },
  pageBtn: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    backgroundColor: '#FFF',
  },
  pageBtnText: {
    fontSize: 12,
    color: '#68778D',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#B4B813',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B4B813',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 43, 94, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A2B5E',
  },
  modalForm: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68778D',
    marginBottom: 8,
    marginTop: 15,
  },
  modalInput: {
    backgroundColor: '#F0EFE9',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#0A2B5E',
  },
  saveBtn: {
    backgroundColor: '#0A2B5E',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  }
});
