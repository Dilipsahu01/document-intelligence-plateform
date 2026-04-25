import os
import sys
import time
import django
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# ==========================================
# Django Setup
# ==========================================
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Book 

def scrape_books(num_pages=2):
    print(f"🚀 Starting Multi-Page Scraper for {num_pages} page(s)...")
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        book_urls = []
        
        # 1. Loop through multiple pages to collect URLs
        for page in range(1, num_pages + 1):
            if page == 1:
                page_url = "https://books.toscrape.com/index.html"
            else:
                page_url = f"https://books.toscrape.com/catalogue/page-{page}.html"
                
            print(f"📄 Scraping Page {page}: {page_url}")
            driver.get(page_url)
            time.sleep(1) # Be polite to the server

            book_links = driver.find_elements(By.CSS_SELECTOR, "article.product_pod h3 a")
            page_urls = [link.get_attribute("href") for link in book_links]
            book_urls.extend(page_urls)

        print(f"🔗 Found {len(book_urls)} total book URLs. Extracting details...")

        rating_map = {"One": 1.0, "Two": 2.0, "Three": 3.0, "Four": 4.0, "Five": 5.0}
        books_added = 0

        # 2. Navigate to each book's detail page
        for i, url in enumerate(book_urls):
            driver.get(url)
            
            # Extract Title
            title = driver.find_element(By.CSS_SELECTOR, ".product_main h1").text
            
            # Extract Rating
            rating_element = driver.find_element(By.CSS_SELECTOR, ".product_main p.star-rating")
            class_names = rating_element.get_attribute("class").split()
            rating_text = [cls for cls in class_names if cls != "star-rating"][0]
            rating = rating_map.get(rating_text, 0.0)
            
            # Extract Price
            try:
                price = driver.find_element(By.CSS_SELECTOR, "p.price_color").text
            except NoSuchElementException:
                price = "N/A"
                
            # Extract Availability
            try:
                availability = driver.find_element(By.CSS_SELECTOR, "p.availability").text.strip()
            except NoSuchElementException:
                availability = "Unknown"
            
            # Extract Description
            try:
                description_element = driver.find_element(By.XPATH, "//div[@id='product_description']/following-sibling::p")
                description = description_element.text
            except NoSuchElementException:
                description = "No description available."

            # Save to Database with new fields
            book, created = Book.objects.get_or_create(
                url=url, # We use the URL as the unique identifier
                defaults={
                    'title': title,
                    'rating': rating,
                    'price': price,
                    'availability': availability,
                    'description': description,
                    'author': "Unknown", # books.toscrape does not list authors
                    'status': "pending"
                }
            )
            
            if created:
                print(f"✅ Added [{i+1}/{len(book_urls)}]: {title} | {price}")
                books_added += 1
            else:
                print(f"⚠️ Skipped [{i+1}/{len(book_urls)}] (Already exists): {title}")

        return books_added

    finally:
        driver.quit()

if __name__ == "__main__":
    print("Starting the scraper...")
    # Scrape 2 pages (40 books) by default
    added_count = scrape_books(num_pages=2)
    print(f"🎉 Scraping completed! {added_count} new books added to the database.")
