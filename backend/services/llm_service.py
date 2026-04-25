import os
import sys
import django
import json
from openai import OpenAI
from django.db import transaction

# ==========================================
# Django Setup
# ==========================================
# Add the 'backend' directory to Python's path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Absolute imports for your Django apps
from api.models import Book
from services import vector_db

# Initialize standard OpenAI client for LM Studio
client = OpenAI(
    base_url="http://localhost:1234/v1", 
    api_key="lm-studio"
)

def process_pending_books():
    pending_books = Book.objects.filter(status='pending')
    
    if not pending_books.exists():
        print("No pending books found to process.")
        return

    print(f"Found {pending_books.count()} books to process. Starting AI extraction...")

    for book in pending_books:
        description = book.description
        
        if not description:
            print(f"Skipping '{book.title}' - No description.")
            continue

        # UPDATED PROMPT: Added 'author' key
        prompt = (
            "Analyze the following book description and output a strictly formatted JSON object. "
            "The JSON object must contain exactly four keys: 'summary', 'genre', 'sentiment', and 'author'. "
            "For 'author', try to find the person who wrote the book mentioned in the text. If not found, use 'Unknown'. "
            "Do not include any markdown styling or conversational filler.\n\n"
            f"Description: {description}"
        )

        try:
            print(f"Processing: {book.title}...")
            response = client.chat.completions.create(
                model="local-model",
                messages=[
                    {"role": "system", "content": "You are a helpful data-extraction assistant that strictly outputs JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
            )

            raw_content = response.choices[0].message.content
            parsed_data = json.loads(raw_content)

            with transaction.atomic():
                book.summary = parsed_data.get('summary', '')
                book.genre = parsed_data.get('genre', '')
                book.sentiment = parsed_data.get('sentiment', '')
                # UPDATED: Saving the AI-extracted author
                book.author = parsed_data.get('author', 'Unknown')
                book.status = 'processed'
                book.save()

            vector_db.store_chunks(book.id, description)
            print(f"Successfully processed and embedded: {book.title}")

        except Exception as e:
            print(f"An error occurred while processing Book ID {book.id}: {str(e)}")

if __name__ == "__main__":
    process_pending_books()
    print("All processing complete!")
