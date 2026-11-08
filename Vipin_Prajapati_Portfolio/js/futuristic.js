import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.mjs";

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const touch = window.matchMedia("(pointer: coarse)").matches;
const canvas = document.querySelector("#hero-canvas");

if (canvas && !reduced && window.WebGLRenderingContext) {
  const host = canvas.parentElement, scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:!touch,powerPreference:"low-power"}); }
  catch (error) { canvas.hidden = true; }
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.15 : 1.6));
    renderer.setClearColor(0, 0);
    const group = new THREE.Group(); scene.add(group);
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 5);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({color:0x3344a8,metalness:.72,roughness:.24,emissive:0x18245c,emissiveIntensity:.65}));
    group.add(core);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.39,2),new THREE.MeshBasicMaterial({color:0x8b9cff,wireframe:true,transparent:true,opacity:.25}));
    group.add(wire);
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.02,.012,8,180),new THREE.MeshBasicMaterial({color:0x67e8f9,transparent:true,opacity:.72}));
    ringA.rotation.set(1.12,.28,-.35); group.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.35,.008,8,180),new THREE.MeshBasicMaterial({color:0x818cf8,transparent:true,opacity:.52}));
    ringB.rotation.set(.25,1,.55); group.add(ringB);
    const count = touch ? 420 : 1100, positions = new Float32Array(count*3);
    for(let i=0;i<count;i++){const r=2.6+Math.random()*3.4,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);positions[i*3]=r*Math.sin(p)*Math.cos(t);positions[i*3+1]=r*Math.sin(p)*Math.sin(t);positions[i*3+2]=r*Math.cos(p);}
    const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const particles = new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x8b9cff,size:.018,transparent:true,opacity:.72})); scene.add(particles);
    scene.add(new THREE.AmbientLight(0x8295ff,1.25));
    const key = new THREE.PointLight(0x5ee7ff,42,18); key.position.set(3,3,4); scene.add(key);
    const violet = new THREE.PointLight(0x6d5dfc,32,16); violet.position.set(-4,-2,2); scene.add(violet);
    const pointer={x:0,y:0};
    if(!touch)host.addEventListener("pointermove",e=>{const r=host.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2;},{passive:true});
    const resize=()=>{const w=Math.max(host.clientWidth,280),h=Math.max(host.clientHeight,260);renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.x=w<600?0:.45;camera.position.z=w<600?8.7:8;camera.updateProjectionMatrix();};
    resize(); const observer=new ResizeObserver(resize); observer.observe(host);
    let frame=0,active=true;
    const render=()=>{if(!active)return;frame=requestAnimationFrame(render);const t=performance.now()*.00025;group.rotation.y+=(pointer.x*.18-group.rotation.y)*.018;group.rotation.x+=(-pointer.y*.14-group.rotation.x)*.018;core.rotation.y+=.0018;core.rotation.x=Math.sin(t*3)*.08;wire.rotation.y-=.0011;ringA.rotation.z+=.0015;ringB.rotation.x+=.0007;particles.rotation.y=t*.32;particles.rotation.x=Math.sin(t)*.08;renderer.render(scene,camera);};
    render();
    document.addEventListener("visibilitychange",()=>{if(document.hidden){active=false;cancelAnimationFrame(frame);}else if(!active){active=true;render();}});
    window.addEventListener("pagehide",()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();renderer.dispose();coreGeo.dispose();particleGeo.dispose();},{once:true});
  }
}

if(!reduced){
  try{const lenis=new Lenis({duration:1.05,smoothWheel:true,wheelMultiplier:.9});lenis.on("scroll",ScrollTrigger.update);gsap.ticker.add(time=>lenis.raf(time*1000));gsap.ticker.lagSmoothing(0);}
  catch(error){console.warn("Smooth scrolling unavailable; native scrolling remains enabled.",error);}
  gsap.utils.toArray(".reveal").forEach(el=>gsap.fromTo(el,{y:34,autoAlpha:0},{y:0,autoAlpha:1,duration:.85,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 91%",once:true}}));
  gsap.utils.toArray(".section__head").forEach(el=>gsap.fromTo(el,{y:22},{y:0,duration:.8,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 88%",once:true}}));
  if(!touch){
    document.querySelectorAll(".project-card").forEach(card=>{
      card.addEventListener("pointermove",e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gsap.to(card,{rotateY:x*7,rotateX:-y*6,transformPerspective:900,duration:.35,ease:"power2.out"});});
      card.addEventListener("pointerleave",()=>gsap.to(card,{rotateX:0,rotateY:0,duration:.55,ease:"power3.out"}));
    });
    document.querySelectorAll(".hero__cta .btn").forEach(btn=>{
      btn.addEventListener("pointermove",e=>{const r=btn.getBoundingClientRect();gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.12,duration:.25});});
      btn.addEventListener("pointerleave",()=>gsap.to(btn,{x:0,y:0,duration:.45,ease:"elastic.out(1,.5)"}));
    });
  }
}
const progress=document.querySelector(".scroll-progress"),glow=document.querySelector(".cursor-glow");
const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=(max>0?scrollY/max*100:0)+"%";};
addEventListener("scroll",update,{passive:true});update();
if(glow&&!touch&&!reduced){document.body.classList.add("has-cursor");addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px";},{passive:true});}
