import assert from 'node:assert/strict';
import {basis,defaultCell,presets,dot,norm,transform,planePolygon} from '../src/lib/lattice.ts';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);
for(const c of Object.values(presets)){
 const b=basis(c);for(let i=0;i<3;i++)for(let j=0;j<3;j++)near(dot(b.direct[i],b.reciprocal[j]),i===j?1:0);
 for(const h of [[1,0,0],[2,0,0],[1,1,1],[-2,1,0]]){const g=transform(b.reciprocal,h);for(let m=-2;m<=2;m++){const pts=planePolygon(h,m,b.direct);for(const p of pts)near(dot(g,p),m);if(pts.length>2)assert.ok(pts.every(p=>p.every(Number.isFinite)));}}
}
const cubic=basis(defaultCell);near(1/norm(transform(cubic.reciprocal,[1,0,0])),4);near(1/norm(transform(cubic.reciprocal,[2,0,0])),2);near(1/norm(transform(cubic.reciprocal,[1,1,1])),4/Math.sqrt(3));
near(norm(transform(basis({...defaultCell,a:8}).reciprocal,[1,0,0])),.125);
const skew=basis({...defaultCell,gamma:65});near(norm(skew.reciprocal[0]),1/(4*Math.sin(65*Math.PI/180)));
near(norm(transform(skew.reciprocal,[-2,1,0])),norm(transform(skew.reciprocal,[2,-1,0])));
near(norm(transform(cubic.reciprocal,[0,0,0])),0);
assert.throws(()=>basis({...defaultCell,alpha:50,beta:50,gamma:130}));
console.log('PASS: six crystal systems, dual bases, plane clipping, spacings, inverse scaling, negative indices, origin, invalid cell.');
