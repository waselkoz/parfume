import { supabaseAdmin } from "@/lib/supabase";

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function uploadBase64ToStorage(base64String: string, folder: string, id: string): Promise<string> {
  if (!base64String || !base64String.startsWith('data:image/')) return base64String;
  
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64String;
  
  const type = matches[1];
  const bytes = base64ToUint8Array(matches[2]);
  const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
  const filename = `${folder}/${id}_${Date.now()}.${ext}`;

  try {
    const { error } = await supabaseAdmin.storage.from('images').upload(filename, bytes, {
      contentType: type,
      upsert: true
    });

    if (error) {
      console.error("Storage upload error:", error);
      return base64String;
    }
    
    const { data } = supabaseAdmin.storage.from('images').getPublicUrl(filename);
    return data.publicUrl;
  } catch (err) {
    console.error("Storage upload exception:", err);
    return base64String;
  }
}
