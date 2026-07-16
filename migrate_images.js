/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jiismhvmpbmvuoitvfdd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppaXNtaHZtcGJtdnVvaXR2ZmRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwMTg4OSwiZXhwIjoyMDk1Mzc3ODg5fQ.FTkug1LuDCaa33W97VxYP2wHlDkI6IL1hm5od6Dk6vY'
);

async function uploadBase64(base64String, folder, id) {
  if (!base64String || !base64String.startsWith('data:image/')) return base64String;
  
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64String;
  
  const type = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
  const filename = `${folder}/${id}_${Date.now()}.${ext}`;

  console.log(`Uploading ${filename}...`);
  const { data, error } = await supabase.storage.from('images').upload(filename, buffer, {
    contentType: type,
    upsert: true
  });

  if (error) {
    console.error(`Error uploading ${filename}:`, error);
    return base64String;
  }

  const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filename);
  return publicUrlData.publicUrl;
}

async function migrate() {
  console.log('Starting migration...');

  // Products
  const { data: products } = await supabase.from('products').select('id, image, hover_image');
  if (products) {
    for (const p of products) {
      let updates = {};
      if (p.image && p.image.startsWith('data:image/')) {
        updates.image = await uploadBase64(p.image, 'products', p.id + '_main');
      }
      if (p.hover_image && p.hover_image.startsWith('data:image/')) {
        updates.hover_image = await uploadBase64(p.hover_image, 'products', p.id + '_hover');
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from('products').update(updates).eq('id', p.id);
        console.log(`Updated product ${p.id}`);
      }
    }
  }

  // Categories
  const { data: categories } = await supabase.from('categories').select('id, image');
  if (categories) {
    for (const c of categories) {
      if (c.image && c.image.startsWith('data:image/')) {
        const url = await uploadBase64(c.image, 'categories', c.id);
        await supabase.from('categories').update({ image: url }).eq('id', c.id);
        console.log(`Updated category ${c.id}`);
      }
    }
  }

  // Brands
  const { data: marques } = await supabase.from('marques').select('id, logo');
  if (marques) {
    for (const m of marques) {
      if (m.logo && m.logo.startsWith('data:image/')) {
        const url = await uploadBase64(m.logo, 'brands', m.id);
        await supabase.from('marques').update({ logo: url }).eq('id', m.id);
        console.log(`Updated brand ${m.id}`);
      }
    }
  }

  console.log('Migration complete!');
}

migrate();
