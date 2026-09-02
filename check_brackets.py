with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

def check(text):
    stack = []
    for i, c in enumerate(text):
        if c in '({[':
            stack.append((c, i))
        elif c in ')}]':
            if not stack:
                print(f"Unmatched {c} at {i}")
                return
            top_c, top_i = stack.pop()
            if (c == ')' and top_c != '(') or \
               (c == '}' and top_c != '{') or \
               (c == ']' and top_c != '['):
                print(f"Mismatched {c} at {i}, expected matching for {top_c} at {top_i}")
                
                # Print lines
                lines = text.split('\n')
                line_idx = text[:i].count('\n') + 1
                top_line_idx = text[:top_i].count('\n') + 1
                print(f"Mismatch at line {line_idx}, open bracket at line {top_line_idx}")
                return
    
    if stack:
        top_c, top_i = stack[-1]
        line_idx = text[:top_i].count('\n') + 1
        print(f"Unclosed {top_c} at {top_i} (line {line_idx})")

check(text)
