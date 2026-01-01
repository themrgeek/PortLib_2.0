import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  ActivityIndicator,
  Searchbar,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Chip,
  IconButton,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import booksService from "../../services/books.service";
import { COLORS, BOOK_CONDITIONS } from "../../utils/constants";

const CONDITION_COLORS = {
  new: "#4caf50",
  good: "#2196f3",
  fair: "#ff9800",
  poor: "#f44336",
};

function BooksManagement({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "1",
    publisher: "",
    publication_year: "",
    description: "",
    location: "",
    shelf_number: "",
    condition: "good",
    price: "",
  });

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      const currentPage = loadMore ? page + 1 : 1;
      
      const data = await booksService.getBooks({
        page: currentPage,
        limit: 20,
        search: search || undefined,
      });
      
      if (loadMore) {
        setBooks((prev) => [...prev, ...(data.books || [])]);
      } else {
        setBooks(data.books || []);
      }
      
      setPage(currentPage);
      setHasMore(currentPage < (data.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Fetch books error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchBooks();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBooks(true);
    }
  };

  const openAddDialog = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      quantity: "1",
      publisher: "",
      publication_year: "",
      description: "",
      location: "",
      shelf_number: "",
      condition: "good",
      price: "",
    });
    setCoverImage(null);
    setDialogOpen(true);
  };

  const openEditDialog = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "",
      quantity: String(book.quantity || 1),
      publisher: book.publisher || "",
      publication_year: book.publication_year ? String(book.publication_year) : "",
      description: book.description || "",
      location: book.location || "",
      shelf_number: book.shelf_number || "",
      condition: book.condition || "good",
      price: book.price ? String(book.price) : "",
    });
    setCoverImage(null);
    setDialogOpen(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.author) {
      Alert.alert("Error", "Title and Author are required");
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      if (coverImage) {
        data.append("cover_image", {
          uri: coverImage.uri,
          type: "image/jpeg",
          name: "cover.jpg",
        });
      }

      if (editingBook) {
        await booksService.updateBook(editingBook.id, data);
        Alert.alert("Success", "Book updated successfully");
      } else {
        await booksService.createBook(data);
        Alert.alert("Success", "Book added successfully");
      }

      setDialogOpen(false);
      fetchBooks();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = (book) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await booksService.deleteBook(book.id);
              Alert.alert("Success", "Book deleted successfully");
              fetchBooks();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || "Failed to delete");
            }
          },
        },
      ]
    );
  };

  const renderBook = ({ item }) => (
    <Card style={styles.bookCard}>
      <Card.Content>
        <View style={styles.bookRow}>
          {item.cover_image_url ? (
            <Avatar.Image
              size={60}
              source={{ uri: item.cover_image_url }}
              style={styles.bookCover}
            />
          ) : (
            <Avatar.Icon
              size={60}
              icon="book"
              style={styles.bookCover}
            />
          )}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>
            <View style={styles.bookMeta}>
              <Chip
                compact
                style={[
                  styles.conditionChip,
                  { backgroundColor: CONDITION_COLORS[item.condition] },
                ]}
                textStyle={{ color: "#fff", fontSize: 10 }}
              >
                {item.condition}
              </Chip>
              <Text style={styles.bookQty}>
                {item.available_count}/{item.quantity}
              </Text>
            </View>
          </View>
          <View style={styles.bookActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditDialog(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor="#f44336"
              onPress={() => handleDelete(item)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.gradient1, COLORS.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Books Management</Text>
        <Text style={styles.headerSubtitle}>
          {books.length} books in library
        </Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search books..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />
      </View>

      {/* Books List */}
      {loading && books.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No books found</Text>
          }
          ListFooterComponent={
            loading && books.length > 0 ? (
              <ActivityIndicator style={{ padding: 20 }} />
            ) : null
          }
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddDialog}
        color="#fff"
      />

      {/* Add/Edit Dialog */}
      <Portal>
        <Dialog
          visible={dialogOpen}
          onDismiss={() => setDialogOpen(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            {editingBook ? "Edit Book" : "Add New Book"}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              <TextInput
                mode="outlined"
                label="Title *"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Author *"
                value={formData.author}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, author: text }))
                }
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="ISBN"
                value={formData.isbn}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, isbn: text }))
                }
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Category"
                value={formData.category}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, category: text }))
                }
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Quantity"
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, quantity: text }))
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Location"
                value={formData.location}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, location: text }))
                }
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="Shelf Number"
                value={formData.shelf_number}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, shelf_number: text }))
                }
                style={styles.input}
              />
              <View style={styles.conditionSelector}>
                <Text style={styles.conditionLabel}>Condition:</Text>
                <View style={styles.conditionButtons}>
                  {Object.keys(BOOK_CONDITIONS).map((key) => (
                    <Chip
                      key={key}
                      selected={formData.condition === BOOK_CONDITIONS[key]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          condition: BOOK_CONDITIONS[key],
                        }))
                      }
                      style={styles.conditionOption}
                    >
                      {key}
                    </Chip>
                  ))}
                </View>
              </View>
              <Button
                mode="outlined"
                icon="camera"
                onPress={pickImage}
                style={styles.uploadButton}
              >
                {coverImage ? "Image Selected" : "Upload Cover"}
              </Button>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              buttonColor={COLORS.primary}
            >
              {editingBook ? "Update" : "Add"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  bookCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookCover: {
    backgroundColor: "#ddd",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  conditionChip: {
    height: 22,
  },
  bookQty: {
    fontSize: 12,
    color: "#999",
  },
  bookActions: {
    flexDirection: "row",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 40,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },
  dialog: {
    maxHeight: "80%",
  },
  dialogScroll: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  conditionSelector: {
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  conditionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conditionOption: {
    marginRight: 4,
  },
  uploadButton: {
    marginBottom: 16,
  },
});

export default BooksManagement;

