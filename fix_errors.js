const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('src/app/api');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)/g, 'catch (error: any)');
  newContent = newContent.replace(/const\s+message\s*=\s*error\s*instanceof\s*Error\s*\?\s*error\.message\s*:\s*["']Unknown error["'];/g, 'const message = error?.message || error?.details || "Unknown error";');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
  }
});
console.log('Updated ' + count + ' API route files');
