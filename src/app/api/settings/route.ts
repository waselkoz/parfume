import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const FILENAME = 'config.json';
const BUCKET = 'images'; 

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(FILENAME);
    
    if (error) {
      return NextResponse.json({ heroProductIds: [], heroBgUrl: "", siteSettings: {} });
    }

    const text = await data.text();
    const config = JSON.parse(text);
    return NextResponse.json(config);
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json({ heroProductIds: [], heroBgUrl: "", siteSettings: {} });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let existingConfig = {};
    const { data: existingData } = await supabaseAdmin.storage.from(BUCKET).download(FILENAME);
    if (existingData) {
      try {
        const text = await existingData.text();
        existingConfig = JSON.parse(text);
      } catch (e) {}
    }
    
    const newConfig = { ...existingConfig, ...body };
    const jsonString = JSON.stringify(newConfig);
    
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);

    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(FILENAME, bytes, {
      contentType: 'application/json',
      upsert: true
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true, config: newConfig });
  } catch (err: any) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}
