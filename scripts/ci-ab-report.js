const fs = require('fs');
const path = require('path');

const diffDir = path.join(process.cwd(), 'test-results', 'ab-diffs');

let totalDrifts = 0;
let markdown = `## 🔍 A/B UI Regression Report\n\n`;

if (!fs.existsSync(diffDir)) {
  markdown += `✅ **All tests passed!** No structural or data drifts detected between Production and this Branch.\n`;
} else {
  let hasErrors = false;
  // Get route folders
  const routes = fs.readdirSync(diffDir).filter(f => fs.lstatSync(path.join(diffDir, f)).isDirectory());

  let table = `| Route | Component | Issue | Production Text | Branch Text |\n`;
  table += `|-------|-----------|-------|-----------------|-------------|\n`;

  for (const route of routes) {
    const reportPath = path.join(diffDir, route, 'report.json');
    if (fs.existsSync(reportPath)) {
      const reports = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      if (reports.length > 0) {
        hasErrors = true;
        totalDrifts += reports.length;
        
        // Limit output to prevent massive comments exceeding GH limits
        const renderableReports = reports.slice(0, 15);
        for (const item of renderableReports) {
          const icon = item.reason === "Data Drift" ? "🔤 Data Drift" : "📏 Layout Drift";
          const pText = item.productionText ? `\`${item.productionText.replace(/\|/g, "").substring(0, 30)}\`` : "-";
          const bText = item.branchText ? `\`${item.branchText.replace(/\|/g, "").substring(0, 30)}\`` : "-";
          
          table += `| \`${route}\` | \`${item.component.split('>').pop().trim()}\` | ${icon} | ${pText} | ${bText} |\n`;
        }
        
        if (reports.length > 15) {
          table += `| \`${route}\` | ...and ${reports.length - 15} more. | - | - | - |\n`;
        }
      }
    }
  }

  if (hasErrors) {
    markdown += `🚨 **Found ${totalDrifts} drifted components.**\n\n`;
    markdown += table;
    markdown += `\n> [!WARNING]
> Please review the **Action Artifacts** attached below this workflow to download the \`_FullPage\` screenshots and the \`focused-crops\` folder. They contain precisely boxed visual highlights of these drifts.\n`;
  } else {
    markdown += `✅ **All tests passed!** No differences found.\n`;
  }
}

// GitHub Actions multi-line output syntax
console.log(markdown);
