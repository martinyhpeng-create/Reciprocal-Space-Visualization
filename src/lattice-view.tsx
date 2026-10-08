'use client';
import {useEffect,useRef} from 'react';
import {add,mul,dot,cross,norm,unit,transform,planePolygon,type Vec} from '@/lib/lattice';
export type Camera={yaw:number;el:number;zoom:number};
export type ViewOptions={planes:boolean;points:boolean;labels:boolean;direction:boolean;slice:boolean;opacity:number};
type Props={kind:'real'|'reciprocal';direct:Vec[];reciprocal:Vec[];h:Vec;camera:Camera;setCamera:(v:Camera)=>void;onSelect:(h:Vec)=>void;options:ViewOptions;factor:number;};
const colors=['#ff8d93','#6cdbc0','#87aaff'];
export default function LatticeView(p:Props){
 const ref=useRef<HTMLCanvasElement>(null);const latest=useRef(p);latest.current=p;
 useEffect(()=>{
 const canvas=ref.current!;const ctx=canvas.getContext('2d');if(!ctx)return;
 let width=0,height=0;let picks:{x:number;y:number;z:number;h:Vec}[]=[];let dragging=false,start=[0,0],last=[0,0];let raf=0;
 function draw(){
  const {kind,direct,reciprocal,h,camera,options,factor}=latest.current;const real=kind==='real';const g=transform(reciprocal,h);const gn=norm(g);const empty=gn<1e-8;
  const cam=options.slice?{...camera,yaw:-Math.PI/2,el:Math.PI/2}:camera;
  const forward:Vec=[Math.cos(cam.el)*Math.cos(cam.yaw),Math.cos(cam.el)*Math.sin(cam.yaw),Math.sin(cam.el)];const right:Vec=[-Math.sin(cam.yaw),Math.cos(cam.yaw),0];const up=cross(forward,right);
  const scale=(real?22:185)*Math.min(width/480,height/420)*camera.zoom;
  const project=(v:Vec)=>[width/2+dot(v,right)*scale,height/2-dot(v,up)*scale,dot(v,forward)];
  ctx!.clearRect(0,0,width,height);picks=[];
  const bg=ctx!.createRadialGradient(width*.5,height*.48,0,width*.5,height*.48,width*.65);bg.addColorStop(0,real?'#142437':'#11283a');bg.addColorStop(1,'#0b1523');ctx!.fillStyle=bg;ctx!.fillRect(0,0,width,height);
  ctx!.fillStyle='#28374a';for(let x=20;x<width;x+=24)for(let y=20;y<height;y+=24){ctx!.beginPath();ctx!.arc(x,y,.7,0,Math.PI*2);ctx!.fill();}
  const objects:{z:number;draw:()=>void}[]=[];
  function line(a:Vec,b:Vec,color:string,w=1,dash:number[]=[]){const aa=project(a),bb=project(b);ctx!.beginPath();ctx!.setLineDash(dash);ctx!.strokeStyle=color;ctx!.lineWidth=w;ctx!.moveTo(aa[0],aa[1]);ctx!.lineTo(bb[0],bb[1]);ctx!.stroke();ctx!.setLineDash([]);}
  function label(v:Vec,text:string,color:string,dx=9,dy=-9){if(!options.labels)return;const q=project(v);ctx!.font='500 14px system-ui';ctx!.textAlign='left';ctx!.lineWidth=4;ctx!.strokeStyle='#0c1828';ctx!.strokeText(text,q[0]+dx,q[1]+dy);ctx!.fillStyle=color;ctx!.fillText(text,q[0]+dx,q[1]+dy);}
  function arrow(a:Vec,b:Vec,color:string,w=2,dash:number[]=[]){line(a,b,color,w,dash);const aa=project(a),bb=project(b),ang=Math.atan2(bb[1]-aa[1],bb[0]-aa[0]);if(Math.hypot(bb[1]-aa[1],bb[0]-aa[0])<4)return;ctx!.beginPath();ctx!.fillStyle=color;ctx!.moveTo(bb[0],bb[1]);ctx!.lineTo(bb[0]-10*Math.cos(ang-.35),bb[1]-10*Math.sin(ang-.35));ctx!.lineTo(bb[0]-10*Math.cos(ang+.35),bb[1]-10*Math.sin(ang+.35));ctx!.closePath();ctx!.fill();}
  const bas=real?direct:reciprocal;const range=real?1:2;
  // Finite crop of the infinite lattice. Unit edges retain the same physical scale.
  for(let i=-range;i<=range;i++)for(let j=-range;j<=range;j++)for(let k=-range;k<=range;k++){
   const idx:Vec=[i,j,k];if(options.slice&&k!==0)continue;const pt=transform(bas,idx);const q=project(pt);const selected=!real&&i===h[0]&&j===h[1]&&k===h[2];
   if(real)for(let d=0;d<3;d++){if(options.slice&&d===2)continue;if(idx[d]<range){const end=[...idx] as Vec;end[d]++;line(pt,transform(bas,end),'#354458',.8);}}
   else if(k===0&&(i===0||j===0))for(let d=0;d<2;d++){if(idx[d]<range){const end=[...idx] as Vec;end[d]++;line(pt,transform(bas,end),'#2d465c',.8);}}
   if(options.points||!real)objects.push({z:q[2],draw:()=>{ctx!.beginPath();ctx!.arc(q[0],q[1],selected?6:real?3.8:3,0,2*Math.PI);ctx!.fillStyle=selected?'#ffc37e':real?'#aebed0':'#6db8ce';ctx!.fill();if(!real)picks.push({x:q[0],y:q[1],z:q[2],h:idx});}});
  }
  if(real&&options.planes&&!empty){
   for(let m=-2;m<=2;m++){
    if(options.slice){if(h[0]===0&&h[1]===0){if(m===0){const q=([[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]] as Vec[]).map(v=>project(transform(direct,v)));ctx!.beginPath();q.forEach((v,i)=>i?ctx!.lineTo(v[0],v[1]):ctx!.moveTo(v[0],v[1]));ctx!.closePath();ctx!.fillStyle=`rgba(246,183,118,${options.opacity})`;ctx!.fill();ctx!.strokeStyle='#f6b776';ctx!.stroke();}continue;}const points:Vec[]=[];const corners:Vec[]=[[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]];for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],da=dot(h,a)-m,db=dot(h,b)-m;if(Math.abs(da)<1e-8)points.push(transform(direct,a));if(da*db<0)points.push(transform(direct,add(a,mul(add(b,mul(a,-1)),da/(da-db)))));}if(points.length>=2)line(points[0],points[1],'#f6b776',2.5);continue;}
    const poly=planePolygon(h,m,direct);if(poly.length<3)continue;const q=poly.map(project);objects.push({z:q.reduce((s,a)=>s+a[2],0)/q.length,draw:()=>{ctx!.beginPath();q.forEach((v,i)=>i?ctx!.lineTo(v[0],v[1]):ctx!.moveTo(v[0],v[1]));ctx!.closePath();ctx!.fillStyle=`rgba(246,183,118,${options.opacity*(m===0?1:.52)})`;ctx!.fill();ctx!.strokeStyle=m===0?'#e8b579':'#aa865d';ctx!.lineWidth=m===0?1.5:1;ctx!.stroke();}});
   }
  }
  objects.sort((a,b)=>a.z-b.z).forEach(o=>o.draw());
  const origin:Vec=[0,0,0];const bases=real?direct:reciprocal;
  bases.forEach((v,i)=>{if(options.slice&&i===2)return;arrow(origin,v,colors[i],2);label(v,(!real&&factor!==1?'2π':'')+['a','b','c'][i]+(real?'':'*'),colors[i],8,17);});
  if(!empty){
   if(real){
    const n=unit(g),end=mul(n,5);arrow(origin,end,'#ffd095',2.5);label(end,'normal n̂','#ffd095');
    const d=1/gn;const shift=mul(unit(cross(n,Math.abs(n[2])<.9?[0,0,1]:[0,1,0])),1.4);const finish=add(shift,mul(n,d));arrow(shift,finish,'#fff0d9',1.5);arrow(finish,shift,'#fff0d9',1.5);label(mul(add(shift,finish),.5),'d','#fff0d9',8,0);
    if(options.direction){const v=mul(unit(transform(direct,h)),5);arrow(origin,v,'#bd9bff',2,[5,4]);label(v,'[hkl]','#bd9bff',8,24);}
   }else{
    arrow(origin,g,'#ffc37e',2.5);const q=project(g);ctx!.beginPath();ctx!.arc(q[0],q[1],7,0,Math.PI*2);ctx!.fillStyle='#ffc37e';ctx!.shadowColor='#ffc37e';ctx!.shadowBlur=17;ctx!.fill();ctx!.shadowBlur=0;ctx!.beginPath();ctx!.arc(q[0],q[1],12,0,Math.PI*2);ctx!.strokeStyle='#ffc37e66';ctx!.stroke();label(g,`(${h.join(' ')})`,'#ffe0b5',13,-13);picks.push({x:q[0],y:q[1],z:q[2]+100,h});
   }
  }
  label(origin,'O','#a7b8cc',-17,18);
  // Orthographic screen scale, independent of the lattice lengths.
  const bar=real?2:.25;const x=24,y=height-27;ctx!.strokeStyle='#a9b8c9';ctx!.lineWidth=1;ctx!.beginPath();ctx!.moveTo(x,y-4);ctx!.lineTo(x,y);ctx!.lineTo(x+bar*scale,y);ctx!.lineTo(x+bar*scale,y-4);ctx!.stroke();ctx!.font='12px system-ui';ctx!.fillStyle='#a9b8c9';ctx!.textAlign='left';ctx!.fillText(real?'2 Å':`${(bar*factor).toFixed(factor===1?2:3)} Å⁻¹`,x,y-10);
  ctx!.textAlign='right';ctx!.fillStyle='#788da7';ctx!.fillText(options.slice?'z = 0 section':'Orthographic 3D',width-20,height-25);
 }
 function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const down=(e:PointerEvent)=>{dragging=true;start=[e.clientX,e.clientY];last=start;canvas.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent)=>{if(!dragging)return;const p=latest.current;const dx=e.clientX-last[0],dy=e.clientY-last[1];last=[e.clientX,e.clientY];if(!p.options.slice)p.setCamera({...p.camera,yaw:p.camera.yaw-dx*.008,el:Math.max(-1.5,Math.min(1.5,p.camera.el+dy*.008))});};
 const up=(e:PointerEvent)=>{if(!dragging)return;dragging=false;if(Math.hypot(e.clientX-start[0],e.clientY-start[1])<5&&latest.current.kind==='reciprocal'){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const pick=picks.filter(q=>Math.hypot(q.x-x,q.y-y)<13).sort((a,b)=>b.z-a.z)[0];if(pick)latest.current.onSelect(pick.h);}};
 const wheel=(e:WheelEvent)=>{e.preventDefault();const p=latest.current;p.setCamera({...p.camera,zoom:Math.max(.35,Math.min(2.5,p.camera.zoom*Math.exp(-e.deltaY*.001)))});};
 const key=(e:KeyboardEvent)=>{const p=latest.current;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();p.setCamera({...p.camera,yaw:p.camera.yaw+(e.key==='ArrowLeft'?.1:e.key==='ArrowRight'?-.1:0),el:Math.max(-1.5,Math.min(1.5,p.camera.el+(e.key==='ArrowUp'?.1:e.key==='ArrowDown'?-.1:0))),zoom:Math.max(.35,Math.min(2.5,p.camera.zoom*(e.key==='+'?1.1:e.key==='-'?.9:1)))});}};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',key);
 let prev='';function tick(){const stamp=JSON.stringify(latest.current);if(stamp!==prev){draw();prev=stamp;}raf=requestAnimationFrame(tick);}tick();
 return()=>{cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',key);};
 },[]);
 return <canvas ref={ref} className="lattice-canvas" tabIndex={0} aria-label={`${p.kind==='real'?'Real-space planes':'Reciprocal lattice, clickable points'}. Drag to rotate. Scroll to zoom. Keyboard arrows rotate; plus and minus zoom. Selected indices ${p.h.join(', ')}.`}/>;
}
