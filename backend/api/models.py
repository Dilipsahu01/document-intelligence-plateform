from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, default="Unknown") # Author option available
    url = models.URLField(max_length=500, unique=True)
    rating = models.FloatField(default=0.0)
    description = models.TextField(blank=True, null=True)
    
    # NEW FIELDS:
    price = models.CharField(max_length=50, blank=True, null=True)
    availability = models.CharField(max_length=100, blank=True, null=True)
    
    # AI Fields
    summary = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    sentiment = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default="pending")

    def __str__(self):
        return self.title
