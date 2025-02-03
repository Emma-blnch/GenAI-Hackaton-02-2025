from PyPDF2 import PdfReader
import re

# this needs to be replaced with uploaded PDF
reader = PdfReader("Revue-Médias - DR Nord-Pas-de-Calais du 02012025.pdf")
number_of_pages = len(reader.pages)
page_num = 0

article_page = []
loop = 1
index_start = 0
while loop and page_num <= number_of_pages:
    page = reader.pages[page_num]
    text = page.extract_text()
    if "Page " in text:
        index_start = 1
        article_index1 = [m.start() for m in re.finditer('Page ', text)]
        for pp in article_index1:
            article_page.append(int(text[pp+5:pp+7:1]))
    elif index_start:
        loop = 0
    page_num = page_num + 1

# have page numbers of all articles in article_page list
num_articles = len(article_page)
pp = 0
p1 = 0
while pp <= num_articles - 1:
    p1 = pp
    page = reader.pages[article_page[pp]]
    text = page.extract_text()
    while pp < num_articles - 1 and article_page[pp + 1] > article_page[p1] + 1:
        p1 = p1 + 1
        page = reader.pages[article_page[p1]]
        text = text + page.extract_text()

    pp = pp + 1


