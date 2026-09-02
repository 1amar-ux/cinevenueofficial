with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('{r.eventName}', '{r.eventTitle}')
content = content.replace('Tickets: {r.tickets}', 'Tickets: {r.quantity}')
content = content.replace('export default AdminPanel;\n', '')

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed!")
