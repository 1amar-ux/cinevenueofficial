import fs from "fs";
import path from "path";

async function verifyDartFilesIntegrity() {
  console.log("==========================================================================");
  console.log("CINEVENUE FLUTTER MOBILE DART INTEGRITY & IMPORT AUDIT");
  console.log("==========================================================================\n");

  const mobileLibDir = path.resolve(process.cwd(), "cinevenue_mobile/lib");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  // 1. Collect all Dart files
  const dartFiles: string[] = [];
  function walkDir(dir: string) {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith(".dart")) {
        dartFiles.push(fullPath);
      }
    }
  }
  walkDir(mobileLibDir);

  assert(dartFiles.length === 42, `Detected exact 42 Dart source files across clean architecture (Found: ${dartFiles.length})`);

  // 2. Scan all import statements
  let totalImportsChecked = 0;
  let brokenImports = 0;

  for (const filePath of dartFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("import ") || !line.endsWith(";")) continue;

      const match = line.match(/import\s+['"]([^'"]+)['"]/);
      if (!match) continue;

      const importPath = match[1];

      // Ignore external flutter/package imports
      if (importPath.startsWith("dart:") || (!importPath.startsWith("package:cinevenue_mobile") && !importPath.startsWith("."))) {
        continue;
      }

      totalImportsChecked++;
      let targetFile: string;

      if (importPath.startsWith("package:cinevenue_mobile/")) {
        const subPath = importPath.replace("package:cinevenue_mobile/", "");
        targetFile = path.resolve(mobileLibDir, subPath);
      } else {
        targetFile = path.resolve(path.dirname(filePath), importPath);
      }

      if (!fs.existsSync(targetFile)) {
        console.error(`❌ Broken import in ${path.relative(process.cwd(), filePath)}:${i + 1} -> ${importPath}`);
        brokenImports++;
      }
    }
  }

  assert(brokenImports === 0, `All internal Dart imports resolve to valid files (${totalImportsChecked} imports checked, ${brokenImports} broken)`);

  // 3. Android & iOS Runner files audit
  console.log("\n--- 2. Checking Platform Runners ---");
  const androidManifest = path.resolve(process.cwd(), "cinevenue_mobile/android/app/src/main/AndroidManifest.xml");
  assert(fs.existsSync(androidManifest), "Android Runner AndroidManifest.xml exists");

  const iosRunner = path.resolve(process.cwd(), "cinevenue_mobile/ios/Runner/Info.plist");
  assert(fs.existsSync(iosRunner), "iOS Runner Info.plist exists");

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

verifyDartFilesIntegrity().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

