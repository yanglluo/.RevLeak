(()=>{var e={};e.id=988,e.ids=[988],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},5752:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>o.a,__next_app__:()=>u,originalPathname:()=>p,pages:()=>c,routeModule:()=>m,tree:()=>d}),s(6802),s(3817),s(5866);var a=s(3191),r=s(8716),i=s(7922),o=s.n(i),n=s(5231),l={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>n[e]);s.d(t,l);let d=["",{children:["integrations",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,6802)),"/Users/yangluo/Desktop/RevLeak_V5/src/app/integrations/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,3817)),"/Users/yangluo/Desktop/RevLeak_V5/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,5866,23)),"next/dist/client/components/not-found-error"]}],c=["/Users/yangluo/Desktop/RevLeak_V5/src/app/integrations/page.tsx"],p="/integrations/page",u={require:s,loadChunk:()=>Promise.resolve()},m=new a.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/integrations/page",pathname:"/integrations",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},718:(e,t,s)=>{Promise.resolve().then(s.bind(s,6478))},6307:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});let a=(0,s(2881).Z)("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},7506:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});let a=(0,s(2881).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},6478:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>y});var a=s(326),r=s(7577),i=s(3973),o=s(3634),n=s(5932),l=s(617),d=s(2881);let c=(0,d.Z)("Webhook",[["path",{d:"M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",key:"q3hayz"}],["path",{d:"m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06",key:"1go1hn"}],["path",{d:"m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8",key:"qlwsc0"}]]),p=(0,d.Z)("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);var u=s(7506),m=s(6307),g=s(8378),f=s(381);function y(){let[e,t]=(0,r.useState)(null),[s,d]=(0,r.useState)(!0),y=[{id:"stripe",name:"Stripe",description:"Connect your Stripe account to detect revenue leaks",icon:o.Z,iconBg:"linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)",connected:!0===e,status:e?"Active":"Configure API key",configUrl:"/settings"},{id:"email",name:"Email Alerts",description:"Receive leak alerts via email",icon:n.Z,iconBg:"linear-gradient(135deg, #10b981 0%, #059669 100%)",connected:!0,status:"Active",configUrl:"/settings"},{id:"slack",name:"Slack",description:"Get real-time notifications in Slack",icon:l.Z,iconBg:"linear-gradient(135deg, #4A154B 0%, #611f69 100%)",connected:!1,status:"Not configured",configUrl:"/settings"},{id:"webhook",name:"Custom Webhooks",description:"Send leak events to your own systems",icon:c,iconBg:"linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",connected:!1,status:"Not configured"},{id:"supabase",name:"Supabase",description:"Store leak data and user settings",icon:p,iconBg:"linear-gradient(135deg, #3ecf8e 0%, #1c7a4f 100%)",connected:!1,status:"Coming soon"}];return(0,a.jsxs)(i.Z,{title:"Integrations",subtitle:"Connect RevLeak with your existing tools",children:[a.jsx(f.x7,{position:"top-right",toastOptions:{style:{background:"rgba(10, 10, 10, 0.95)",color:"#fff",border:"1px solid rgba(0, 255, 102, 0.2)",backdropFilter:"blur(12px)"},success:{iconTheme:{primary:"#00ff66",secondary:"#000"}}}}),a.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))",gap:"var(--space-4)"},children:y.map(e=>{let t=e.icon;return(0,a.jsxs)("div",{className:"card",children:[a.jsx("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:(0,a.jsxs)("div",{style:{display:"flex",gap:"var(--space-4)"},children:[a.jsx("div",{style:{width:56,height:56,borderRadius:"var(--radius-lg)",background:e.iconBg,display:"flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:a.jsx(t,{size:28})}),(0,a.jsxs)("div",{children:[a.jsx("h3",{className:"font-semibold text-lg",children:e.name}),a.jsx("p",{className:"text-sm text-secondary mt-1",children:e.description})]})]})}),(0,a.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"var(--space-5)",paddingTop:"var(--space-4)",borderTop:"1px solid var(--border-subtle)"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-2)"},children:[s&&"stripe"===e.id?a.jsx(u.Z,{size:16,className:"animate-spin text-muted"}):e.connected?a.jsx(m.Z,{size:16,className:"text-success"}):a.jsx("div",{style:{width:8,height:8,borderRadius:"var(--radius-full)",background:"var(--text-muted)"}}),a.jsx("span",{className:`text-sm ${e.connected?"text-success":"text-muted"}`,children:e.status})]}),e.configUrl?(0,a.jsxs)("a",{href:e.configUrl,className:"btn btn-secondary btn-sm",children:[a.jsx(g.Z,{size:14}),"Configure"]}):a.jsx("button",{className:"btn btn-secondary btn-sm",disabled:!0,children:"Coming Soon"})]})]},e.id)})}),(0,a.jsxs)("div",{className:"card mt-8",children:[a.jsx("h2",{className:"card-title mb-4",children:"Stripe Webhook Events"}),a.jsx("p",{className:"text-secondary mb-4",children:"RevLeak listens to the following Stripe webhook events for real-time leak detection:"}),a.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",gap:"var(--space-3)"},children:[{event:"invoice.payment_failed",desc:"Detect payment failures"},{event:"invoice.payment_succeeded",desc:"Resolve payment leaks"},{event:"customer.subscription.updated",desc:"Monitor status changes"},{event:"customer.subscription.deleted",desc:"Track cancellations"},{event:"charge.dispute.created",desc:"Alert on disputes"},{event:"payment_method.card_automatically_updated",desc:"Resolve card leaks"}].map(({event:e,desc:t})=>(0,a.jsxs)("div",{style:{padding:"var(--space-3)",background:"var(--bg-elevated)",borderRadius:"var(--radius-md)"},children:[a.jsx("code",{className:"text-accent text-sm",children:e}),a.jsx("p",{className:"text-xs text-muted mt-1",children:t})]},e))})]})]})}},6802:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>a});let a=(0,s(8570).createProxy)(String.raw`/Users/yangluo/Desktop/RevLeak_V5/src/app/integrations/page.tsx#default`)},381:(e,t,s)=>{"use strict";s.d(t,{x7:()=>ec,ZP:()=>ep});var a,r=s(7577);let i={data:""},o=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let s="",a="",r="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?s=i+" "+o+";":a+="f"==i[1]?c(o,i):i+"{"+c(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=c(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=c.p?c.p(i,o):i+":"+o+";")}return s+(t&&r?t+"{"+r+"}":r)+a},p={},u=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+u(e[s]);return t}return e},m=(e,t,s,a,r)=>{let i=u(e),o=p[i]||(p[i]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(i));if(!p[o]){let t=i!==e?e:(e=>{let t,s,a=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?a.shift():t[3]?(s=t[3].replace(d," ").trim(),a.unshift(a[0][s]=a[0][s]||{})):a[0][t[1]]=t[2].replace(d," ").trim();return a[0]})(e);p[o]=c(r?{["@keyframes "+o]:t}:t,s?"":"."+o)}let m=s&&p.g?p.g:null;return s&&(p.g=p[o]),((e,t,s,a)=>{a?t.data=t.data.replace(a,e):-1===t.data.indexOf(e)&&(t.data=s?e+t.data:t.data+e)})(p[o],t,a,m),o},g=(e,t,s)=>e.reduce((e,a,r)=>{let i=t[r];if(i&&i.call){let e=i(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function f(e){let t=this||{},s=e.call?e(t.p):e;return m(s.unshift?s.raw?g(s,[].slice.call(arguments,1),t.p):s.reduce((e,s)=>Object.assign(e,s&&s.call?s(t.p):s),{}):s,o(t.target),t.g,t.o,t.k)}f.bind({g:1});let y,h,x,b=f.bind({k:1});function v(e,t){let s=this||{};return function(){let a=arguments;function r(i,o){let n=Object.assign({},i),l=n.className||r.className;s.p=Object.assign({theme:h&&h()},n),s.o=/ *go\d+/.test(l),n.className=f.apply(s,a)+(l?" "+l:""),t&&(n.ref=o);let d=e;return e[0]&&(d=n.as||e,delete n.as),x&&d[0]&&x(n),y(d,n)}return t?t(r):r}}var k=e=>"function"==typeof e,w=(e,t)=>k(e)?e(t):e,j=(()=>{let e=0;return()=>(++e).toString()})(),C=(()=>{let e;return()=>e})(),E="default",_=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return _(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},N=[],P={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},A={},D=(e,t=E)=>{A[t]=_(A[t]||P,e),N.forEach(([e,s])=>{e===t&&s(A[t])})},$=e=>Object.keys(A).forEach(t=>D(e,t)),S=e=>Object.keys(A).find(t=>A[t].toasts.some(t=>t.id===e)),z=(e=E)=>t=>{D(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},O=(e={},t=E)=>{let[s,a]=(0,r.useState)(A[t]||P),i=(0,r.useRef)(A[t]);(0,r.useEffect)(()=>(i.current!==A[t]&&a(A[t]),N.push([t,a]),()=>{let e=N.findIndex(([e])=>e===t);e>-1&&N.splice(e,1)}),[t]);let o=s.toasts.map(t=>{var s,a,r;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(s=e[t.type])?void 0:s.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||I[t.type],style:{...e.style,...null==(r=e[t.type])?void 0:r.style,...t.style}}});return{...s,toasts:o}},R=(e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||j()}),Z=e=>(t,s)=>{let a=R(t,e,s);return z(a.toasterId||S(a.id))({type:2,toast:a}),a.id},T=(e,t)=>Z("blank")(e,t);T.error=Z("error"),T.success=Z("success"),T.loading=Z("loading"),T.custom=Z("custom"),T.dismiss=(e,t)=>{let s={type:3,toastId:e};t?z(t)(s):$(s)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let s={type:4,toastId:e};t?z(t)(s):$(s)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,s)=>{let a=T.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?w(t.success,e):void 0;return r?T.success(r,{id:a,...s,...null==s?void 0:s.success}):T.dismiss(a),e}).catch(e=>{let r=t.error?w(t.error,e):void 0;r?T.error(r,{id:a,...s,...null==s?void 0:s.error}):T.dismiss(a)}),e};var L=1e3,M=(e,t="default")=>{let{toasts:s,pausedAt:a}=O(e,t),i=(0,r.useRef)(new Map).current,o=(0,r.useCallback)((e,t=L)=>{if(i.has(e))return;let s=setTimeout(()=>{i.delete(e),n({type:4,toastId:e})},t);i.set(e,s)},[]);(0,r.useEffect)(()=>{if(a)return;let e=Date.now(),r=s.map(s=>{if(s.duration===1/0)return;let a=(s.duration||0)+s.pauseDuration-(e-s.createdAt);if(a<0){s.visible&&T.dismiss(s.id);return}return setTimeout(()=>T.dismiss(s.id,t),a)});return()=>{r.forEach(e=>e&&clearTimeout(e))}},[s,a,t]);let n=(0,r.useCallback)(z(t),[t]),l=(0,r.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,r.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),c=(0,r.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),p=(0,r.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:r=8,defaultPosition:i}=t||{},o=s.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+r,0)},[s]);return(0,r.useEffect)(()=>{s.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[s,o]),{toasts:s,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:p}}},U=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,q=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${q} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,V=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,G=v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${V} 1s linear infinite;
`,H=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,W=b`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,X=v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${W} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Y=v("div")`
  position: absolute;
`,J=v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,K=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Q=v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${K} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ee=({toast:e})=>{let{icon:t,type:s,iconTheme:a}=e;return void 0!==t?"string"==typeof t?r.createElement(Q,null,t):t:"blank"===s?null:r.createElement(J,null,r.createElement(G,{...a}),"loading"!==s&&r.createElement(Y,null,"error"===s?r.createElement(F,{...a}):r.createElement(X,{...a})))},et=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,es=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ea=v("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,er=v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ei=(e,t)=>{let s=e.includes("top")?1:-1,[a,r]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[et(s),es(s)];return{animation:t?`${b(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},eo=r.memo(({toast:e,position:t,style:s,children:a})=>{let i=e.height?ei(e.position||t||"top-center",e.visible):{opacity:0},o=r.createElement(ee,{toast:e}),n=r.createElement(er,{...e.ariaProps},w(e.message,e));return r.createElement(ea,{className:e.className,style:{...i,...s,...e.style}},"function"==typeof a?a({icon:o,message:n}):r.createElement(r.Fragment,null,o,n))});a=r.createElement,c.p=void 0,y=a,h=void 0,x=void 0;var en=({id:e,className:t,style:s,onHeightUpdate:a,children:i})=>{let o=r.useCallback(t=>{if(t){let s=()=>{a(e,t.getBoundingClientRect().height)};s(),new MutationObserver(s).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return r.createElement("div",{ref:o,className:t,style:s},i)},el=(e,t)=>{let s=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(s?1:-1)}px)`,...s?{top:0}:{bottom:0},...a}},ed=f`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ec=({reverseOrder:e,position:t="top-center",toastOptions:s,gutter:a,children:i,toasterId:o,containerStyle:n,containerClassName:l})=>{let{toasts:d,handlers:c}=M(s,o);return r.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(s=>{let o=s.position||t,n=el(o,c.calculateOffset(s,{reverseOrder:e,gutter:a,defaultPosition:t}));return r.createElement(en,{id:s.id,key:s.id,onHeightUpdate:c.updateHeight,className:s.visible?ed:"",style:n},"custom"===s.type?w(s.message,s):i?i(s):r.createElement(eo,{toast:s,position:o}))}))},ep=T}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[276,471,705,560],()=>s(5752));module.exports=a})();