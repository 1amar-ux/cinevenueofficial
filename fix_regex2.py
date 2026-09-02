import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('</button>onClick', '</button>\n                  <button\n                    type="button"\n                    onClick')
content = content.replace('</button>\nonClick', '</button>\n                  <button\n                    type="button"\n                    onClick')

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
