with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Fix 1: mobile sidebar
bad_str1 = """                  <button                                      <button
                    type="button"
                    onClick={() => { setActiveTab("integration_testing"); setIsMobileMenuOpen(false); }}"""

good_str1 = """                  <button
                    type="button"
                    onClick={() => { setActiveTab("integration_testing"); setIsMobileMenuOpen(false); }}"""

if bad_str1 in content:
    content = content.replace(bad_str1, good_str1)
    
bad_str1_end = """                  </button>onClick={() => { setActiveTab("access"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5"""

good_str1_end = """                  </button>
                  <button
                    onClick={() => { setActiveTab("access"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5"""

if bad_str1_end in content:
    content = content.replace(bad_str1_end, good_str1_end)

# Fix 2: desktop sidebar
bad_str2 = """                        <button                      <button
                        type="button"
                        onClick={() => setActiveTab("integration_testing")}"""

good_str2 = """                      <button
                        type="button"
                        onClick={() => setActiveTab("integration_testing")}"""
                        
if bad_str2 in content:
    content = content.replace(bad_str2, good_str2)

bad_str2_end = """                      </button>onClick={() => setActiveTab("access")}
                        className={`w-full flex items-center justify-between"""

good_str2_end = """                      </button>
                      <button
                        onClick={() => setActiveTab("access")}
                        className={`w-full flex items-center justify-between"""

if bad_str2_end in content:
    content = content.replace(bad_str2_end, good_str2_end)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
