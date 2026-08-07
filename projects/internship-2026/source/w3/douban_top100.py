import json
import re
import requests
from bs4 import BeautifulSoup

class MovieJsonTable:
    def __init__(self):
        self.movies = []

    def insert(self, movie):
        self.movies.append(movie)

    def save(self, filename):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.movies, f, ensure_ascii=False, indent=4)

    def select(self):
        return self.movies

class DoubanCrawler:
    def __init__(self):
        self.url = "https://movie.douban.com/top250"
        self.headers = {"User-Agent": "Mozilla/5.0"}
        self.table = MovieJsonTable()

    def get_soup(self, start):
        response = requests.get(
            self.url,
            params={"start": start},
            headers=self.headers,
            timeout=10,
        )
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")

    def parse(self, soup):
        items = soup.select(".grid_view .item")

        for item in items:
            rank_tag = item.select_one(".pic em")
            title_tag = item.select_one(".hd .title")
            url_tag = item.select_one(".hd a")
            rating_tag = item.select_one(".rating_num")
            info_tag = item.select_one(".bd p")
            star_tag = item.select_one(".star")

            rank = int(rank_tag.text) if rank_tag else 0
            title = title_tag.text if title_tag else ""
            url = url_tag["href"] if url_tag else ""
            rating = float(rating_tag.text) if rating_tag else 0

            info = info_tag.get_text(" ", strip=True) if info_tag else ""
            year_match = re.search(r"\d{4}", info)
            year = int(year_match.group()) if year_match else None

            parts = [part.strip() for part in info.split("/") if part.strip()]
            category = parts[-1] if parts else ""

            comment_text = star_tag.get_text(" ", strip=True) if star_tag else ""
            comment_match = re.search(r"\d+", comment_text)
            comment_count = int(comment_match.group()) if comment_match else 0

            movie = {
                "rank": rank,
                "title": title,
                "year": year,
                "rating": rating,
                "comment_count": comment_count,
                "category": category,
                "url": url,
            }

            self.table.insert(movie)

    def save(self, filename):
        self.table.save(filename)

    def run(self):
        for start in range(0, 100, 25):
            soup = self.get_soup(start)
            self.parse(soup)

        self.table.movies = self.table.movies[:100]
        self.save("douban_top100.json")
        print(self.table.select())

if __name__ == "__main__":
    crawler = DoubanCrawler()
    crawler.run()
