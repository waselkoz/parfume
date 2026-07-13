import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching reviews:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, user_name, rating, comment } = body;

    if (!product_id || !user_name || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    if (String(user_name).length > 100) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }

    if (comment && String(comment).length > 1000) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    // Insert the new review
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert([
        {
          product_id,
          user_name,
          rating,
          comment: comment || null,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Recalculate average rating and reviews count
    const { data: allReviews, error: fetchError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", product_id);

    if (fetchError) throw fetchError;

    const reviewsCount = allReviews.length;
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 5.0;

    // Update the products table
    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({
        rating: Number(averageRating),
        reviews_count: reviewsCount,
      })
      .eq("id", product_id);

    if (updateError) {
      console.error("Failed to update product rating:", updateError);
      // We still return success for the review creation, even if product update fails
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: unknown) {
    console.error("Error posting review:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
