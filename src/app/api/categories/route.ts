import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
    const { name, description, icon, imageUrl } = body;

    const newId = `cat-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        id: newId,
        name,
        description,
        icon,
        image_url: imageUrl || "",
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
      await supabaseAdmin.from("products").delete().eq("category", oldCategory.name);
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
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (body.icon !== undefined) updatePayload.icon = body.icon;
    if (body.imageUrl !== undefined) updatePayload.image_url = body.imageUrl;
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
      await supabaseAdmin.from("products").update({ category: name }).eq("category", oldCategory.name);
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
