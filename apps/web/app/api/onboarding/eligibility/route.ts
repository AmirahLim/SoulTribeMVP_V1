import {NextRequest,NextResponse} from 'next/server';
import {adultBirthYear} from '../../../../lib/adultEligibility';
import {ELIGIBILITY_COOKIE,makeProof,readProof} from '../../../../lib/eligibilityProof';
export async function GET(request:NextRequest) {
 const token=request.cookies.get('st_onboarding_v2')?.value;
 return NextResponse.json({birthYear:token?readProof(token,request.cookies.get(ELIGIBILITY_COOKIE)?.value):null},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:NextRequest) {
 if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 const token=request.cookies.get('st_onboarding_v2')?.value;
 if(!token)return NextResponse.json({error:'Please return to your onboarding answers.'},{status:410});
 try {
  const raw=await request.text();
  if(raw.length>128)return NextResponse.json({error:'Invalid request'},{status:400});
  const year=adultBirthYear(JSON.parse(raw).birthDate);
  const response=NextResponse.json(year?{eligible:true}:{error:'Soul Tribe is for people aged 18 and above.'},{status:year?200:400,headers:{'Cache-Control':'no-store'}});
  if(year)response.cookies.set(ELIGIBILITY_COOKIE,makeProof(token,year),{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:7*86400});
  else response.cookies.delete(ELIGIBILITY_COOKIE);
  return response;
 }catch{return NextResponse.json({error:'Enter a valid date of birth.'},{status:400});}
}
