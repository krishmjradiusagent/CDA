const fs = require('fs');
const file = 'workspace/web-app/src/app/pages/CDASettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Tabs import
if (!content.includes('import { Tabs,')) {
  content = content.replace(
    'import { Toaster } from "../components/ui/sonner";',
    'import { Toaster } from "../components/ui/sonner";\nimport { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";'
  );
}

// Write it back
fs.writeFileSync(file, content);
console.log('Tabs import added.');
