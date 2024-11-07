import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAuth } from '../context/AuthContext'; // Zakładam, że kontekst jest dostępny

const Post = ({ post }) => {
    const { user } = UserAuth(); // Pobranie danych o użytkowniku z kontekstu
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const commentsSnapshot = await getDocs(collection(db, `posts/${post.id}/comments`));
            const fetchedComments = [];
            commentsSnapshot.forEach(doc => {
                fetchedComments.push({ id: doc.id, ...doc.data() });
            });
            setComments(fetchedComments);
        } catch (error) {
            console.error("Błąd przy pobieraniu komentarzy:", error);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        const comment = {
            text: newComment,
            createdAt: new Date(),
            userId: user?.uid || 'anonymous', // Dodanie userId do komentarza
            userName: user?.displayName || 'anonymous'
        };

        try {
            await addDoc(collection(db, `posts/${post.id}/comments`), comment);
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error("Błąd przy dodawaniu komentarza:", error);
        }
    };

    return (
        <View style={styles.postContainer}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>
            {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.image} />
            ) : null}
            <Text style={styles.date}>
                {new Date(post.createdAt.seconds * 1000).toLocaleDateString()} {post?.userName || 'anonymous'}
            </Text>

            <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Komentarze:</Text>
                <ScrollView style={styles.commentsList}>
                    {comments.map(comment => (
                        <Text key={comment.id} style={styles.comment}>
                            <Text style={styles.commentUser}>{comment.userName || 'anonymous'}: </Text>
                            {comment.text}
                        </Text>
                    ))}
                </ScrollView>

                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Dodaj komentarz..."
                    style={styles.commentInput}
                />
                <TouchableOpacity onPress={addComment} style={styles.addCommentButton}>
                    <Text style={styles.addCommentButtonText}>Dodaj</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    postContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    commentsSection: {
        marginTop: 16,
    },
    commentsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentsList: {
        maxHeight: 150,
        marginTop: 8,
        marginBottom: 8,
    },
    comment: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    commentUser: {
        fontWeight: 'bold',
    },
    commentInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    addCommentButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addCommentButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Post;
