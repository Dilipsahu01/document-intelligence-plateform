import uuid
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

# Initialize ChromaDB PersistentClient
client = chromadb.PersistentClient(path="./chroma_storage")

# 1. Initialize the model explicitly in OFFLINE mode
# This stops it from pinging HuggingFace!
try:
    _local_model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
except Exception as e:
    # Fallback just in case the cache got cleared during your DB reset
    print("Local model not found, downloading once...")
    _local_model = SentenceTransformer("all-MiniLM-L6-v2")


# 2. Create a custom Embedding Function for ChromaDB
class LocalSentenceTransformer(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        # Encode the documents into vectors
        embeddings = _local_model.encode(input).tolist()
        return embeddings

# Initialize our custom function
custom_ef = LocalSentenceTransformer()

# 3. Get or create the 'books' collection using the custom OFFLINE function
collection = client.get_or_create_collection(
    name="books", 
    embedding_function=custom_ef
)

def store_chunks(book_id, text):
    """
    Splits the provided text into chunks and stores them in ChromaDB 
    with the associated book_id as metadata.
    """
    if not text:
        return

    # Initialize Langchain's RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=80,
    )

    # Split the text
    chunks = text_splitter.split_text(text)

    if not chunks:
        return

    # Prepare data arrays for ChromaDB insertion
    documents = chunks
    metadatas = [{"book_id": str(book_id)} for _ in chunks]
    
    # Generate unique IDs for each chunk (e.g., bookId_chunk_0, bookId_chunk_1)
    ids = [f"{book_id}_chunk_{i}" for i in range(len(chunks))]

    # Insert into the collection
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
