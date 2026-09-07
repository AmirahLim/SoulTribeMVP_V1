/** Small positive context preference. No diagnosis, age inference or mismatch penalty. */
export function lifeContextBoost(a?:string[],b?:string[]):number {
 if(!a?.length||!b?.length)return 0;
 const left=new Set(a),right=new Set(b);
 const overlap=[...left].filter(v=>right.has(v)).length;
 return .03*overlap/new Set([...left,...right]).size;
}
