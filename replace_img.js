/* eslint-disable */
const fs = require('fs');

let files = [
  'src/app/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/products/[id]/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Only add import if not there
  if (!code.includes('import Image from "next/image"')) {
    code = 'import Image from "next/image";\n' + code;
  }
  
  code = code.replace(/<img/g, '<Image width={800} height={800}');
  fs.writeFileSync(file, code);
}
console.log("Done");
