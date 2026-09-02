import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# For mobile sidebar
pattern_mobile = r'(\{\(isSuperAdmin \|\| isTheatreAdmin\) && \(\s*)(<button\s*type="button"\s*onClick=\{\(\) => \{ setActiveTab\("integration_testing"\);)(.*?</button>\s*<button.*?<span>User Management</span>\s*</div>\s*<span.*?>\s*\{theatreAdmins\.length\}\s*</span>\s*</button>\s*)(\)\})'
match = re.search(pattern_mobile, content, re.DOTALL)
if match:
    new_mobile = match.group(1) + '<>' + match.group(2) + match.group(3) + '</>' + match.group(4)
    content = content[:match.start()] + new_mobile + content[match.end():]
else:
    print("Mobile sidebar not matched")

# For desktop sidebar
pattern_desktop = r'(\{\(isSuperAdmin \|\| isTheatreAdmin\) && \(\s*)(<button\s*type="button"\s*onClick=\{\(\) => setActiveTab\("integration_testing"\)\})(.*?</button>\s*<button.*?<span>User Management</span>\s*</div>\s*<span.*?>\s*\{theatreAdmins\.length\}\s*</span>\s*</button>\s*)(\)\})'
match_desktop = re.search(pattern_desktop, content, re.DOTALL)
if match_desktop:
    new_desktop = match_desktop.group(1) + '<>' + match_desktop.group(2) + match_desktop.group(3) + '</>' + match_desktop.group(4)
    content = content[:match_desktop.start()] + new_desktop + content[match_desktop.end():]
else:
    print("Desktop sidebar not matched")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
