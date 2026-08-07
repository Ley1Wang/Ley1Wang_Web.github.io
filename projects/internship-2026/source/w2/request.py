import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from w1.sql import MySqlHelper

class BaiduHotCrawler:
    def __init__(self):
        self.url = "https://top.baidu.com/board?tab=realtime"
        self.headers = {
            "User-Agent": "Mozilla/5.0"
        }

        self.table = MySqlHelper()
        self.table.CREATE("title", "url", "desc", "hot")

    def get_soup(self):
        response = requests.get(
            self.url,
            headers=self.headers,
            timeout=10
        )
        response.raise_for_status()

        return BeautifulSoup(response.text, "html.parser")

    def parse(self, soup):
        items = soup.select('a[class*="title_"][href]')

        for item in items:
            article = item.select_one(".c-single-text-ellipsis")

            if article is None:
                continue

            title = article.get_text(strip=True)
            article_url = urljoin(self.url, item["href"])

            container = item.find_parent("div")
            desc_tag = container.select_one('[class*="hot-desc_"]')
            hot_tag = container.select_one('[class*="hot-index_"]')

            desc = desc_tag.get_text(strip=True) if desc_tag else ""
            hot = hot_tag.get_text(strip=True) if hot_tag else ""

            self.table.INSERT(title, article_url, desc, hot)

    def save(self, filename):
        self.table.SAVE(filename)

    def run(self):
        soup = self.get_soup()
        self.parse(soup)
        self.save("baidu_hot.json")

        print(self.table.SELECT())


if __name__ == "__main__":
    crawler = BaiduHotCrawler()
    crawler.run()