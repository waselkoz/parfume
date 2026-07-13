const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length > 1) acc[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^\"|\"$/g, '');
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCategory() {
  console.log("Checking categories table schema...");
  const { data: cols, error: colsErr } = await supabaseAdmin.from('categories').select('*').limit(1);
  if (colsErr) {
    console.error("Error reading categories:", colsErr);
  } else {
    console.log("Categories columns:", cols && cols.length > 0 ? Object.keys(cols[0]) : "Empty table");
  }

  console.log("Testing POST equivalent...");
  const newId = `cat-test-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      id: newId,
      name: "TestCategory",
      description: "Test description",
      icon: "Tag",
      image_url: "http://test.com/img.png"
    })
    .select()
    .single();
    
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded!", data);
    // Cleanup
    await supabaseAdmin.from("categories").delete().eq("id", newId);
  }
}

testCategory();
