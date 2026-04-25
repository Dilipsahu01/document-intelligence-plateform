# Document Intelligence Platform

A full-stack ecosystem designed to transform unstructured book data into searchable, actionable insights using Retrieval-Augmented Generation (RAG).

## Overview
The Document Intelligence Platform automates the process of book data collection and utilizes Large Language Models (LLMs) to provide semantic search, automated summaries, and sentiment analysis. The system is designed with a decoupled architecture, prioritizing data privacy through local LLM integration.

## Technical Stack
* **Frontend:** Next.js, Tailwind CSS, TypeScript
* **Backend:** Django REST Framework (DRF)
* **Database:** MySQL (Relational Metadata), ChromaDB (Vector Store)
* **AI/ML:** RAG Pipeline, LM Studio (Local LLM), Selenium (Automated Scraping)

## Key Features
* **Automated Data Ingestion:** Utilizes Selenium to scrape and normalize book data from external sources.
* **Retrieval-Augmented Generation:** A context-aware interface for querying the library with responses grounded in the source text.
* **Automated AI Insights:** Generates high-level summaries, genre classifications, and sentiment arc analysis.
* **Privacy-Centric Architecture:** Supports local LLM hosting via LM Studio to ensure data sovereignty.

## Project Structure
* `/backend`: Contains the Django API, AI service layer, and vector database management.
* `/frontend`: Contains the Next.js application, dashboard components, and chat interface.

## Installation and Setup

### Backend
1. Navigate to the backend directory and install dependencies:
   `pip install -r requirements.txt`
2. Configure the `.env` file with database credentials and LM Studio endpoint details.
3. Execute database migrations:
   `python manage.py migrate`
4. Start the development server:
   `python manage.py runserver`

### Frontend
1. Navigate to the frontend directory and install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`

## Author
**Dilip Sahu** Bachelor of Technology in Computer Science and Engineering  
National Institute of Technology (NIT) Mizoram
