/* eslint-disable */
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

async function testProducts() {
  const newId = `prod-test-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      id: newId,
      name: "TestProd",
      description: "Test description",
      brand: "TestBrand",
      category: "TestCat",
      image: "http://test.com/img.png",
      top_notes: ["Apple"],
      heart_notes: ["Rose"],
      base_notes: ["Musk"],
      rating: 5.0,
      reviews_count: 1,
      variants: [],
      translations: { en: { name: "", description: "" }, ar: { name: "", description: "" } },
    })
    .select()
    .single();
    
  if (error) {
    console.error("Product insert failed:", error);
  } else {
    console.log("Product insert succeeded!", data);
    await supabaseAdmin.from("products").delete().eq("id", newId);
  }
}

testProducts();
