with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

# Replace the last `    </div>\n  );\n}\n` with `      </div>\n    </div>\n  );\n}\n`
new_end = b"      </div>\n    </div>\n  );\n}\n"

# I will just write a python script to pop the last 3 lines and add the new ones
lines = content.split(b'\n')
while not lines[-1].strip():
    lines.pop()

if lines[-1] == b'}':
    lines.pop()
if lines[-1] == b'  );':
    lines.pop()
if lines[-1].strip() == b'</div>':
    lines.pop()

new_content = b'\n'.join(lines) + b'\n      </div>\n    </div>\n  );\n}\n'
with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(new_content)

print("Added missing closing divs.")
