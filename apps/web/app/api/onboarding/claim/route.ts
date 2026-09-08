import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabaseServer";
import {ELIGIBILITY_COOKIE} from '../../../../lib/eligibilityProof';
import {claimOnboardingServer} from '../../../../lib/claimOnboardingServer';
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
    let body: {displayName?: string; birthYear?: number; expectedUserId?: string};
    try { body = text ? JSON.parse(text) : {}; }
    catch { return NextResponse.json({error:'Invalid request'},{status:400}); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({error:'Invalid request'},{status:400});
    const result=await claimOnboardingServer(client,user,token,request.cookies.get(ELIGIBILITY_COOKIE)?.value,body);
    return NextResponse.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    const dbError=error as {code?:string;message?:string};
    console.error('[SoulTribe] onboarding handoff failed',{code:dbError.code,message:dbError.message});
    return NextResponse.json(
      { error: "Unable to save your profile. Please retry." },
      { status: 503 },
    );
  }
}
