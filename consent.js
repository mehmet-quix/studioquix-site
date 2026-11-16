/* StudioQuix — cookie notice, consent storage and small page polish.
   Analytics: put a Google Analytics 4 ID (e.g. "G-XXXXXXXXXX") below. It is loaded ONLY after the visitor accepts. */
(function(){
  var ANALYTICS_ID="";
  var KEY="sq_consent", root=/\/projects\//.test(location.pathname)?"../":"";

  function read(){ try{var m=document.cookie.match(/(?:^|; )sq_consent=([^;]+)/); return (m&&m[1])||localStorage.getItem(KEY);}catch(e){return null;} }
  function save(v){
    try{localStorage.setItem(KEY,v);}catch(e){}
    document.cookie="sq_consent="+v+"; max-age="+(60*60*24*180)+"; path=/; SameSite=Lax";
  }
  function analytics(){
    if(!ANALYTICS_ID||window.__sqGA) return; window.__sqGA=true;
    var s=document.createElement("script"); s.async=true; s.src="https://www.googletagmanager.com/gtag/js?id="+ANALYTICS_ID; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){dataLayer.push(arguments);};
    gtag("js",new Date()); gtag("config",ANALYTICS_ID,{anonymize_ip:true});
  }
  function banner(){
    if(document.querySelector(".sq-cookie")) return;
    var el=document.createElement("div"); el.className="sq-cookie"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Cookie notice");
    el.innerHTML='<div class="sq-cookie-k"><span>COOKIES</span><span>STUDIOQUIX®</span></div>'+
      '<p>This site uses a cookie to remember your choice and, only if you accept, analytics cookies to understand visits. No advertising, no tracking across sites. <a href="'+root+'privacy.html">Privacy</a></p>'+
      '<div class="sq-cookie-btns"><button type="button" data-c="declined">DECLINE</button><button type="button" data-c="accept">ACCEPT</button></div>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add("on");});});
    el.addEventListener("click",function(e){
      var b=e.target.closest("button"); if(!b) return;
      var v=b.dataset.c==="accept"?"accepted":"declined"; save(v); if(v==="accepted") analytics();
      el.classList.remove("on"); setTimeout(function(){el.remove();},500);
    });
  }
  window.SQCookies={open:banner};
  function start(){
    var c=read();
    if(c==="accepted") analytics(); else if(!c) setTimeout(banner,/index\.html$|\/$/.test(location.pathname)?3600:900);
    document.querySelectorAll(".sq-cookie-link").forEach(function(b){b.addEventListener("click",banner);});

    // images ease in
    document.querySelectorAll("main img").forEach(function(img){
      if(img.complete) return;
      img.classList.add("sq-pending");
      var done=function(){img.classList.remove("sq-pending"); img.classList.add("sq-ready");};
      img.addEventListener("load",done,{once:true}); img.addEventListener("error",done,{once:true});
    });

    // project pages: reading progress + back to top
    if(root){
      var bar=document.createElement("div"); bar.className="sq-progress"; document.body.appendChild(bar);
      var top=document.createElement("button"); top.className="sq-top"; top.type="button"; top.setAttribute("aria-label","Back to top"); top.textContent="↑"; document.body.appendChild(top);
      top.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
      var tick=false, upd=function(){
        var h=document.documentElement.scrollHeight-innerHeight, y=scrollY;
        bar.style.transform="scaleX("+(h>0?Math.min(1,y/h):0)+")";
        top.classList.toggle("on",y>innerHeight*1.2); tick=false;
      };
      addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true}); upd();
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
