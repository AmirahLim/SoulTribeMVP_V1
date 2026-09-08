import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getSupabaseServerClient } from "../../../../lib/supabaseServer";
import { isDraft } from "../../../../lib/sixQuestionOnboarding";
import {validReadFeedback,type ReadDraft} from '../../../../lib/earlyRead';
const COOKIE = "st_onboarding_v2";
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { draft: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const client = await getSupabaseServerClient();
    const { data, error } = await client.rpc("read_onboarding_handoff", {
      p_token: token,
    });
    if (error) throw error;
    const response = NextResponse.json(
      { draft: data?.draft ?? null, claimed: data?.claimed ?? false },
      { headers: { "Cache-Control": "no-store" } },
    );
    if (!data) response.cookies.delete(COOKIE);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not load draft" },
      { status: 503 },
    );
  }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.text();
  if (body.length > 32768)
    return NextResponse.json({ error: "Too large" }, { status: 413 });
  let draft: unknown;
  try {
    draft = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  }
  if (!isDraft(draft) || !validReadFeedback((draft as ReadDraft).earlyReadFeedback))
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  let token =
    (request.headers.get('x-onboarding-new-draft')==='1' ? undefined : request.cookies.get(COOKIE)?.value) || randomBytes(32).toString("hex");
  try {
    const client = await getSupabaseServerClient();
    if(request.cookies.get(COOKIE)?.value) {
      const {data:existing,error:readError}=await client.rpc('read_onboarding_handoff',{p_token:token});
      if(readError)throw readError;
      // A completed receipt is immutable. Editing starts a new draft.
      if(!existing||existing.claimed)token=randomBytes(32).toString('hex');
    }
    const { error } = await client.rpc("save_onboarding_draft", {
      p_token: token,
      p_payload: draft,
    });
    if (error) throw error;
    const response = NextResponse.json({ saved: true });
    response.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to save draft" },
      { status: 503 },
    );
  }
}
