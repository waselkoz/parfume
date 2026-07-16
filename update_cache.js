/* eslint-disable */
const fs = require('fs');
['products', 'categories', 'brands'].forEach(dir => { 
  const file = 'src/app/api/' + dir + '/route.ts'; 
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8'); 
    code = code.replace(/revalidatePath\([\'\"].+?[\'\"]\);/g, match => match + '\n    revalidatePath(\'/\', \'layout\');'); 
    fs.writeFileSync(file, code); 
  }
});
console.log("Done");
