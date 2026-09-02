import sys

with open('src/components/AdminPanel.tsx', 'rb') as f:
    content = f.read()

# 1. Add "integration_testing" to TabType
tab_type_str = b'type TabType = "overview" | '
if tab_type_str in content:
    content = content.replace(tab_type_str, b'type TabType = "integration_testing" | "overview" | ')
else:
    print("Could not find TabType")

# 2. Add Import
import_str = b'import SubWebsiteCMSManager from "./cms/SubWebsiteCMSManager";'
if import_str in content:
    content = content.replace(import_str, import_str + b'\nimport IntegrationTestingModule from "./integration-testing/IntegrationTestingModule";')
else:
    print("Could not find import_str")

# 3. Add Sidebar Link
# Let's find Theatre Staff and put it above it, or Theatre Management menu
sidebar_menu = b'onClick={() => { setActiveTab("access"); setIsMobileMenuOpen(false); }}\n                    className={`w-full flex items-center justify-between'
if sidebar_menu in content:
    new_link = b"""                  <button
                    type="button"
                    onClick={() => { setActiveTab("integration_testing"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 group ${
                      activeTab === "integration_testing" ? "bg-white/10 text-gold" : "text-text-secondary hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${activeTab === "integration_testing" ? "bg-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">Integration & Testing</span>
                    </div>
                  </button>
"""
    content = content.replace(sidebar_menu, new_link + sidebar_menu)

# desktop sidebar
sidebar_desktop = b'onClick={() => setActiveTab("access")}\n                        className={`w-full flex items-center justify-between'
if sidebar_desktop in content:
    new_link_desktop = b"""                      <button
                        type="button"
                        onClick={() => setActiveTab("integration_testing")}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 group ${
                          activeTab === "integration_testing" ? "bg-white/10 text-gold shadow-sm" : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${activeTab === "integration_testing" ? "bg-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                            <Monitor className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold tracking-wider">Integration & Testing</span>
                        </div>
                      </button>
"""
    content = content.replace(sidebar_desktop, new_link_desktop + sidebar_desktop)

# 4. Render block
render_block = b'{/* ========================================================= */}\n          {/* TAB: CINECOINS STANDALONE LOYALTY MANAGEMENT */}'
if render_block in content:
    new_render = b"""          {/* ========================================================= */}
          {/* TAB: INTEGRATION & TESTING MODULE */}
          {/* ========================================================= */}
          {activeTab === "integration_testing" && (
            <IntegrationTestingModule isSuperAdmin={isSuperAdmin} />
          )}

"""
    content = content.replace(render_block, new_render + render_block)


with open('src/components/AdminPanel.tsx', 'wb') as f:
    f.write(content)

print("Modified AdminPanel.tsx successfully.")
