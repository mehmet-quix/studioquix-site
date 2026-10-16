const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

/* ---------------------------------------------------------
   PRELOADER — deterministic, smooth, QX
--------------------------------------------------------- */
const preloader=$("#preloader");
const loadCount=$("#loadCount");
let loadStart=performance.now();
let pageReady=false;

window.addEventListener("load",()=>{ pageReady=true; });

function loaderFrame(now){
  const elapsed=now-loadStart;
  let progress=clamp(elapsed/950,0,.92);
  if(pageReady) progress=clamp(.92+(elapsed-500)/850*.08,.92,1);

  const pct=Math.round(progress*100);
  if(loadCount) loadCount.textContent=String(pct).padStart(2,"0");
  if(preloader) preloader.style.setProperty("--loader-progress", progress);

  if(progress<1){
    requestAnimationFrame(loaderFrame);
  }else{
    setTimeout(()=>{
      preloader?.classList.add("hide");
      document.body.classList.add("loaded");
    },160);
  }
}
requestAnimationFrame(loaderFrame);

/* ---------------------------------------------------------
   SCROLL PROGRESS
--------------------------------------------------------- */
const progress=$("#progress");
function updateProgress(){
  const max=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.width=(max>0?scrollY/max*100:0)+"%";
}
window.addEventListener("scroll",updateProgress,{passive:true});
updateProgress();

/* ---------------------------------------------------------
   CUSTOM CURSOR
--------------------------------------------------------- */
const cursor=$("#cursor");
let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
window.addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY});
function cursorLoop(){
  cx+=(mx-cx)*.18;
  cy+=(my-cy)*.18;
  if(cursor){
    cursor.style.left=cx+"px";
    cursor.style.top=cy+"px";
  }
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

function cursorOn(label="VIEW"){
  if(!cursor) return;
  const span=$("span",cursor);
  if(span) span.textContent=label;
  cursor.classList.add("active");
}
function cursorOff(){
  cursor?.classList.remove("active");
}

/* ---------------------------------------------------------
   MAGNETIC LINKS — intentionally subtle
--------------------------------------------------------- */
$$(".magnetic").forEach(el=>{
  el.addEventListener("pointermove",e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.11;
    const y=(e.clientY-r.top-r.height/2)*.11;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener("pointerleave",()=>el.style.transform="translate(0,0)");
});

/* ---------------------------------------------------------
   SECTION / ELEMENT REVEALS
--------------------------------------------------------- */
const revealIO=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealIO.unobserve(entry.target);
    }
  });
},{threshold:.12,rootMargin:"0px 0px -5% 0px"});
$$(".reveal").forEach(el=>revealIO.observe(el));

const sectionIO=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("is-inview");
  });
},{threshold:.12,rootMargin:"0px 0px -8% 0px"});
$$(".reveal-section").forEach(el=>sectionIO.observe(el));

/* ---------------------------------------------------------
   ACTIVE NAV
--------------------------------------------------------- */
const sections=["home","about","works","contact"]
  .map(id=>document.getElementById(id))
  .filter(Boolean);

const navLinks=$$(".nav-links a");
const navIO=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    navLinks.forEach(a=>a.classList.toggle(
      "is-active",
      a.getAttribute("href")==="#"+entry.target.id
    ));
  });
},{threshold:.2,rootMargin:"-25% 0px -60% 0px"});
sections.forEach(s=>navIO.observe(s));

