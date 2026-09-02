import sys

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "onUpdateCineCoinsTransactions={(t) => setCineCoinsTransactions(t)}" in line:
        # Check if the next few lines match
        if "/>" in lines[i+1] and "</div>" in lines[i+2] and "}" in lines[i+3]:
            # Insert ")"
            lines.insert(i+3, "          )\n")
            with open('src/App.tsx', 'w') as f:
                f.writelines(lines)
            print(f"Fixed at line {i}")
            sys.exit(0)

print("Not found.")
