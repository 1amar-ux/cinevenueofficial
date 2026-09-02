import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Fix 1
content = re.sub(r'<button\s+<button', '<button', content)
content = re.sub(r'</button>onClick', '</button>\n                  <button onClick', content)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