/* ---------------------------------------------------------
   HOME ORBIT — persistent XYZ orientation + subtle live motion
--------------------------------------------------------- */
const projectData=[
  ["ULLR TENGRI","assets/projects/ullr-tengri/render-01-aurora.jpg","projects/ullr-tengri.html"],
  ["KENT ENSTİTÜSÜ","assets/projects/kent-enstitusu/cover.jpg","projects/kent-enstitusu.html"],
  ["DİŞ FAKÜLTESİ","assets/projects/dental-faculty/final-render.jpg","projects/dental-faculty.html"],
  ["MÜŞTEREK","assets/projects/musterek/spatial-practices.jpg","projects/musterek.html"],
  ["CHELOMAR","assets/projects/chelo/thumbnail.jpg","projects/chelo.html"],
  ["VILLA BARCELONA","assets/projects/villa-barcelona/pool-dusk.jpg","projects/villa-barcelona.html"],
  ["POOL DAY","assets/projects/pool-day/02-dusk.jpg","projects/pool-day.html"],
  ["GEEK HOUSE","assets/projects/geek-house/01-living.jpg","projects/geek-house.html"],
  ["LOFI HOUSE","assets/projects/lofi-house/01-loft.jpg","projects/lofi-house.html"],
  ["CINEMA BEDROOM","assets/projects/cinema-bedroom/01-screen.jpg","projects/cinema-bedroom.html"],
  ["BUHARA ARENA by BKA","assets/projects/buhara-arena/01-sunset.jpg","projects/buhara-arena.html"],
  ["ATATÜRK STADYUMU by BKA","assets/projects/ataturk-stadyumu/10.jpg","projects/ataturk-stadyumu.html"],
  ["YANGI TOSHKENT ARENA by BKA","assets/projects/yangi-toshkent-arena/arena-sign.jpg","projects/yangi-toshkent-arena.html"]
];

const stage=$("#orbitalStage");
const orbitWrap=$("#orbitItems");
const orbitNodes=[];
const points=[];
let hoveredIndex=-1;

projectData.forEach((p,i)=>{
  const el=document.createElement("a");
  el.href=p[2];
  el.className="orbit-item";
  el.dataset.projectUrl=p[2];
  el.dataset.projectIndex=i;
  el.style.opacity="0";
  el.innerHTML=`<img src="${p[1]}" alt="${p[0]}"><span>${String(i+1).padStart(2,"0")} / ${p[0]}</span>`;
  orbitWrap?.appendChild(el);
  orbitNodes.push(el);

  const phi=Math.acos(-1+(2*i+1)/projectData.length);
  const theta=Math.sqrt(projectData.length*Math.PI)*phi;
  points.push({
    x:Math.cos(theta)*Math.sin(phi),
    y:Math.sin(theta)*Math.sin(phi),
    z:Math.cos(phi)
  });

  el.addEventListener("pointerenter",()=>{
    hoveredIndex=i;
    cursorOn("OPEN");
  });
  el.addEventListener("pointerleave",()=>{
    hoveredIndex=-1;
    cursorOff();
  });
  el.addEventListener("click",e=>e.preventDefault());
});

