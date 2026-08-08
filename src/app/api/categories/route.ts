import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { uploadBase64ToStorage } from "@/lib/storageUtils";

export const revalidate = 3600;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    // Map snake_case image_url to camelCase imageUrl for AppContext consistency
    const mappedCategories = (data || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      icon: c.icon || "Tag",
      imageUrl: c.image_url || "",
      translations: c.translations || {},
    }));

    return NextResponse.json(mappedCategories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, imageUrl, image } = body;

    const newId = `cat-${Date.now()}`;

    let finalImageUrl = imageUrl || "";
    if (finalImageUrl.startsWith("data:image")) {
      finalImageUrl = await uploadBase64ToStorage(finalImageUrl, 'categories', newId);
    } else if (image) {
      finalImageUrl = await uploadBase64ToStorage(image, 'categories', newId);
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        id: newId,
        name,
        description,
        icon,
        image_url: finalImageUrl,
        translations: body.translations || {},
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/api/categories');
    revalidatePath('/', 'layout');

    const mappedCategory = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      icon: data.icon || "Tag",
      imageUrl: data.image_url || "",
      image: data.image,
      translations: data.translations || {},
    };

    return NextResponse.json(mappedCategory);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const { data: oldCategory } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    if (oldCategory) {
      const { data: productsToUpdate } = await supabaseAdmin
        .from("products")
        .select("id, category")
        .ilike("category", `%${oldCategory.name}%`);
        
      if (productsToUpdate) {
        for (const p of productsToUpdate) {
          if (!p.category) continue;
          const cats = p.category.split(',').map((c: string) => c.trim());
          const filtered = cats.filter(c => c.toLowerCase() !== oldCategory.name.toLowerCase());
          if (filtered.length !== cats.length) {
            await supabaseAdmin.from("products").update({ category: filtered.join(', ') }).eq("id", p.id);
          }
        }
      }
    }
    revalidatePath('/api/categories');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, image } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (body.icon !== undefined) updatePayload.icon = body.icon;
    
    if (body.imageUrl !== undefined) {
      if (body.imageUrl.startsWith("data:image")) {
        updatePayload.image_url = await uploadBase64ToStorage(body.imageUrl, 'categories', id);
      } else {
        updatePayload.image_url = body.imageUrl;
      }
    } else if (image !== undefined) {
      updatePayload.image_url = image ? await uploadBase64ToStorage(image as string, 'categories', id) : null;
    }
    
    if (body.translations !== undefined) updatePayload.translations = body.translations;

    const { data: oldCategory } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (oldCategory && name && oldCategory.name !== name) {
      const { data: productsToUpdate } = await supabaseAdmin
        .from("products")
        .select("id, category")
        .ilike("category", `%${oldCategory.name}%`);
        
      if (productsToUpdate) {
        for (const p of productsToUpdate) {
          if (!p.category) continue;
          const cats = p.category.split(',').map((c: string) => c.trim());
          const index = cats.findIndex(c => c.toLowerCase() === oldCategory.name.toLowerCase());
          if (index !== -1) {
            cats[index] = name;
            await supabaseAdmin.from("products").update({ category: cats.join(', ') }).eq("id", p.id);
          }
        }
      }
    }
    revalidatePath('/api/categories');
    revalidatePath('/', 'layout');

    const mappedCategory = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      icon: data.icon || "Tag",
      imageUrl: data.image_url || "",
      translations: data.translations || {},
    };

    return NextResponse.json(mappedCategory);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
