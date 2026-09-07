export function adultBirthYear(value:unknown,now=new Date()):number|null {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number);
 const date=new Date(Date.UTC(y,m-1,d));
 if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d||y<1930)return null;
 const today=now.toISOString().slice(0,10);
 const anniversary=String(y+18).padStart(4,'0')+value.slice(4);
 return anniversary<=today?y:null;
}