/* ---------------------------------------------------------
   ELECTRON MODE (opt-in: window.ORBIT_MODE='electron')
   three inclined circular orbits around the QX nucleus;
   projects ride along them slowly, pause on hover/touch.
--------------------------------------------------------- */
const ELECTRON = window.ORBIT_MODE==="electron";
const RINGS=[ // inclination (rad) around X, then spin around Z — a classic atom figure
  {tilt:1.18, spin:0.00,  speed: .055},
  {tilt:1.18, spin:1.05,  speed:-.045},
  {tilt:1.18, spin:-1.05, speed: .040}
];
// ring 0: own studio work · ring 1: studio projects · ring 2: BKA visualisation work
const RING_OF=i=>{const t=projectData[i][0]; if(/BKA/.test(t)) return 2; if(/VILLA|MÜŞTEREK|CHELOMAR|POOL DAY|GEEK HOUSE|LOFI HOUSE|CINEMA BEDROOM/.test(t)) return 1; return 0;};
const ringMembers=[[],[],[]]; projectData.forEach((p,i)=>ringMembers[RING_OF(i)].push(i));
const ringPhase=projectData.map((p,i)=>{const r=RING_OF(i),m=ringMembers[r]; return (m.indexOf(i)/m.length)*Math.PI*2 + r*0.7;});
function ringPoint(r,theta){
  // circle in XY plane, tilt around X, spin around Z
  let x=Math.cos(theta), y=Math.sin(theta), z=0;
  const ct=Math.cos(RINGS[r].tilt), st=Math.sin(RINGS[r].tilt);
  let y1=y*ct, z1=y*st;
  const cs=Math.cos(RINGS[r].spin), ss=Math.sin(RINGS[r].spin);
  return {x:x*cs-y1*ss, y:x*ss+y1*cs, z:z1};
}
let electronClock=0, electronSpeed=1;
const ELECTRON_SCALE=()=>window.innerWidth<700?0.74:0.92;
let ringCanvas=null, ringCtx=null;
if(ELECTRON && stage){
  document.body.classList.add("orbit-electron");
  ringCanvas=document.createElement("canvas"); ringCanvas.className="electron-rings";
  stage.insertBefore(ringCanvas,stage.firstChild); ringCtx=ringCanvas.getContext("2d");
}
function drawRings(radius){
  if(!ringCtx) return;
  const w=stage.clientWidth,h=stage.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);
  if(ringCanvas.width!==Math.round(w*dpr)){ringCanvas.width=Math.round(w*dpr);ringCanvas.height=Math.round(h*dpr);}
  ringCtx.setTransform(dpr,0,0,dpr,0,0); ringCtx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2;
  for(let r=0;r<RINGS.length;r++){
    let prev=null;
    for(let k=0;k<=160;k++){
      const q=rotatePoint(ringPoint(r,k/160*Math.PI*2),rx,ry,rz);
      const pt={x:cx+q.x*radius,y:cy+q.y*radius,d:(q.z+1)/2};
      if(prev){
        ringCtx.strokeStyle=`rgba(240,240,235,${(.05+.30*((prev.d+pt.d)/2)).toFixed(3)})`;
        ringCtx.lineWidth=1;
        ringCtx.beginPath();ringCtx.moveTo(prev.x,prev.y);ringCtx.lineTo(pt.x,pt.y);ringCtx.stroke();
      }
      prev=pt;
    }
  }
}

// These three values are the actual orbit orientation.
// They never snap back to zero; when idle the orbit slowly spins around Y.
let ry=0, rx=-0.12, rz=0;
let targetRy=0, targetRx=-0.12, targetRz=0;

let drag=false;
let dragConfirmed=false;
let pointerId=null;
let downX=0,downY=0,lastX=0,lastY=0;
let downProject=null;
let orbitIntro=0;
let lastTime=performance.now();
const DRAG_THRESHOLD=7;
const AUTO_SPIN_SPEED=.0024; // rad per frame (~45 s per full turn)
let autoSpin=0, spinResumeAt=0;

stage?.addEventListener("pointerenter",e=>{
  if(!e.target.closest?.(".orbit-item")) cursorOn("DRAG");
});
stage?.addEventListener("pointerleave",()=>{ if(!drag) cursorOff(); });

stage?.addEventListener("pointerdown",e=>{
  if(e.button !== undefined && e.button !== 0) return;
  drag=true;
  dragConfirmed=false;
  pointerId=e.pointerId;
  downX=lastX=e.clientX;
  downY=lastY=e.clientY;
  downProject=e.target.closest?.(".orbit-item") || null;
  stage.classList.add("is-pointer-down");
  cursorOn(downProject ? "OPEN" : "DRAG");
});

