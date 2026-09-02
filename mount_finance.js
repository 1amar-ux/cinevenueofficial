const fs = require('fs');
const path = 'src/components/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import FinanceModule')) {
  content = content.replace(
    'import IntegrationTestingModule from "./admin/integration-testing/IntegrationTestingModule";',
    'import IntegrationTestingModule from "./admin/integration-testing/IntegrationTestingModule";\nimport FinanceModule from "./admin/finance/FinanceModule";'
  );
}

const targetStr = '{activeTab === "ads_console" && (';
const renderBlock = `
          {activeTab === "fee_management" && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FinanceModule />
            </div>
          )}

          ${targetStr}`;

content = content.replace(targetStr, renderBlock);

fs.writeFileSync(path, content);
console.log('Updated AdminPanel.tsx to mount FinanceModule');
