const fs = require('fs');

const oldFile = 'workspace/old_file.tsx';
const currentFile = 'workspace/web-app/src/app/pages/CDASettings.tsx';

let oldContent = fs.readFileSync(oldFile, 'utf8');
let currentContent = fs.readFileSync(currentFile, 'utf8');

// Extract the missing functions from oldFile
const startTag = '  function updateForm(patch: Partial<PlanForm>) {';
const endTag = '  function handleSavePlan() {';

const startIndex = oldContent.indexOf(startTag);
const endIndex = oldContent.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find the missing functions in oldFile');
  process.exit(1);
}

const missingFunctions = oldContent.slice(startIndex, endIndex);

// Insert into currentFile right before handleSavePlan
const currentTarget = '  function handleSavePlan() {';
const currentTargetIndex = currentContent.indexOf(currentTarget);

if (currentTargetIndex === -1) {
  console.error('Could not find handleSavePlan in currentFile');
  process.exit(1);
}

currentContent = currentContent.slice(0, currentTargetIndex) + missingFunctions + currentContent.slice(currentTargetIndex);

fs.writeFileSync(currentFile, currentContent);
console.log('Restored missing functions successfully!');