stage?.addEventListener("pointermove",e=>{
  if(!drag || (pointerId!==null && e.pointerId!==pointerId)) return;

  const totalX=e.clientX-downX;
  const totalY=e.clientY-downY;
  const distance=Math.hypot(totalX,totalY);

  // Touch: a mostly-vertical swipe is a page scroll — let the browser have it.
  if(!dragConfirmed && e.pointerType==="touch" && Math.abs(totalY)>Math.abs(totalX) && distance>=DRAG_THRESHOLD){
    finishOrbitPointer(e,true);
    return;
  }

  if(!dragConfirmed && distance>=DRAG_THRESHOLD){
    dragConfirmed=true;
    stage.classList.add("is-dragging");
    stage.classList.remove("is-pointer-down");
    stage.setPointerCapture?.(e.pointerId);
    cursorOn("DRAG");
  }
  if(!dragConfirmed) return;

  const dx=e.clientX-lastX;
  // On touch screens vertical swipes belong to page scrolling (touch-action: pan-y),
  // so the orbit only follows horizontal finger movement there.
  const dy=e.pointerType==="touch" ? 0 : e.clientY-lastY;

  // X / Y / Z are all persistent.
  targetRy += dx*.0082;
  targetRx += dy*.0060;
  targetRx = clamp(targetRx,-1.15,1.15);

  // Diagonal motion gives a subtle roll around Z.
  targetRz += (dx*.0012) - (dy*.0006);
  targetRz = clamp(targetRz,-.72,.72);

  lastX=e.clientX;
  lastY=e.clientY;
});

function finishOrbitPointer(e,cancelled=false){
  if(!drag) return;
  const wasDrag=dragConfirmed;
  const clickedProject=downProject;

  drag=false;
  dragConfirmed=false;
  stage?.classList.remove("is-dragging","is-pointer-down");
  if(pointerId!==null && stage?.hasPointerCapture?.(pointerId)){
    stage.releasePointerCapture(pointerId);
  }
  pointerId=null;
  downProject=null;

  if(!cancelled && !wasDrag && clickedProject){
    const url=clickedProject.dataset.projectUrl || clickedProject.getAttribute("href");
    cursorOff();
    if(url) window.location.href=url;
    return;
  }
  cursorOff();
}

stage?.addEventListener("pointerup",e=>finishOrbitPointer(e,false));
stage?.addEventListener("pointercancel",e=>finishOrbitPointer(e,true));

function rotatePoint(p,ax,ay,az){
  let x=p.x,y=p.y,z=p.z;
  let c=Math.cos(ay),s=Math.sin(ay);
  let x1=x*c-z*s, z1=x*s+z*c;

  c=Math.cos(ax);s=Math.sin(ax);
  let y1=y*c-z1*s, z2=y*s+z1*c;

  c=Math.cos(az);s=Math.sin(az);
  let x2=x1*c-y1*s, y2=x1*s+y1*c;

  return {x:x2,y:y2,z:z2};
}
function easeOutCubic(t){return 1-Math.pow(1-t,3)}

function orbitLoop(now){
  const dt=Math.min((now-lastTime)/16.67,2);
  lastTime=now;
  orbitIntro=clamp(orbitIntro+.018*dt,0,1);
  const intro=easeOutCubic(orbitIntro);

  // Idle auto-spin: the orbit keeps sliding on its own; pauses while dragging or hovering a project,
  // then eases back in a moment after the user lets go.
  const wantSpin=(drag||hoveredIndex>=0)?0:1;
  if(drag) spinResumeAt=now+1200;
  autoSpin+=((now<spinResumeAt?0:wantSpin)-autoSpin)*.035*dt;
  targetRy+=AUTO_SPIN_SPEED*autoSpin*dt;

  // Smoothly arrive at the user's chosen orientation, then stay there.
  ry+=(targetRy-ry)*(.09*dt);
  rx+=(targetRx-rx)*(.09*dt);
  rz+=(targetRz-rz)*(.09*dt);

  const radius=Math.min(stage?.clientWidth||800,stage?.clientHeight||800)*.37*intro;
  const t=now*.001;

  if(ELECTRON){
    const want=(hoveredIndex>=0||drag)?0:1;
    electronSpeed+=(want-electronSpeed)*.06*dt;
    electronClock+=dt/60*electronSpeed;
    drawRings(radius*ELECTRON_SCALE());
  }
  points.forEach((p,i)=>{
    if(ELECTRON){ const r=RING_OF(i); p=ringPoint(r,ringPhase[i]+electronClock*RINGS[r].speed*6); const k=ELECTRON_SCALE(); p={x:p.x*k,y:p.y*k,z:p.z}; }
    // idle tumble: besides spinning around Y, the orbit slowly tips up/down (X) and rolls (Z)
    const wob=autoSpin;
    const q=rotatePoint(p, rx+wob*.42*Math.sin(t*.21), ry, rz+wob*.22*Math.sin(t*.15+1.3));
    const depth=(q.z+1)/2;

    // Live animation without changing orbital orientation:
    // a very small breathing scale / light pulse only.
    const breath=1+Math.sin(t*1.25+i*.9)*.010;
    const hoverBoost=i===hoveredIndex?1.08:1;
    const scale=(.66+depth*.52)*hoverBoost*breath*(.78+.22*intro);
    const opacity=(.28+depth*.72)*intro;

    const x=q.x*radius;
    const y=q.y*radius;

    orbitNodes[i].style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    orbitNodes[i].style.opacity=opacity;
    orbitNodes[i].style.zIndex=10+Math.round(depth*60)+(i===hoveredIndex?80:0);
    orbitNodes[i].style.filter=`blur(${(1-depth)*.42}px) brightness(${1+Math.sin(t*.9+i)*.025})`;
    orbitNodes[i].style.pointerEvents=depth<.09 ? "none" : "auto";
    if(ELECTRON) orbitNodes[i].classList.toggle("is-front",depth>.72||i===hoveredIndex);
  });

  requestAnimationFrame(orbitLoop);
}
requestAnimationFrame(orbitLoop);

