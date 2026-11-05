(()=>{function e(e){return e&&e.__esModule?e.default:e}let t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;class o{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(i&&void 0===e){let i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}}let a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t,i="";for(let t of e.cssRules)i+=t.cssText;return new o("string"==typeof(t=i)?t:t+"",void 0,s)})(e):e,{is:n,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:c,getPrototypeOf:u}=Object,p=globalThis,m=p.trustedTypes,_=m?m.emptyScript:"",f=p.reactiveElementPolyfillSupport,g={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!n(e,t),$={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;class b extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&l(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){let o=s?.call(this);r?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$}static _$Ei(){if(this.hasOwnProperty("elementProperties"))return;let e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty("finalized"))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty("properties")){let e=this.properties;for(let t of[...d(e),...c(e)])this.createProperty(t,e[t])}let e=this[Symbol.metadata];if(null!==e){let t=litPropertyMetadata.get(e);if(void 0!==t)for(let[e,i]of t)this.elementProperties.set(e,i)}for(let[e,t]of(this._$Eh=new Map,this.elementProperties)){let i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e))for(let i of new Set(e.flat(1/0).reverse()))t.unshift(a(i));else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){let i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map;for(let t of this.constructor.elementProperties.keys())this.hasOwnProperty(t)&&(e.set(t,this[t]),delete this[t]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let i of s){let s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){let r=(void 0!==i.converter?.toAttribute?i.converter:g).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){let i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){let e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:g;this._$Em=s;let o=r.fromAttribute(t,e.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){let o=this.constructor;if(!1===s&&(r=this[e]),!(((i??=o.getPropertyOptions(e)).hasChanged??y)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,i]of e){let{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1,t=this._$AL;try{(e=this.shouldUpdate(t))?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}}b.elementStyles=[],b.shadowRootOptions={mode:"open"},b.elementProperties=new Map,b.finalized=new Map,f?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push("2.1.2");let x=globalThis,v=e=>e,w=x.trustedTypes,A=w?w.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+k,M=`<${E}>`,C=document,O=()=>C.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,N="[ 	\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/--\x3e/g,U=/>/g,H=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,L=/"/g,j=/^(?:script|style|textarea|title)$/i,D=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),B=D(1),I=D(2),q=(D(3),Symbol.for("lit-noChange")),K=Symbol.for("lit-nothing"),W=new WeakMap,V=C.createTreeWalker(C,129);function J(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}class Z{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0,a=e.length-1,n=this.parts,[l,h]=((e,t)=>{let i=e.length-1,s=[],r,o=2===t?"<svg>":3===t?"<math>":"",a=R;for(let t=0;t<i;t++){let i=e[t],n,l,h=-1,d=0;for(;d<i.length&&(a.lastIndex=d,null!==(l=a.exec(i)));)d=a.lastIndex,a===R?"!--"===l[1]?a=z:void 0!==l[1]?a=U:void 0!==l[2]?(j.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=H):void 0!==l[3]&&(a=H):a===H?">"===l[0]?(a=r??R,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?H:'"'===l[3]?L:F):a===L||a===F?a=H:a===z||a===U?a=R:(a=H,r=void 0);let c=a===H&&e[t+1].startsWith("/>")?" ":"";o+=a===R?i+M:h>=0?(s.push(n),i.slice(0,h)+S+i.slice(h)+k+c):i+k+(-2===h?t:c)}return[J(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=Z.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=V.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(let e of s.getAttributeNames())if(e.endsWith(S)){let t=h[o++],i=s.getAttribute(e).split(k),a=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?ee:"?"===a[1]?et:"@"===a[1]?ei:Y}),s.removeAttribute(e)}else e.startsWith(k)&&(n.push({type:6,index:r}),s.removeAttribute(e));if(j.test(s.tagName)){let e=s.textContent.split(k),t=e.length-1;if(t>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],O()),V.nextNode(),n.push({type:2,index:++r});s.append(e[t],O())}}}else if(8===s.nodeType)if(s.data===E)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(k,e+1));)n.push({type:7,index:r}),e+=k.length-1}r++}}static createElement(e,t){let i=C.createElement("template");return i.innerHTML=e,i}}function G(e,t,i=e,s){if(t===q)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl,o=P(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e))._$AT(e,i,s),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=G(e,r._$AS(e,t.values),r,s)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??C).importNode(t,!0);V.currentNode=s;let r=V.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let t;2===n.type?t=new X(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new es(r,this,e)),this._$AV.push(t),n=i[++a]}o!==n?.index&&(r=V.nextNode(),o++)}return V.currentNode=C,s}p(e){let t=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){let i;P(e=G(this,e,t))?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):T(i=e)||"function"==typeof i?.[Symbol.iterator]?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{let e=new Q(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new Z(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new X(this.O(O()),this.O(O()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=v(e).nextSibling;v(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,s){let r=this.strings,o=!1;if(void 0===r)(o=!P(e=G(this,e,t,0))||e!==this._$AH&&e!==q)&&(this._$AH=e);else{let s,a,n=e;for(e=r[0],s=0;s<r.length-1;s++)(a=G(this,n[i+s],t,s))===q&&(a=this._$AH[s]),o||=!P(a)||a!==this._$AH[s],a===K?e=K:e!==K&&(e+=(a??"")+r[s+1]),this._$AH[s]=a}o&&!s&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Y{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class et extends Y{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class ei extends Y{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=G(this,e,t,0)??K)===q)return;let i=this._$AH,s=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class es{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){G(this,e)}}let er=x.litHtmlPolyfillSupport;er?.(Z,X),(x.litHtmlVersions??=[]).push("3.3.3");let eo=globalThis;class ea extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{let s=i?.renderBefore??t,r=s._$litPart$;if(void 0===r){let e=i?.renderBefore??null;s._$litPart$=r=new X(t.insertBefore(O(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ea._$litElement$=!0,ea.finalized=!0,eo.litElementHydrateSupport?.({LitElement:ea});let en=eo.litElementPolyfillSupport;en?.({LitElement:ea}),(eo.litElementVersions??=[]).push("4.2.2");let el=8.3144/18.02,eh=[-4909965e-10,.08183197,-5552967e-10,-2.228376*1e-5,-6211808e-13,-191275e-9,.07258,-2.939*1e-4,9.841*1e-7,-192e-11];function ed(e){return e<.01?611*Math.exp(eh[0]+eh[1]*e+eh[2]*e**2+eh[3]*e**3+eh[4]*e**4):611*Math.exp(eh[5]+eh[6]*e+eh[7]*e**2+eh[8]*e**3+eh[9]*e**4)}function ec(e){return e<.01?Math.log(611)+(eh[0]+eh[1]*e+eh[2]*e**2+eh[3]*e**3+eh[4]*e**4):Math.log(611)+(eh[5]+eh[6]*e+eh[7]*e**2+eh[8]*e**3+eh[9]*e**4)}function eu(e){if(!(e<Math.exp(14.2)))return console.log("too high preassure!"),null;{let t=Math.log(e),i=0,s=ec(0)-t,r=0;for(;Math.abs(s)>.001;)if(i-=2*s*1e-4/(ec(i+1e-4)-ec(i-1e-4)),s=ec(i)-t,++r>100)return console.log("too many iterations!"),null;return i}}function ep(e,t){return 2501*e+1.01*t}function em(e,t){return(e-1.01*t)/2501}function e_(e,t){return(e-2501*t)/1.01}let ef={orange:{dt:1,dphi:5,dx:1,color:"#E67E22",label:null},red:{dt:2.5,dphi:10,dx:2.5,color:"#C0392B",label:null}},eg=(e,t)=>Number.isFinite(Number(e))&&null!==e&&""!==e?Number(e):t;function ey(e){if(!e)return null;let t=!0===e?{}:e,i={};for(let e of["orange","red"]){let s=ef[e],r=t[e]||{};i[e]={dt:Math.abs(eg(r.temperature,s.dt)),dphi:Math.abs(eg(r.humidity,s.dphi)),dx:Math.abs(eg(r.absolute_humidity,s.dx)),color:"string"==typeof r.color&&r.color?r.color:s.color,label:"string"==typeof r.label&&r.label?r.label:null}}return i.red.dt=Math.max(i.red.dt,i.orange.dt),i.red.dphi=Math.max(i.red.dphi,i.orange.dphi),i.red.dx=Math.max(i.red.dx,i.orange.dx),i}let e$=["f","wf","w","wt","t","ct","c","kf"],eb=["l","d","s"],ex={"0,0":"ok","1,0":"w","1,1":"wf","0,1":"f","-1,1":"kf","-1,0":"c","-1,-1":"ct","0,-1":"t","1,-1":"wt"};function ev(e,t,i){return e<=0?0:e<=t?1:e<=i?2:3}let ew="#22C55E",eA={w:{l:"#e49e93",d:"#cf6e60",s:"#b04336"},wf:{l:"#dc9dbb",d:"#c66d9a",s:"#a64278"},f:{l:"#baa7e2",d:"#9a7ccf",s:"#7954b3"},kf:{l:"#9eb0ea",d:"#7289da",s:"#4e63bf"},c:{l:"#82b9e5",d:"#3d96d4",s:"#0072af"},ct:{l:"#afb982",d:"#8b955f",s:"#69713d"},t:{l:"#d6a977",d:"#bf7f29",s:"#965d00"},wt:{l:"#e0a383",d:"#cb7545",s:"#ab4b00"}},eS={l:"#b2b2b2",d:"#8e8e8e",s:"#6c6c6c"},ek=[0,45,90,135,180,225,270,315],eE=+Math.PI,eM=40*Math.PI/180,eC=1.04*Math.sqrt(2*eE/eM),eO=.58*12,eP=e=>e*Math.PI/180,eT=e=>e.toFixed(2),eN=[{anchor:"start",v:"middle"},{anchor:"start",v:"top"},{anchor:"middle",v:"top"},{anchor:"end",v:"top"},{anchor:"end",v:"middle"},{anchor:"end",v:"bottom"},{anchor:"middle",v:"bottom"},{anchor:"start",v:"bottom"}];function eR(e){let t=e.currentTarget.closest(".compass-body")?.querySelector(".tip");t&&(t.style.display="none")}let ez=e=>"l"===e?"#1f2733":"#ffffff";var eU={};eU=JSON.parse('{"card":{"no_statistics":"No daily statistics available. Check that both sensors have state_class: measurement.","fetch_failed":"Could not load the history: {error}","no_data":"No days with data in this period yet.","period":"{count} days"},"compass":{"title":"Comfort compass","day":"day","days":"days","names":{"ok":"in range","w":"too warm","wf":"warm + humid","f":"too humid","kf":"cold + humid","c":"too cold","ct":"cold + dry","t":"too dry","wt":"warm + dry"},"labels":{"f":"too humid","wf":"warm +\\nhumid","w":"too warm","wt":"warm +\\ndry","t":"too dry","ct":"cold +\\ndry","c":"too cold","kf":"cold +\\nhumid"},"stages":{"l":"mild","d":"moderate","s":"severe"}},"editor":{"fields":{"header":"Title","temperature_entity":"Temperature sensor","humidity_entity":"Humidity sensor","days":"Days of history","air_mode":"Air pressure from","pressure":"Air pressure","altitude":"Altitude","comfort_t_min":"Temperature min","comfort_t_max":"Temperature max","comfort_phi_min":"Humidity min","comfort_phi_max":"Humidity max","comfort_x_min":"Absolute humidity min","comfort_x_max":"Absolute humidity max","orange_dt":"Mild up to ± temperature","orange_dphi":"Mild up to ± humidity","orange_dx":"Mild up to ± abs. humidity","red_dt":"Moderate up to ± temperature","red_dphi":"Moderate up to ± humidity","red_dx":"Moderate up to ± abs. humidity","show_legend":"Show legend","show_labels":"Show direction labels","fixed_scale":"Fixed scale (compare rooms)"},"options":{"pressure":"Pressure (Pa)","altitude":"Altitude (m)"},"sections":{"comfort":"Comfort zone","bands":"Severity (warning bands)","display":"Display"}}}');var eH={};eH=JSON.parse('{"card":{"no_statistics":"Keine Tagesstatistiken vorhanden. Prüfe, ob beide Sensoren state_class: measurement haben.","fetch_failed":"Verlauf konnte nicht geladen werden: {error}","no_data":"In diesem Zeitraum gibt es noch keine Tage mit Daten.","period":"{count} Tage"},"compass":{"title":"Komfort-Kompass","day":"Tag","days":"Tage","names":{"ok":"im Zielband","w":"zu warm","wf":"warm + feucht","f":"zu feucht","kf":"kalt + feucht","c":"zu kalt","ct":"kalt + trocken","t":"zu trocken","wt":"warm + trocken"},"labels":{"f":"zu feucht","wf":"warm +\\nfeucht","w":"zu warm","wt":"warm +\\ntrocken","t":"zu trocken","ct":"kalt +\\ntrocken","c":"zu kalt","kf":"kalt +\\nfeucht"},"stages":{"l":"leicht","d":"mittel","s":"stark"}},"editor":{"fields":{"header":"Titel","temperature_entity":"Temperatursensor","humidity_entity":"Feuchtesensor","days":"Tage Verlauf","air_mode":"Luftdruck aus","pressure":"Luftdruck","altitude":"Höhe","comfort_t_min":"Temperatur min","comfort_t_max":"Temperatur max","comfort_phi_min":"Feuchte min","comfort_phi_max":"Feuchte max","comfort_x_min":"Absolute Feuchte min","comfort_x_max":"Absolute Feuchte max","orange_dt":"Leicht bis ± Temperatur","orange_dphi":"Leicht bis ± Feuchte","orange_dx":"Leicht bis ± abs. Feuchte","red_dt":"Mittel bis ± Temperatur","red_dphi":"Mittel bis ± Feuchte","red_dx":"Mittel bis ± abs. Feuchte","show_legend":"Legende anzeigen","show_labels":"Richtungen beschriften","fixed_scale":"Feste Skala (Räume vergleichen)"},"options":{"pressure":"Druck (Pa)","altitude":"Höhe (m)"},"sections":{"comfort":"Komfortzone","bands":"Abstufung (Warnbänder)","display":"Darstellung"}}}');let eF={en:e(eU),de:e(eH)},eL=(e,t)=>t.split(".").reduce((e,t)=>null==e?void 0:e[t],e);function ej(t,i,s){let r=eL(eF[function(e){let t=String(e?.locale?.language||e?.language||"en").toLowerCase();if(eF[t])return t;let i=t.split(/[-_]/)[0];return eF[i]?i:"en"}(t)],i);return("string"!=typeof r&&(r=eL(e(eU),i)),"string"!=typeof r)?i:(s&&(r=r.replace(/\{(\w+)\}/g,(e,t)=>null!=s[t]?String(s[t]):e)),r)}var eD=((e,...t)=>new o(1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]),e,s))`
    :host {
        display: block;
        --ccc-max: 340px;
        --ccc-gap-color: var(--ha-card-background, var(--card-background-color, #fff));
    }
    ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .card-content {
        container-type: inline-size;
        padding: 8px 16px 16px;
    }
    :host([fixed-height]),
    :host([fixed-height]) ha-card {
        height: 100%;
    }
    :host([fixed-height]) .card-content {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
    .message {
        margin: 8px 0;
        color: var(--secondary-text-color);
    }
    .message.error {
        color: var(--error-color, #db4437);
    }

    /* Glyph and legend */
    .compass-body {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        justify-items: center;
        align-items: center;
        gap: 8px 20px;
    }
    /* Wide enough: glyph and legend side by side, kept together and centred. */
    @container (min-width: 480px) {
        .compass-body.with-legend {
            grid-template-columns: minmax(0, var(--ccc-max)) minmax(0, 260px);
            justify-content: center;
        }
    }
    .glyph-box {
        width: 100%;
        max-width: var(--ccc-max);
    }
    .glyph {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
    }
    :host([fixed-height]) .compass-body {
        flex: 1 1 auto;
        min-height: 0;
        grid-template-rows: minmax(0, 1fr);
    }
    :host([fixed-height]) .compass-body.with-legend {
        grid-template-rows: minmax(0, 1fr) auto;
    }
    :host([fixed-height]) .glyph-box {
        height: 100%;
        max-width: 380px;
        max-height: 380px;
    }
    :host([fixed-height]) .glyph {
        height: 100%;
    }
    @container (min-width: 480px) {
        :host([fixed-height]) .compass-body.with-legend {
            grid-template-rows: minmax(0, 1fr);
        }
    }

    .glyph .ref {
        fill: none;
        stroke: var(--divider-color, #b9c0ca);
        stroke-width: 1;
        stroke-dasharray: 3 3;
    }
    .glyph .seg {
        stroke: var(--ccc-gap-color);
        stroke-width: 1.5;
        cursor: pointer;
        transition: opacity 0.12s;
    }
    .glyph .seg.ok {
        stroke-width: 2;
    }
    .glyph:hover .seg:not(:hover) {
        opacity: 0.55;
    }
    .glyph .ok-pct {
        fill: #ffffff;
        font-weight: 600;
        pointer-events: none;
    }
    .glyph text {
        font-family: inherit;
    }

    .legend {
        width: 100%;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        line-height: 1.35;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color);
    }
    .legend .row {
        display: grid;
        grid-template-columns: 9px minmax(0, 1fr) auto 3.2em;
        column-gap: 8px;
        align-items: center;
    }
    .legend .count {
        font-weight: 600;
        text-align: right;
        white-space: nowrap;
    }
    .legend .unit {
        font-weight: 400;
        color: var(--secondary-text-color);
    }
    .legend .share {
        color: var(--secondary-text-color);
        text-align: right;
    }
    .dot {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
    }
    .stage-key {
        display: flex;
        flex-wrap: wrap;
        gap: 2px 10px;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
        font-size: 11px;
    }
    .stage-key > span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .tip {
        position: absolute;
        pointer-events: none;
        display: none;
        padding: 5px 9px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.4;
        white-space: nowrap;
        z-index: 10;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        transform: translate(-50%, calc(-100% - 6px));
    }
    .tip .tip-head {
        font-weight: 600;
    }
    @media (prefers-reduced-motion: reduce) {
        .glyph .seg {
            transition: none;
        }
    }
`;let eB={temperature:[20,26],humidity:[30,60],absolute_humidity:[0,12]},eI=e=>Array.isArray(e)&&2===e.length&&e.every(e=>Number.isFinite(Number(e))),eq=["type","temperature_entity","humidity_entity","header","days","altitude","pressure","comfort_zone","warning_bands","show_labels","show_legend","scale"],eK=(e,t,i,s)=>({number:{step:e,mode:"box",unit_of_measurement:t,min:i,max:s}});customElements.define("comfort-compass-card",class extends ea{static styles=eD;static get properties(){return{layout:{type:String,reflect:!0},_fixedHeight:{type:Boolean,reflect:!0,attribute:"fixed-height"},_config:{state:!0},_days:{state:!0},_error:{state:!0},_compact:{state:!0}}}constructor(){super(),this._hass=void 0,this._fetchKey=null,this._days=[],this._compact=!1,this._resizeObserver=void 0}connectedCallback(){super.connectedCallback(),clearInterval(this._refreshTimer),this._refreshTimer=setInterval(()=>this._maybeFetch(!0),36e5),this._wasConnected&&this._maybeFetch(!0),this._wasConnected=!0,!this._resizeObserver&&"u">typeof ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>this._measure())),this.updateComplete.then(()=>{let e=this.renderRoot?.querySelector(".card-content");e&&this._resizeObserver&&this._resizeObserver.observe(e)})}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._refreshTimer),this._refreshTimer=void 0,this._resizeObserver?.disconnect()}_measure(){let e=this.renderRoot?.querySelector(".card-content");if(!e)return;let t=e.getBoundingClientRect();if(!t.width)return;let i=getComputedStyle(e),s=parseFloat(i.paddingLeft)+parseFloat(i.paddingRight),r=parseFloat(i.paddingTop)+parseFloat(i.paddingBottom),o=this.renderRoot.querySelector(".legend"),a=this.renderRoot.querySelector(".glyph-box"),n=o&&a&&o.getBoundingClientRect().top>=a.getBoundingClientRect().bottom-1,l=n?o.getBoundingClientRect().height+8:0,h=o&&!n?o.getBoundingClientRect().width+20:0,d=t.width-s-h,c=t.height-r-l,u=(this._fixedHeight?Math.min(d,c):d)<200;u!==this._compact&&(this._compact=u)}setConfig(e){if(!e.temperature_entity)throw Error("temperature_entity is required");if(!e.humidity_entity)throw Error("humidity_entity is required");this._config=e,this._period=Math.max(1,Math.round(Number(e.days)||30)),this._pressure=Number.isFinite(Number(e.altitude))&&null!==e.altitude&&""!==e.altitude?101325*Math.pow(1-225577e-10*Number(e.altitude),5.25588):Number(e.pressure)||101325,this._comfort=function(e){let t={...eB,...e&&"object"==typeof e?e:{}},i=eI(t.temperature)?t.temperature:eB.temperature,s=eI(t.humidity)?t.humidity:eB.humidity,r=eI(t.absolute_humidity)?t.absolute_humidity:eB.absolute_humidity,o=e=>e.map(Number).sort((e,t)=>e-t),[a,n]=o(i),[l,h]=o(s),[d,c]=o(r);return{range_t:[a,n],range_phi:[l/100,h/100],range_x:[d/1e3,c/1e3]}}(e.comfort_zone),this._bands=ey(e.warning_bands||!0),this._mollier=function(e){if("classical"!==(e=e||"classical")&&"glueck"!==e)throw Error("Unknown Mollier convention: "+e);let t="classical"===e?function(e,t){return 1.01*t/(1.01+1.86*e)}:function(e,t){return(1.01*t*(1+e)+2501*e*e)/(1.01+1.86*e)},i="classical"===e?function(e,t){return e*(1.01+1.86*t)/1.01}:function(e,t){return(e*(1.01+1.86*t)-2501*t*t)/(1.01*(1+t))};function s(e,t,s){return i(eu(t*s/(e*(.6222+t))),t)}function r(e,i,s){let r=function(e){return e/(.6222+e)*s/ed(t(e,i))},o=0,a=r(0)-e,n=0;for(;Math.abs(a)>1e-5;)if(o-=2*a*1e-6/(r(o+1e-6)-r(o-1e-6)),a=r(o)-e,++n>100)return console.log("too many iterations!"),null;return o}return{convention:e,temperature:function(e,i){return t(e,i)},rel_humidity:function(e,i,s){return e/(.6222+e)*s/ed(t(e,i))},density:function(e,i,s){return s/(el*(273.15+t(e,i)))*(1+e)/(.6222+e)/1e3},get_x_y:function(e,t,s){let r={};return r.x=.6222*t/(s/ed(e)-t),r.y=i(e,r.x),r},get_x_y_tx:function(e,t,s){return{x:t,y:i(e,t)}},get_x_y_phix:function(e,t,i){return{x:t,y:s(e,t,i)}},get_x_y_phiy:function(e,t,i){return{x:r(e,t,i),y:t}},y_phix:s,x_phiy:r,y_rhox:function(e,t,s){return i(s/(el*e)*(1+t)/(.6222+t)*.001-273.15,t)},enthalpy:ep,x_hy:em,y_hx:e_,p_sat:ed,log_p_sat:ec,temperature_p_sat:eu}}("classical"),this._updateSizingMode(),this._hass&&this._maybeFetch()}set hass(e){let t=!this._hass,i=this._hass?.locale?.language!==e?.locale?.language,s=this._hass?.themes?.darkMode!==e?.themes?.darkMode;this._hass=e,t&&this._config&&this._maybeFetch(),(i||s)&&this.requestUpdate()}get hass(){return this._hass}_updateSizingMode(){let e=this._config?.grid_options?.rows;this._fixedHeight="panel"===this.layout||"grid"===this.layout&&"number"==typeof e}willUpdate(e){e.has("layout")&&this._updateSizingMode()}_t(e,t){return ej(this._hass,e,t)}async _maybeFetch(e=!1){let t=this._config;if(!this._hass||!t)return;let i=`${t.temperature_entity}|${t.humidity_entity}|${this._period}`;if(i!==this._fetchKey||e){this._fetchKey=i;try{let e=await async function(e,t,i,s){let r=new Date;r.setHours(0,0,0,0);let o=new Date(r);o.setDate(o.getDate()-s);let a=await e.callWS({type:"recorder/statistics_during_period",start_time:o.toISOString(),end_time:r.toISOString(),statistic_ids:[t,i],period:"day",types:["mean"],units:{temperature:"°C"}}),n=a?.[t]||[],l=a?.[i]||[],h=e=>"number"==typeof e?e:Date.parse(e),d=new Map;for(let e of n)d.set(h(e.start),{date:new Date(h(e.start)),t:e.mean});for(let e of l){let t=d.get(h(e.start));t&&(t.rh=e.mean)}return[...d.values()].filter(e=>Number.isFinite(e.t)&&Number.isFinite(e.rh)).map(e=>({date:e.date,t:e.t,phi:e.rh>1?e.rh/100:e.rh})).sort((e,t)=>e.date-t.date)}(this._hass,t.temperature_entity,t.humidity_entity,this._period);if(this._fetchKey!==i)return;this._days=e,this._error=e.length?void 0:{key:"card.no_statistics"}}catch(e){if(this._fetchKey!==i)return;this._error={key:"card.fetch_failed",vars:{error:e&&e.message||e}},this._fetchKey=null}}}render(){let e;if(!this._config)return K;let t=this._config;if(this._error){let t="card.no_statistics"===this._error.key;e=B`<p class="message ${t?"":"error"}">${this._t(this._error.key,this._error.vars)}</p>`}else e=this._days.length?function(e,t,i={}){let s=!1!==i.showLabels,r=i.dark?"l":"s",o=t=>Number(e[t]||0),a=Object.values(e).reduce((e,t)=>e+Number(t||0),0),n=e=>a?o(e)/a:0,l=e=>1===Math.round(e)?t("compass.day"):t("compass.days"),h=e=>t(`compass.names.${e}`),d=e=>t(`compass.stages.${e}`),c=e=>a?(e/a*100).toFixed(0):"0",u=e=>`${Math.round(e)} ${l(e)} \xb7 ${c(e)}%`,p=e=>eb.reduce((t,i)=>t+o(`${e}_${i}`),0),m=n("ok"),_=+Math.sqrt(Math.max(m,0)),f=[],g=[],y=Math.max(_,1);e$.forEach((e,t)=>{let i=0,s=_;for(let r of eb){let a=o(`${e}_${r}`),l=Math.sqrt(_*_+2*eE*(i+=n(`${e}_${r}`))/eM);if(l>s+1e-9){let i=p(e);f.push({r1:s,r2:l,deg:ek[t],color:eA[e][r],tip:{bg:eA[e][r],fg:ez(r),lines:[`${h(e)} \xb7 ${d(r)}`,u(a),`${h(e)}: ${u(i)}`,eb.map(t=>`${d(t)} ${c(o(`${e}_${t}`))}%`).join(" / ")]}})}s=l}y=Math.max(y,s),g.push(Math.max(s,1))});let $=90/(i.fixedScale?eC:y),b=(e,t)=>[e*$*Math.cos(eP(t)),-e*$*Math.sin(eP(t))],x={x0:-y*$,x1:y*$,y0:-y*$,y1:y*$};i.fixedScale&&Object.assign(x,{x0:-eC*$,x1:eC*$,y0:-eC*$,y1:eC*$});let v=s?ek.map((e,i)=>{let[s,o]=b(g[i],e),[a,n]=[Math.cos(eP(e)),-Math.sin(eP(e))],l=s+7*a,h=o+7*n,d=t(`compass.labels.${e$[i]}`).split("\n"),c=eN[i],u=Math.max(...d.map(e=>e.length))*eO,p=13*d.length,m="top"===c.v?h-p:"bottom"===c.v?h:h-p/2,_="start"===c.anchor?l:"end"===c.anchor?l-u:l-u/2;return x.x0=Math.min(x.x0,_),x.x1=Math.max(x.x1,_+u),x.y0=Math.min(x.y0,m),x.y1=Math.max(x.y1,m+p),I`<text x=${eT(l)} y=${eT(m+12-1.5)} text-anchor=${c.anchor} fill=${eA[e$[i]][r]} font-size=${12} font-weight="500">
            ${d.map((e,t)=>I`<tspan x=${eT(l)} dy=${13*(0!==t)}>${e}</tspan>`)}</text>`}):[],w=[x.x0-4,x.y0-4,x.x1-x.x0+8,x.y1-x.y0+8].map(eT).join(" "),A=[{k:"ok",cnt:o("ok"),color:ew}],S=[];for(let e of e$){let t=p(e);t>0&&S.push({k:e,cnt:t,color:eA[e].d})}S.sort((e,t)=>t.cnt-e.cnt),A.push(...S);let k=(100*m).toFixed(0),E=Math.max(12,Math.min(22,_*$*.45)),M={bg:ew,fg:"#ffffff",lines:[h("ok"),u(o("ok"))]},C=e=>t=>(function(e,t){let i=e.currentTarget,s=i.closest(".compass-body"),r=s&&s.querySelector(".tip");if(!r)return;let o=s.getBoundingClientRect(),a=i.getBoundingClientRect();r.replaceChildren(),t.lines.forEach((e,t)=>{let i=document.createElement("div");i.textContent=e,0===t&&(i.className="tip-head"),r.appendChild(i)}),r.style.background=t.bg,r.style.color=t.fg,r.style.left=`${a.left+a.width/2-o.left}px`,r.style.top=`${a.top-o.top}px`,r.style.display="block"})(t,e),O=i.showLegend?B`
        <div class="legend">
            ${A.map(e=>B`
                <div class="row"><span class="dot" style="background:${e.color}"></span>
                    <span class="name">${h(e.k)}</span>
                    <span class="count">${Math.round(e.cnt)} <span class="unit">${l(e.cnt)}</span></span>
                    <span class="share">${c(e.cnt)}%</span></div>`)}
            ${S.length?B`
                <div class="stage-key">
                    ${eb.map(e=>B`<span><span class="dot" style="background:${eS[e]}"></span>${d(e)}</span>`)}
                </div>`:K}
        </div>`:K;return B`
        <div class="compass-body ${i.showLegend?"with-legend":""}">
            <div class="glyph-box">
                <svg class="glyph" viewBox=${w} role="img" aria-label=${t("compass.title")}>
                    <circle class="ref" r=${eT(+$)}></circle>
                    ${_>0?I`<circle class="seg ok" r=${eT(_*$)} fill=${ew}
                        @mouseenter=${C(M)} @click=${C(M)} @mouseleave=${eR}></circle>`:K}
                    ${f.map(e=>I`<path class="seg" d=${((e,t,i)=>{let s=i-20,r=i+20,[o,a]=b(t,s),[n,l]=b(t,r),h=t*$,d=`M${eT(o)},${eT(a)}A${eT(h)},${eT(h)} 0 0 0 ${eT(n)},${eT(l)}`;if(e<1e-9)return`${d}L0,0Z`;let[c,u]=b(e,r),[p,m]=b(e,s),_=e*$;return`${d}L${eT(c)},${eT(u)}A${eT(_)},${eT(_)} 0 0 1 ${eT(p)},${eT(m)}Z`})(e.r1,e.r2,e.deg)} fill=${e.color}
                        @mouseenter=${C(e.tip)} @click=${C(e.tip)} @mouseleave=${eR}></path>`)}
                    ${100*m>=15?I`<text class="ok-pct" y=${eT(.36*E)} text-anchor="middle" font-size=${eT(E)}>${k}%</text>`:K}
                    ${v}
                </svg>
            </div>
            ${O}
            <div class="tip" role="tooltip"></div>
        </div>
    `}(function(e,t,i,s,r){let o=i||ey(!0),a={ok:0};for(let e of e$)for(let t of eb)a[`${e}_${t}`]=0;let[n,l]=t.range_t,h=100*t.range_phi[0],d=100*t.range_phi[1],[c,u]=t.range_x,p=[o.orange.dt,o.red.dt],m=[o.orange.dphi,o.red.dphi],_=[o.orange.dx/1e3,o.red.dx/1e3];for(let t of e){let e=t.t,i=100*t.phi;if(!Number.isFinite(e)||!Number.isFinite(i))continue;let o=e<n?-1:+(e>l),f=ev(1===o?e-l:-1===o?n-e:0,p[0],p[1]),g=r.get_x_y(e,t.phi,s).x,y=i>d||g>u?1:i<h||g<c?-1:0,$=1===y?i-d:-1===y?h-i:0,b=1===y?g-u:-1===y?c-g:0,x=Math.max(f,Math.max(ev($,m[0],m[1]),ev(b,_[0],_[1]))),v=x<=1?"l":x<=2?"d":"s",w=ex[`${o},${y}`];a["ok"===w?"ok":`${w}_${v}`]+=1}return a}(this._days,this._comfort,this._bands,this._pressure,this._mollier),(e,t)=>this._t(e,t),{fixedScale:"fixed"===t.scale,showLegend:!0===t.show_legend,showLabels:!1!==t.show_labels&&!this._compact,dark:!!this._hass?.themes?.darkMode}):this._fetchKey?B`<p class="message">${this._t("card.no_data")}</p>`:K;return B`
            <ha-card .header=${t.header||void 0}>
                <div class="card-content">${e}</div>
            </ha-card>
        `}static getConfigElement(){return document.createElement("comfort-compass-card-editor")}static getStubConfig(e){let t=Object.values(e?.states||{}),i=e=>t.find(t=>t.attributes?.device_class===e&&t.attributes?.state_class==="measurement")?.entity_id;return{temperature_entity:i("temperature")||"sensor.living_room_temperature",humidity_entity:i("humidity")||"sensor.living_room_humidity",days:30}}getCardSize(){return 5}getGridOptions(){return{columns:6,min_columns:3,min_rows:3}}}),customElements.define("comfort-compass-card-editor",class extends ea{static get properties(){return{hass:{attribute:!1},_config:{state:!0}}}setConfig(e){this._config=e}render(){let e,t;if(!this._config)return B``;let i=e=>ej(this.hass,e),s=function(e={}){let t={...eB,...e.comfort_zone||{}},i="object"==typeof e.warning_bands&&e.warning_bands?e.warning_bands:{},s=(e,t,s)=>i[e]?.[t]??ef[e][s];return{header:e.header??"",temperature_entity:e.temperature_entity??"",humidity_entity:e.humidity_entity??"",days:e.days??30,air_mode:void 0!==e.altitude&&null!==e.altitude?"altitude":"pressure",altitude:e.altitude??450,pressure:e.pressure??101325,comfort_t_min:t.temperature[0],comfort_t_max:t.temperature[1],comfort_phi_min:t.humidity[0],comfort_phi_max:t.humidity[1],comfort_x_min:t.absolute_humidity[0],comfort_x_max:t.absolute_humidity[1],orange_dt:s("orange","temperature","dt"),orange_dphi:s("orange","humidity","dphi"),orange_dx:s("orange","absolute_humidity","dx"),red_dt:s("red","temperature","dt"),red_dphi:s("red","humidity","dphi"),red_dx:s("red","absolute_humidity","dx"),show_labels:!1!==e.show_labels,show_legend:!0===e.show_legend,fixed_scale:"fixed"===e.scale}}(this._config);return B`
            <ha-form
                .hass=${this.hass}
                .data=${s}
                .schema=${e=(e,t,i)=>({type:"grid",schema:[{name:e,selector:i},{name:t,selector:i}]}),t=e=>({type:"grid",schema:[{name:`${e}_dt`,selector:eK(.5,"K",0)},{name:`${e}_dphi`,selector:eK(1,"%",0,100)},{name:`${e}_dx`,selector:eK(.5,"g/kg",0)}]}),[{name:"header",selector:{text:{}}},{type:"grid",schema:[{name:"temperature_entity",required:!0,selector:{statistic:{device_class:"temperature"}}},{name:"humidity_entity",required:!0,selector:{statistic:{device_class:"humidity"}}}]},{type:"grid",schema:[{name:"days",selector:eK(1,void 0,1,365)},{name:"air_mode",selector:{select:{mode:"dropdown",options:[{value:"altitude",label:i("editor.options.altitude")},{value:"pressure",label:i("editor.options.pressure")}]}}},"pressure"===s.air_mode?{name:"pressure",selector:eK(1,"Pa",5e4,11e4)}:{name:"altitude",selector:eK(10,"m",0,5e3)}]},{type:"expandable",title:i("editor.sections.display"),schema:[{type:"grid",schema:[{name:"show_labels",selector:{boolean:{}}},{name:"show_legend",selector:{boolean:{}}},{name:"fixed_scale",selector:{boolean:{}}}]}]},{type:"expandable",title:i("editor.sections.comfort"),schema:[e("comfort_t_min","comfort_t_max",eK(.5,"°C")),e("comfort_phi_min","comfort_phi_max",eK(1,"%",0,100)),e("comfort_x_min","comfort_x_max",eK(.5,"g/kg",0))]},{type:"expandable",title:i("editor.sections.bands"),schema:[t("orange"),t("red")]}]}
                .computeLabel=${e=>i(`editor.fields.${e.name}`)}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `}_valueChanged(e){let t=function(e,t={}){let i={...t};for(let e of eq)delete i[e];Object.assign(i,{type:"custom:comfort-compass-card",temperature_entity:e.temperature_entity,humidity_entity:e.humidity_entity}),e.header&&(i.header=e.header),30!==e.days&&(i.days=e.days),"altitude"===e.air_mode?i.altitude=e.altitude:(void 0!==t.pressure||101325!==e.pressure)&&(i.pressure=e.pressure);let s={temperature:[e.comfort_t_min,e.comfort_t_max],humidity:[e.comfort_phi_min,e.comfort_phi_max],absolute_humidity:[e.comfort_x_min,e.comfort_x_max]};JSON.stringify(s)!==JSON.stringify(eB)&&(i.comfort_zone=s);let r="object"==typeof t.warning_bands&&t.warning_bands?t.warning_bands:{},o={};for(let t of["orange","red"]){let i={...r[t]||{}},s={temperature:e[`${t}_dt`],humidity:e[`${t}_dphi`],absolute_humidity:e[`${t}_dx`]},a={temperature:ef[t].dt,humidity:ef[t].dphi,absolute_humidity:ef[t].dx};for(let e of Object.keys(s))s[e]!==a[e]?i[e]=s[e]:delete i[e];Object.keys(i).length&&(o[t]=i)}return Object.keys(o).length&&(i.warning_bands=o),e.show_labels||(i.show_labels=!1),e.show_legend&&(i.show_legend=!0),e.fixed_scale&&(i.scale="fixed"),i}(e.detail.value,this._config);this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}}),window.customCards=window.customCards||[],window.customCards.push({type:"comfort-compass-card",name:"Comfort compass card",description:"Shows how the days split into in range, too warm, too humid, too dry or too cold, from a temperature and a humidity sensor.",preview:!0,documentationURL:"https://github.com/retomarek/comfort-compass-card"}),console.info("%c COMFORT-COMPASS-CARD %c v1.0.0-beta.1 ","color: white; background: #22a35a; font-weight: 700;","color: #22a35a; background: white; font-weight: 700;")})();