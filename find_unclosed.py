from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.ignore = ['img', 'br', 'hr', 'input', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'Database', 'X']

    def handle_starttag(self, tag, attrs):
        if tag not in self.ignore and tag[0].islower():
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag not in self.ignore and tag[0].islower():
            if not self.stack:
                print("Error: empty stack for", tag)
            elif self.stack[-1] == tag:
                self.stack.pop()
            else:
                pass

parser = MyHTMLParser()
with open('src/components/AdminPanel.tsx', 'r') as f:
    # Just a rough parse
    try:
        parser.feed(f.read())
    except:
        pass
print("Unclosed tags:", parser.stack[-20:])