/* ---------------------------------------------------------
   PROJECT CARD MICRO-MOTION
--------------------------------------------------------- */
$$(".project-card").forEach(card=>{
  const img=$(".project-media img",card);
  const hit=$(".project-hit",card);

  hit?.addEventListener("pointerenter",()=>cursorOn("OPEN"));
  hit?.addEventListener("pointerleave",cursorOff);

  card.addEventListener("pointermove",e=>{
    if(!img || innerWidth<900) return;
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5;
    const py=(e.clientY-r.top)/r.height-.5;
    img.style.transform=`scale(1.045) translate(${px*-5}px,${py*-5}px)`;
  });

  card.addEventListener("pointerleave",()=>{
    if(img) img.style.transform="";
  });
});

/* ---------------------------------------------------------
   GRID / LIST — soft transition
--------------------------------------------------------- */
$$(".view-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const grid=$("#projectGrid");
    if(!grid || btn.classList.contains("active")) return;

    grid.classList.add("is-switching");

    setTimeout(()=>{
      $$(".view-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      grid.classList.toggle("list-view",btn.dataset.view==="list");
      requestAnimationFrame(()=>grid.classList.remove("is-switching"));
    },150);
  });
});

/* ---------------------------------------------------------
   PROJECT MODAL
--------------------------------------------------------- */
const modal=$("#projectModal");
const modalClose=$("#modalClose");

$$(".project-card").forEach(card=>{
  card.querySelector(".project-hit")?.addEventListener("click",()=>{
    const url=card.dataset.url;
    if(url){
      window.location.href=url;
      return;
    }

    $("#modalTitle").textContent=card.dataset.title;
    $("#modalType").textContent=card.dataset.type;
    $("#modalYear").textContent=card.dataset.year;
    $("#modalImage").src=card.dataset.image;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
    cursorOff();
  });
});

function closeModal(){
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}
modalClose?.addEventListener("click",closeModal);
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

/* About photo cycle — click/tap to crossfade through photos */
(function(){
  const box=document.querySelector(".photo-cycle"); if(!box) return;
  const imgs=[...box.querySelectorAll(".founder-photo")], num=box.querySelector(".photo-count");
  let i=0; const pad=n=>String(n).padStart(2,"0");
  if(num) num.innerHTML=`<b>01</b> / ${pad(imgs.length)}`;
  box.addEventListener("click",()=>{
    imgs[i].classList.remove("is-active"); i=(i+1)%imgs.length; imgs[i].classList.add("is-active");
    if(num) num.innerHTML=`<b>${pad(i+1)}</b> / ${pad(imgs.length)}`;
  });
})();
