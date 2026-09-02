import sys

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

keyword = "🎟️ Live Event Registrations"
idx = content.find(keyword)
if idx == -1:
    print("Keyword not found")
    sys.exit(1)

iife_end = content.find("})()}", idx)
if iife_end == -1:
    print("IIFE end not found")
    sys.exit(1)

new_content = content[:iife_end + 5] + """
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <Database className="w-12 h-12 text-white/10 mb-4" />
                <h4 className="text-lg font-display text-text-primary mb-2">Select a Customer Profile</h4>
                <p className="text-sm text-text-muted max-w-md mx-auto">Click on any customer credential from the database panel to view their complete transaction history, event registrations, and venue booking records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
</div>
</div>
);
}
export default AdminPanel;
"""

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(new_content)

print("Fixed AdminPanel end tags.")
