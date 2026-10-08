export type Vec = [number,number,number];
export type Cell = {a:number;b:number;c:number;alpha:number;beta:number;gamma:number};
export const dot=(a:Vec,b:Vec)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const add=(a:Vec,b:Vec)=>a.map((x,i)=>x+b[i]) as Vec;
export const mul=(a:Vec,s:number)=>a.map(x=>x*s) as Vec;
export const cross=(a:Vec,b:Vec):Vec=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=(a:Vec)=>Math.sqrt(dot(a,a));
export const unit=(a:Vec):Vec=>norm(a)>1e-10?mul(a,1/norm(a)):[0,0,0];
export const transform=(b:Vec[],x:Vec):Vec=>add(add(mul(b[0],x[0]),mul(b[1],x[1])),mul(b[2],x[2]));
export const defaultCell:Cell={a:4,b:4,c:4,alpha:90,beta:90,gamma:90};
export const presets:Record<string,Cell>={Cubic:defaultCell,Tetragonal:{...defaultCell,c:6},Orthorhombic:{...defaultCell,b:5,c:6},Hexagonal:{...defaultCell,c:6,gamma:120},Monoclinic:{...defaultCell,b:5,c:6,beta:110},Triclinic:{a:4,b:5,c:6,alpha:75,beta:85,gamma:70}};
export function basis(c:Cell){
 const [ca,cb,cg]=[c.alpha,c.beta,c.gamma].map(x=>Math.cos(x*Math.PI/180));
 const sg=Math.sin(c.gamma*Math.PI/180); const cy=(ca-cb*cg)/sg; const zz=1-cb*cb-cy*cy;
 if(c.a<=0||c.b<=0||c.c<=0||sg<1e-8||zz<=1e-8)throw new Error('These angles cannot form a nonzero-volume unit cell.');
 const direct:Vec[]=[[c.a,0,0],[c.b*cg,c.b*sg,0],[c.c*cb,c.c*cy,c.c*Math.sqrt(zz)]];
 const volume=dot(direct[0],cross(direct[1],direct[2]));
 const reciprocal=[mul(cross(direct[1],direct[2]),1/volume),mul(cross(direct[2],direct[0]),1/volume),mul(cross(direct[0],direct[1]),1/volume)];
 return {direct,reciprocal,volume};
}
export const corners:Vec[]=Array.from({length:8},(_,i)=>[i&1?1:-1,i&2?1:-1,i&4?1:-1]);
export const edges=corners.flatMap((p,i)=>[1,2,4].filter(bit=>(i&bit)===0).map(bit=>[p,corners[i|bit]]));
export function planePolygon(h:Vec,m:number,b:Vec[]):Vec[]{
 const pts:Vec[]=[];
 for(const [a,z] of edges){const da=dot(h,a)-m,dz=dot(h,z)-m;
 if(Math.abs(da)<1e-8)pts.push(a);
 if(da*dz<0){const t=da/(da-dz);pts.push(add(a,mul(add(z,mul(a,-1)),t)));}}
 const unique=pts.filter((p,i)=>pts.findIndex(q=>norm(add(p,mul(q,-1)))<1e-7)===i).map(p=>transform(b,p));
 if(unique.length<3)return [];
 const center=mul(unique.reduce((s,p)=>add(s,p),[0,0,0] as Vec),1/unique.length);
 const u=unit(add(unique[0],mul(center,-1)));const n=unit(cross(add(unique[1],mul(unique[0],-1)),add(unique[2],mul(unique[0],-1))));const v=cross(n,u);
 return unique.sort((a,z)=>Math.atan2(dot(add(a,mul(center,-1)),v),dot(add(a,mul(center,-1)),u))-Math.atan2(dot(add(z,mul(center,-1)),v),dot(add(z,mul(center,-1)),u)));
}
