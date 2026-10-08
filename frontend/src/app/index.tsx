import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

const BASE_IP = '192.168.100.157';
const API_URL = `http://${BASE_IP}:3000/api/posts`;

interface PostItem {
  id: number | string;
  title: string;
  content: string;
  image?: string;
}

const EMOJI_LIST = ['💻', '📱', '🚀', '📚', '☕', '⚡', '🎮', '💡', '🔥', '🎨'];

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [titleInput, setTitleInput] = useState<string>('');
  const [contentInput, setContentInput] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('💻');

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      if (json.data && Array.isArray(json.data)) {
        setPosts(json.data);
      } else if (Array.isArray(json)) {
        setPosts(json);
      }
    } catch (error) {
      Alert.alert('Koneksi Gagal', 'Gagal terhubung ke Express server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPost(null);
    setTitleInput('');
    setContentInput('');
    setSelectedEmoji('💻');
    setModalVisible(true);
  };

  const handleOpenEditModal = (item: PostItem) => {
    setEditingPost(item);
    setTitleInput(item.title);
    setContentInput(item.content);
    if (item.image && !item.image.startsWith('http') && item.image !== 'default.png') {
      setSelectedEmoji(item.image);
    } else {
      setSelectedEmoji('💻');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!titleInput.trim() || !contentInput.trim()) {
      Alert.alert('Peringatan', 'Judul dan konten wajib diisi!');
      return;
    }

    const payload = {
      title: titleInput,
      content: contentInput,
      image: selectedEmoji,
    };

    try {
      let response;
      if (editingPost) {
        response = await fetch(`${API_URL}/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const resJson = await response.json();

      if (response.ok || resJson.success) {
        Alert.alert('Berhasil', editingPost ? 'Data diperbarui!' : 'Data ditambahkan!');
        setModalVisible(false);
        fetchPosts();
      } else {
        Alert.alert('Gagal', resJson.message || 'Gagal menyimpan data.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal terhubung ke server.');
    }
  };

  const handleDelete = (id: number | string, title: string) => {
    Alert.alert('Hapus Posting', `Apakah kamu yakin ingin menghapus "${title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
              fetchPosts();
            }
          } catch (error) {
            Alert.alert('Error', 'Gagal menghapus data.');
          }
        },
      },
    ]);
  };

  const renderEmoji = (img?: string) => {
    if (img && !img.startsWith('http') && img !== 'default.png') {
      return img;
    }
    return '📌';
  };

  const renderItem = ({ item }: { item: PostItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.emojiBadge}>
          <Text style={styles.emojiBadgeText}>{renderEmoji(item.image)}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>ID: #{item.id}</Text>
        </View>
      </View>

      <Text style={styles.cardContent}>{item.content}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.btnEdit} onPress={() => handleOpenEditModal(item)}>
          <Text style={styles.btnEditText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id, item.title)}>
          <Text style={styles.btnDeleteText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Rapi di Tengah */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tutorial Express + React Native</Text>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPosts} colors={['#6366F1']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Belum ada data postingan.</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAddModal} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{editingPost ? '✏️ Edit Post' : '✨ Post Baru'}</Text>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={styles.inputLabel}>Pilih Icon Emoji</Text>
                  <View style={styles.emojiGrid}>
                    {EMOJI_LIST.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.emojiChip, selectedEmoji === emoji && styles.emojiChipSelected]}
                        onPress={() => setSelectedEmoji(emoji)}
                      >
                        <Text style={styles.emojiChipText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Judul Post</Text>
                  <TextInput
                    style={styles.input}
                    value={titleInput}
                    onChangeText={setTitleInput}
                    placeholder="Masukkan judul..."
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.inputLabel}>Isi Konten</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={contentInput}
                    onChangeText={setContentInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Masukkan konten..."
                    placeholderTextColor="#94A3B8"
                  />
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.btnCancelModal} onPress={() => setModalVisible(false)}>
                    <Text style={styles.btnCancelModalText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSaveModal} onPress={handleSave}>
                    <Text style={styles.btnSaveModalText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', textAlign: 'center' },

  listContainer: { padding: 18, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emojiBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiBadgeText: { fontSize: 24, textAlign: 'center', includeFontPadding: false },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  cardSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  cardContent: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },

  btnEdit: { backgroundColor: '#EEF2FF', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  btnEditText: { color: '#4338CA', fontSize: 12, fontWeight: '600' },
  btnDelete: { backgroundColor: '#FEF2F2', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  btnDeleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -2 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#94A3B8', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  keyboardAvoidingView: { width: '100%' },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: 520 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 10 },

  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emojiChipSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1', borderWidth: 2 },
  emojiChipText: { fontSize: 20, textAlign: 'center', includeFontPadding: false },

  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  textArea: { height: 80, textAlignVertical: 'top' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  btnCancelModal: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  btnCancelModalText: { color: '#475569', fontWeight: '700' },
  btnSaveModal: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#6366F1', alignItems: 'center' },
  btnSaveModalText: { color: '#FFFFFF', fontWeight: '700' },
});