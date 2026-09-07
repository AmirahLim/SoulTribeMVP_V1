import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabaseServer";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const client = await getSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    const token = request.cookies.get("st_onboarding_v2")?.value;
    if (!token)
      return NextResponse.json(
        {
          error:
            "Your saved answers are on the browser where you started. Return there to continue.",
        },
        { status: 410 },
      );
    const text = await request.text();
    if (text.length > 1024)
      return NextResponse.json({ error: "Too large" }, { status: 413 });
    const body = JSON.parse(text);
    const { data, error } = await client.rpc("claim_onboarding_draft", {
      p_token: token,
      p_display_name: body.displayName,
      p_birth_year: body.birthYear,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "That handle is taken. Go back to choose another."
              : error.message,
        },
        { status: 409 },
      );
    return NextResponse.json({ draft: data });
  } catch {
    return NextResponse.json(
      { error: "Unable to save your profile. Please retry." },
      { status: 503 },
    );
  }
}
