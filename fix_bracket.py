with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

num_open = content.count('<div')
num_close = content.count('</div')
print('AdminPanel <div:', num_open, '</div:', num_close)

num_open_brace = content.count('{')
num_close_brace = content.count('}')
print('AdminPanel {:', num_open_brace, '}:', num_close_brace)

num_open_paren = content.count('(')
num_close_paren = content.count(')')
print('AdminPanel (:', num_open_paren, '):', num_close_paren)
