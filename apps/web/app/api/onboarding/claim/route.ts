import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabaseServer";
import {ELIGIBILITY_COOKIE,readProof} from '../../../../lib/eligibilityProof';
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
    if(body.expectedUserId!==undefined&&body.expectedUserId!==user.id)return NextResponse.json({error:'Your signed-in account changed. Reload before saving.'},{status:409});
    const {data:pending,error:pendingError}=await client.rpc('read_onboarding_draft',{p_token:token});
    if(pendingError)throw pendingError;
    if(!pending)return NextResponse.json({error:'Your draft is unavailable or expired. Return to onboarding in the browser where you started.'},{status:410});
    const {data:profile,error:profileError}=await client.from('profiles').select('display_name,birth_year').eq('id',user.id).maybeSingle();
    if(profileError)throw profileError;
    const checkedYear=readProof(token,request.cookies.get(ELIGIBILITY_COOKIE)?.value);
    const displayName=profile?.display_name || body.displayName || pending.displayName;
    const birthYear=profile?.birth_year ?? checkedYear ?? (pending.setupRevision===2 ? null : body.birthYear);
    if(typeof displayName!=='string'||!displayName.trim()||!birthYear)return NextResponse.json({error:'Complete your display name and private age check to save your profile.',requiresDetails:true},{status:400});
    const { data, error } = await client.rpc("claim_onboarding_draft", {
      p_token: token,
      p_display_name: displayName,
      p_birth_year: birthYear,
    });
    if (error) {
      console.error('[SoulTribe] onboarding claim failed',{code:error.code,message:error.message});
      return NextResponse.json(
        {
          code: error.code,
          error:
            error.code === "23505"
              ? "That handle is taken. Go back to choose another."
              : error.message,
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ saved:true, draft: data },{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    const dbError=error as {code?:string;message?:string};
    console.error('[SoulTribe] onboarding handoff failed',{code:dbError.code,message:dbError.message});
    return NextResponse.json(
      { error: "Unable to save your profile. Please retry." },
      { status: 503 },
    );
  }
}
