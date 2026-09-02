with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

lines = content.split(b'\n')
while not lines[-1].strip():
    lines.pop()

if lines[-1] == b'}':
    lines.pop()
if lines[-1] == b'  );':
    lines.pop()
while lines[-1].strip() == b'</div>':
    lines.pop()

new_content = b'\n'.join(lines) + b'\n        </div>\n      </div>\n    </div>\n  );\n}\n'
with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(new_content)

print("Added 3 missing closing divs.")
