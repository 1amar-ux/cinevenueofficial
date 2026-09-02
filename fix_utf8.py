with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

# Replace any non-utf8 characters
content = content.decode('utf-8', 'ignore').encode('utf-8')

with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(content)
