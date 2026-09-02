with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

bad1 = """                {(isSuperAdmin || isTheatreAdmin) && (
                  <button"""
good1 = """                {(isSuperAdmin || isTheatreAdmin) && (
                  <>
                  <button"""
content = content.replace(good1, bad1)

bad1_end = """                    </span>
                  </button>
                )}"""
good1_end = """                    </span>
                  </button>
                  </>
                )}"""
content = content.replace(good1_end, bad1_end)


bad2 = """                {(isSuperAdmin || isTheatreAdmin) && (
                      <button"""
good2 = """                {(isSuperAdmin || isTheatreAdmin) && (
                      <>
                      <button"""
content = content.replace(good2, bad2)

bad2_end = """                        </span>
                      </button>
                    )}"""
good2_end = """                        </span>
                      </button>
                      </>
                    )}"""
content = content.replace(good2_end, bad2_end)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
