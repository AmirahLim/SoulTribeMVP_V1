// Local-only evaluation. Input must live outside this public repository.
// Frozen before evaluation: normalised word-trigram Jaccard >= .45, or a shared
// contiguous eight-word span, flags a collision. Do not silently tune thresholds.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),file=path.resolve(process.argv[2]||'');
if(!process.argv[2]||file.startsWith(root+path.sep))throw new Error('Provide a private evidence file outside the repository');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,...rest){return resolve.call(this,request==='@soul-tribe/core'?path.join(root,'packages/core/index.ts'):request,parent,...rest);};
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {buildEvidence,pairEvidence}=require('../apps/web/lib/readEngine/evidence.ts');
const {composeRead,proseSimilarity,repeatedSpan,validateClaim}=require('../apps/web/lib/readEngine/compose.ts');
const rows=JSON.parse(fs.readFileSync(file,'utf8')),reads=[];
for(const [i,row] of rows.entries())for(const level of ['early','profile']){
 const bundle=buildEvidence(row,level),read=composeRead(bundle);
 reads.push({label:`member-${i+1}/${level}`,bundle,read});
}
for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
 const bundle=pairEvidence(rows[i],rows[j]);reads.push({label:`pair-${i+1}-${j+1}/bond`,bundle,read:composeRead(bundle)});
}
const collisions=[],crossLevel=[];
for(let i=0;i<reads.length;i++)for(let j=i+1;j<reads.length;j++){
 const a=reads[i],b=reads[j],x=a.read.sections.map(s=>s.text).join(' '),y=b.read.sections.map(s=>s.text).join(' ');
 const similarity=proseSimilarity(x,y),span=repeatedSpan(x,y);
 if(a.bundle.level===b.bundle.level&&(similarity>=.45||span))collisions.push({a:a.label,b:b.label,jaccard:similarity,sharedEightWords:span});
 if(a.bundle.level!==b.bundle.level&&span)crossLevel.push({a:a.label,b:b.label});
}
console.log(JSON.stringify({metric:{wordTrigramJaccard:.45,sharedWordSpan:8},sourceProfiles:rows.length,
 reads:reads.map(({label,bundle,read})=>({label,sections:read.sections.length,claims:read.sections.flatMap(s=>s.claims).length,
 valid:read.sections.flatMap(s=>s.claims).every(c=>validateClaim(c,bundle))})),collisions,crossLevel},null,2));
