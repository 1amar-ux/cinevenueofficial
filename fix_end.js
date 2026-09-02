const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Find the line with "🎟️ Live Event Registrations"
const keyword = "🎟️ Live Event Registrations";
const index = content.indexOf(keyword);
if (index === -1) throw new Error("Keyword not found");

// Find the end of the IIFE "})()}" after the keyword
const iifeEnd = content.indexOf("})()}", index);
if (iifeEnd === -1) throw new Error("IIFE end not found");

// Cut the file after "})()}"
let newContent = content.substring(0, iifeEnd + 5);

// Append the correct closing tags
newContent += `
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
`;

fs.writeFileSync('src/components/AdminPanel.tsx', newContent);
console.log("Fixed AdminPanel end tags.");
