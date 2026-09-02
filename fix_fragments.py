with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

bad1 = """                {(isSuperAdmin || isTheatreAdmin) && (
                  <button"""
good1 = """                {(isSuperAdmin || isTheatreAdmin) && (
                  <>
                  <button"""
content = content.replace(bad1, good1)

bad1_end = """                    </span>
                  </button>
                )}"""
good1_end = """                    </span>
                  </button>
                  </>
                )}"""
content = content.replace(bad1_end, good1_end)


# Now check desktop sidebar
bad2 = """                {(isSuperAdmin || isTheatreAdmin) && (
                      <button"""
good2 = """                {(isSuperAdmin || isTheatreAdmin) && (
                      <>
                      <button"""
content = content.replace(bad2, good2)

bad2_end = """                        </span>
                      </button>
                    )}"""
good2_end = """                        </span>
                      </button>
                      </>
                    )}"""
content = content.replace(bad2_end, good2_end)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
