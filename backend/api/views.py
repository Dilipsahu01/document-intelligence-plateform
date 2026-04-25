import os
import sys
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from openai import OpenAI
from sentence_transformers import SentenceTransformer

from .models import Book
from .serializers import BookSerializer
from services import vector_db

# Allow import from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.scraper import scrape_books

# Initialize shared resources
llm_client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")
embed_model = SentenceTransformer('all-MiniLM-L6-v2', local_files_only=True)

class BookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class BookRecommendationView(APIView):
    def get(self, request, pk):
        target_book = get_object_or_404(Book, pk=pk)
        
        # 1. Embed description
        query_embedding = embed_model.encode(target_book.description).tolist()

        # 2. Query ChromaDB
        results = vector_db.collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            include=['metadatas']
        )

        recommended_ids = []
        if results['metadatas']:
            for meta in results['metadatas'][0]:
                bid = int(meta['book_id'])
                if bid != target_book.id and bid not in recommended_ids:
                    recommended_ids.append(bid)
                if len(recommended_ids) == 3: break

        # 3. Fetch and return
        books = Book.objects.filter(id__in=recommended_ids)
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

class ChatView(APIView):
    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({"error": "Query required"}, status=400)

        # ==========================================
        # NEW FIX 1: The Greeting Bypass
        # Catch casual greetings BEFORE they hit the database
        # so it doesn't attach random "Sources" to a "Hello"
        # ==========================================
        clean_query = query.strip().lower()
        import re
        # Remove basic punctuation to catch "hello!" or "hi?"
        clean_query = re.sub(r'[^\w\s]', '', clean_query) 
        
        if clean_query in ['hi', 'hello', 'hey', 'how are you', 'sup', 'good morning', 'good evening']:
            return Response({
                "answer": "Hello! I am your Library Assistant. What kind of books are you looking for today?",
                "sources": [] # Explicitly return NO sources
            })

        # 1. RAG Retrieval
        query_embedding = embed_model.encode(query).tolist()
        results = vector_db.collection.query(
            query_embeddings=[query_embedding],
            n_results=3,
            include=['documents', 'metadatas']
        )

        context_list = results['documents'][0]
        source_ids = list(set([int(m['book_id']) for m in results['metadatas'][0]]))
        context_text = "\n".join(context_list)
        
        # ==========================================
        # NEW FIX 2: The "Direct & Confident" Prompt
        # Bans greetings and forces it to pick a book
        # ==========================================
        prompt = f"""
        You are a professional, direct Library Assistant. Help users find books ONLY from your specific library database.

        LIBRARY CONTEXT (Your only source of truth):
        {context_text}

        USER'S MESSAGE: "{query}"

        STRICT RULES:
        1. NO GREETINGS: Do NOT say "Hello", "Welcome", or "Hi". Dive straight into the answer.
        2. GROUNDING: ONLY suggest books listed in the LIBRARY CONTEXT. Do not invent books.
        3. UNAVAILABLE REQUESTS: If the user asks for a specific genre/language not in the context (like "Hindi poetry"), say: "I'm sorry, we don't have any books matching that in our current collection." Do not recommend unrelated books.
        4. GENERIC REQUESTS: If the user asks for "any book", "a good book", or the "best book", confidently pick the first book from the CONTEXT, recommend it highly, and explain what it is about.

        ANSWER:
        """
        
        try:
            response = llm_client.chat.completions.create(
                model="local-model",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            answer = response.choices[0].message.content
            
            # Fetch the actual book objects to return as sources
            sources = Book.objects.filter(id__in=source_ids)
            
            return Response({
                "answer": answer,
                "sources": BookSerializer(sources, many=True).data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# ==========================================
# NEW: Scraping Trigger Endpoint
# ==========================================
@api_view(['POST'])
def trigger_scraping(request):
    """
    Triggers the Selenium Scraper to get new books.
    """
    try:
        pages = int(request.data.get('pages', 1))
        books_added = scrape_books(num_pages=pages)
        
        return Response({
            "message": "Scraping pipeline executed successfully.",
            "books_added": books_added,
            "status": "success"
        }, status=200)
    except Exception as e:
        return Response({
            "error": str(e),
            "status": "failed"
        }, status=500)
