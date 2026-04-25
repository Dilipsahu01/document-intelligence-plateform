from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import BookViewSet, BookRecommendationView, ChatView

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')

urlpatterns = [
    path('', include(router.urls)),
    path('books/<int:pk>/recommendations/', BookRecommendationView.as_view(), name='book-recommendations'),
    path('chat/', ChatView.as_view(), name='book-chat'),
    
    # NEW: The scrape endpoint
    path('scrape/', views.trigger_scraping, name='trigger_scrape'),
]
