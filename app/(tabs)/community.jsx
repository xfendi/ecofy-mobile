import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, KeyboardAvoidingView, Platform, Modal, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import AppTextInput from "../../components/AppTextInput";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { UserAuth } from "../../context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Post from '../../components/PostItem';

const Community = () => {
    const { user } = UserAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);
    const [posts, setPosts] = useState([]);
    const [createSheet, setCreateSheet] = useState(false);
    const storage = getStorage();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'posts'));
            const fetchedPosts = [];
            querySnapshot.forEach(doc => {
                fetchedPosts.push({ id: doc.id, ...doc.data() });
            });
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Błąd przy pobieraniu postów:", error);
            Alert.alert('Błąd', 'Nie udało się pobrać postów.');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!photo) return null;

        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const storageRef = ref(storage, `images/${Date.now()}`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Błąd przy przesyłaniu zdjęcia:", error);
            Alert.alert('Błąd', 'Nie udało się przesłać zdjęcia.');
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Błąd', 'Proszę uzupełnić tytuł oraz opis.');
            return;
        }

        try {
            const imageUrl = await uploadImage();
            const post = {
                title,
                description,
                imageUrl: imageUrl || '',
                createdAt: new Date(),
                userId: user?.uid || 'anonymous',
                userName: user?.displayName || 'anonymous'
            };

            await addDoc(collection(db, 'posts'), post);
            Alert.alert('Sukces', 'Post został dodany pomyślnie!');
            setTitle('');
            setDescription('');
            setPhoto(null);
            setCreateSheet(false);
            fetchPosts();
        } catch (error) {
            console.error("Błąd przy dodawaniu posta:", error);
            Alert.alert('Błąd', 'Nie udało się dodać posta.');
        }
    };

    const openBottomSheet = () => {
        setCreateSheet(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={{marginBottom: 50}}>
                <TouchableOpacity onPress={openBottomSheet} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Dodaj Post</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold" style={{ marginTop: 15 }}>Posty</Text>
                <View style={styles.postsContainer}>
                    {posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </View>
            </ScrollView>

            {/* Modal for Creating Post */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createSheet}
                onRequestClose={() => setCreateSheet(false)}
            >
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.bottomSheetContent}>
                            <Text style={styles.header}>Tworzenie posta</Text>
                            <AppTextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Podaj tytuł"
                                style={styles.input}
                            />
                            <AppTextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Dodaj treść"
                                style={[styles.input, { height: 100 }]}
                                multiline
                            />

                            <TouchableOpacity onPress={pickImage} style={styles.button}>
                                <Text style={styles.buttonText}>Wybierz zdjęcie (opcjonalne)</Text>
                            </TouchableOpacity>

                            {photo && (
                                <Image
                                    source={{ uri: photo }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            )}

                            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                                <Text style={styles.submitButtonText}>Dodaj</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setCreateSheet(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome name="times" size={14} color="white" />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,

    },
    scrollViewContent: {
        padding: 16,
    },
    postsContainer: {
        marginTop: 20,
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    bottomSheetContent: {
        paddingBottom: 50,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 16,
    },
});

export default Community;
