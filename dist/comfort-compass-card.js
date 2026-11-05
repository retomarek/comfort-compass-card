(()=>{function t(t){return t&&t.__esModule?t.default:t}let e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;class o{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(i&&void 0===t){let i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}}let a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e,i="";for(let e of t.cssRules)i+=e.cssText;return new o("string"==typeof(e=i)?e:e+"",void 0,s)})(t):t,{is:n,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:c,getPrototypeOf:u}=Object,p=globalThis,m=p.trustedTypes,_=m?m.emptyScript:"",f=p.reactiveElementPolyfillSupport,g={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!n(t,e),$={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;class b extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){let o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty("elementProperties"))return;let t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty("finalized"))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty("properties")){let t=this.properties;for(let e of[...d(t),...c(t)])this.createProperty(e,t[e])}let t=this[Symbol.metadata];if(null!==t){let e=litPropertyMetadata.get(t);if(void 0!==e)for(let[t,i]of e)this.elementProperties.set(t,i)}for(let[t,e]of(this._$Eh=new Map,this.elementProperties)){let i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t))for(let i of new Set(t.flat(1/0).reverse()))e.unshift(a(i));else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){let i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map;for(let e of this.constructor.elementProperties.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let i of s){let s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){let r=(void 0!==i.converter?.toAttribute?i.converter:g).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){let t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:g;this._$Em=s;let o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){let o=this.constructor;if(!1===s&&(r=this[t]),!(((i??=o.getPropertyOptions(t)).hasChanged??y)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[e,i]of t){let{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1,e=this._$AL;try{(t=this.shouldUpdate(e))?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}b.elementStyles=[],b.shadowRootOptions={mode:"open"},b.elementProperties=new Map,b.finalized=new Map,f?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push("2.1.2");let x=globalThis,w=t=>t,v=x.trustedTypes,A=v?v.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+k,E=`<${M}>`,C=document,O=()=>C.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,N="[ 	\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/--\x3e/g,H=/>/g,U=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,L=/"/g,D=/^(?:script|style|textarea|title)$/i,j=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=j(1),I=j(2),q=(j(3),Symbol.for("lit-noChange")),W=Symbol.for("lit-nothing"),K=new WeakMap,V=C.createTreeWalker(C,129);function J(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0,a=t.length-1,n=this.parts,[l,h]=((t,e)=>{let i=t.length-1,s=[],r,o=2===e?"<svg>":3===e?"<math>":"",a=R;for(let e=0;e<i;e++){let i=t[e],n,l,h=-1,d=0;for(;d<i.length&&(a.lastIndex=d,null!==(l=a.exec(i)));)d=a.lastIndex,a===R?"!--"===l[1]?a=z:void 0!==l[1]?a=H:void 0!==l[2]?(D.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=U):void 0!==l[3]&&(a=U):a===U?">"===l[0]?(a=r??R,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?U:'"'===l[3]?L:F):a===L||a===F?a=U:a===z||a===H?a=R:(a=U,r=void 0);let c=a===U&&t[e+1].startsWith("/>")?" ":"";o+=a===R?i+E:h>=0?(s.push(n),i.slice(0,h)+S+i.slice(h)+k+c):i+k+(-2===h?e:c)}return[J(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]})(t,e);if(this.el=Z.createElement(l,i),V.currentNode=this.el.content,2===e||3===e){let t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=V.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(let t of s.getAttributeNames())if(t.endsWith(S)){let e=h[o++],i=s.getAttribute(t).split(k),a=/([.?@])?(.*)/.exec(e);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?tt:"?"===a[1]?te:"@"===a[1]?ti:Y}),s.removeAttribute(t)}else t.startsWith(k)&&(n.push({type:6,index:r}),s.removeAttribute(t));if(D.test(s.tagName)){let t=s.textContent.split(k),e=t.length-1;if(e>0){s.textContent=v?v.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),V.nextNode(),n.push({type:2,index:++r});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===M)n.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(k,t+1));)n.push({type:7,index:r}),t+=k.length-1}r++}}static createElement(t,e){let i=C.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){if(e===q)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl,o=P(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t))._$AT(t,i,s),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=G(t,r._$AS(t,e.values),r,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??C).importNode(e,!0);V.currentNode=s;let r=V.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new X(r,r.nextSibling,this,t):1===n.type?e=new n.ctor(r,n.name,n.strings,this,t):6===n.type&&(e=new ts(r,this,t)),this._$AV.push(e),n=i[++a]}o!==n?.index&&(r=V.nextNode(),o++)}return V.currentNode=C,s}p(t){let e=0;for(let i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){let i;P(t=G(this,t,e))?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):T(i=t)||"function"==typeof i?.[Symbol.iterator]?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new Z(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new X(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){let r=this.strings,o=!1;if(void 0===r)(o=!P(t=G(this,t,e,0))||t!==this._$AH&&t!==q)&&(this._$AH=t);else{let s,a,n=t;for(t=r[0],s=0;s<r.length-1;s++)(a=G(this,n[i+s],e,s))===q&&(a=this._$AH[s]),o||=!P(a)||a!==this._$AH[s],a===W?t=W:t!==W&&(t+=(a??"")+r[s+1]),this._$AH[s]=a}o&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class te extends Y{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class ti extends Y{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??W)===q)return;let i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ts{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}let tr=x.litHtmlPolyfillSupport;tr?.(Z,X),(x.litHtmlVersions??=[]).push("3.3.3");let to=globalThis;class ta extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{let s=i?.renderBefore??e,r=s._$litPart$;if(void 0===r){let t=i?.renderBefore??null;s._$litPart$=r=new X(e.insertBefore(O(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ta._$litElement$=!0,ta.finalized=!0,to.litElementHydrateSupport?.({LitElement:ta});let tn=to.litElementPolyfillSupport;tn?.({LitElement:ta}),(to.litElementVersions??=[]).push("4.2.2");let tl=8.3144/18.02,th=[-4909965e-10,.08183197,-5552967e-10,-2.228376*1e-5,-6211808e-13,-191275e-9,.07258,-2.939*1e-4,9.841*1e-7,-192e-11];function td(t){return t<.01?611*Math.exp(th[0]+th[1]*t+th[2]*t**2+th[3]*t**3+th[4]*t**4):611*Math.exp(th[5]+th[6]*t+th[7]*t**2+th[8]*t**3+th[9]*t**4)}function tc(t){return t<.01?Math.log(611)+(th[0]+th[1]*t+th[2]*t**2+th[3]*t**3+th[4]*t**4):Math.log(611)+(th[5]+th[6]*t+th[7]*t**2+th[8]*t**3+th[9]*t**4)}function tu(t){if(!(t<Math.exp(14.2)))return console.log("too high preassure!"),null;{let e=Math.log(t),i=0,s=tc(0)-e,r=0;for(;Math.abs(s)>.001;)if(i-=2*s*1e-4/(tc(i+1e-4)-tc(i-1e-4)),s=tc(i)-e,++r>100)return console.log("too many iterations!"),null;return i}}function tp(t,e){return 2501*t+1.01*e}function tm(t,e){return(t-1.01*e)/2501}function t_(t,e){return(t-2501*e)/1.01}let tf={orange:{dt:1,dphi:5,dx:1,color:"#E67E22",label:null},red:{dt:2.5,dphi:10,dx:2.5,color:"#C0392B",label:null}},tg=(t,e)=>Number.isFinite(Number(t))&&null!==t&&""!==t?Number(t):e;function ty(t){if(!t)return null;let e=!0===t?{}:t,i={};for(let t of["orange","red"]){let s=tf[t],r=e[t]||{};i[t]={dt:Math.abs(tg(r.temperature,s.dt)),dphi:Math.abs(tg(r.humidity,s.dphi)),dx:Math.abs(tg(r.absolute_humidity,s.dx)),color:"string"==typeof r.color&&r.color?r.color:s.color,label:"string"==typeof r.label&&r.label?r.label:null}}return i.red.dt=Math.max(i.red.dt,i.orange.dt),i.red.dphi=Math.max(i.red.dphi,i.orange.dphi),i.red.dx=Math.max(i.red.dx,i.orange.dx),i}let t$=["f","wf","w","wt","t","ct","c","kf"],tb=["l","d","s"],tx={"0,0":"ok","1,0":"w","1,1":"wf","0,1":"f","-1,1":"kf","-1,0":"c","-1,-1":"ct","0,-1":"t","1,-1":"wt"};function tw(t,e,i){return t<=0?0:t<=e?1:t<=i?2:3}let tv="#22C55E",tA={w:{l:"#e49e93",d:"#cf6e60",s:"#b04336"},wf:{l:"#dc9dbb",d:"#c66d9a",s:"#a64278"},f:{l:"#baa7e2",d:"#9a7ccf",s:"#7954b3"},kf:{l:"#9eb0ea",d:"#7289da",s:"#4e63bf"},c:{l:"#82b9e5",d:"#3d96d4",s:"#0072af"},ct:{l:"#afb982",d:"#8b955f",s:"#69713d"},t:{l:"#d6a977",d:"#bf7f29",s:"#965d00"},wt:{l:"#e0a383",d:"#cb7545",s:"#ab4b00"}},tS={l:"#b2b2b2",d:"#8e8e8e",s:"#6c6c6c"},tk=[0,45,90,135,180,225,270,315],tM=+Math.PI,tE=40*Math.PI/180,tC=1.04*Math.sqrt(2*tM/tE),tO=t=>t*Math.PI/180,tP=t=>t.toFixed(2),tT=[{anchor:"start",v:"middle"},{anchor:"start",v:"top"},{anchor:"middle",v:"top"},{anchor:"end",v:"top"},{anchor:"end",v:"middle"},{anchor:"end",v:"bottom"},{anchor:"middle",v:"bottom"},{anchor:"start",v:"bottom"}];function tN(t){let e=t.currentTarget.closest(".compass-body")?.querySelector(".tip");e&&(e.style.display="none")}let tR=t=>"l"===t?"#1f2733":"#ffffff";var tz={};tz=JSON.parse('{"card":{"no_statistics":"No daily statistics available. Check that both sensors have state_class: measurement.","fetch_failed":"Could not load the history: {error}","no_data":"No days with data in this period yet.","period":"{count} days"},"compass":{"title":"Comfort compass","day":"day","days":"days","names":{"ok":"in range","w":"too warm","wf":"warm + humid","f":"too humid","kf":"cold + humid","c":"too cold","ct":"cold + dry","t":"too dry","wt":"warm + dry"},"labels":{"f":"too humid","wf":"warm +\\nhumid","w":"too warm","wt":"warm +\\ndry","t":"too dry","ct":"cold +\\ndry","c":"too cold","kf":"cold +\\nhumid"},"stages":{"l":"mild","d":"moderate","s":"severe"}},"editor":{"fields":{"header":"Title","temperature_entity":"Temperature sensor","humidity_entity":"Humidity sensor","days":"Days of history","air_mode":"Air pressure from","pressure":"Air pressure","altitude":"Altitude","comfort_t_min":"Temperature min","comfort_t_max":"Temperature max","comfort_phi_min":"Humidity min","comfort_phi_max":"Humidity max","comfort_x_min":"Absolute humidity min","comfort_x_max":"Absolute humidity max","orange_dt":"Mild up to ± temperature","orange_dphi":"Mild up to ± humidity","orange_dx":"Mild up to ± abs. humidity","red_dt":"Moderate up to ± temperature","red_dphi":"Moderate up to ± humidity","red_dx":"Moderate up to ± abs. humidity","show_legend":"Show legend","show_labels":"Show direction labels","fixed_scale":"Fixed scale (compare rooms)"},"options":{"pressure":"Pressure (Pa)","altitude":"Altitude (m)"},"sections":{"comfort":"Comfort zone","bands":"Severity (warning bands)","display":"Display"}}}');var tH={};tH=JSON.parse('{"card":{"no_statistics":"Keine Tagesstatistiken vorhanden. Prüfe, ob beide Sensoren state_class: measurement haben.","fetch_failed":"Verlauf konnte nicht geladen werden: {error}","no_data":"In diesem Zeitraum gibt es noch keine Tage mit Daten.","period":"{count} Tage"},"compass":{"title":"Komfort-Kompass","day":"Tag","days":"Tage","names":{"ok":"im Zielband","w":"zu warm","wf":"warm + feucht","f":"zu feucht","kf":"kalt + feucht","c":"zu kalt","ct":"kalt + trocken","t":"zu trocken","wt":"warm + trocken"},"labels":{"f":"zu feucht","wf":"warm +\\nfeucht","w":"zu warm","wt":"warm +\\ntrocken","t":"zu trocken","ct":"kalt +\\ntrocken","c":"zu kalt","kf":"kalt +\\nfeucht"},"stages":{"l":"leicht","d":"mittel","s":"stark"}},"editor":{"fields":{"header":"Titel","temperature_entity":"Temperatursensor","humidity_entity":"Feuchtesensor","days":"Tage Verlauf","air_mode":"Luftdruck aus","pressure":"Luftdruck","altitude":"Höhe","comfort_t_min":"Temperatur min","comfort_t_max":"Temperatur max","comfort_phi_min":"Feuchte min","comfort_phi_max":"Feuchte max","comfort_x_min":"Absolute Feuchte min","comfort_x_max":"Absolute Feuchte max","orange_dt":"Leicht bis ± Temperatur","orange_dphi":"Leicht bis ± Feuchte","orange_dx":"Leicht bis ± abs. Feuchte","red_dt":"Mittel bis ± Temperatur","red_dphi":"Mittel bis ± Feuchte","red_dx":"Mittel bis ± abs. Feuchte","show_legend":"Legende anzeigen","show_labels":"Richtungen beschriften","fixed_scale":"Feste Skala (Räume vergleichen)"},"options":{"pressure":"Druck (Pa)","altitude":"Höhe (m)"},"sections":{"comfort":"Komfortzone","bands":"Abstufung (Warnbänder)","display":"Darstellung"}}}');let tU={en:t(tz),de:t(tH)},tF=(t,e)=>e.split(".").reduce((t,e)=>null==t?void 0:t[e],t);function tL(e,i,s){let r=tF(tU[function(t){let e=String(t?.locale?.language||t?.language||"en").toLowerCase();if(tU[e])return e;let i=e.split(/[-_]/)[0];return tU[i]?i:"en"}(e)],i);return("string"!=typeof r&&(r=tF(t(tz),i)),"string"!=typeof r)?i:(s&&(r=r.replace(/\{(\w+)\}/g,(t,e)=>null!=s[e]?String(s[e]):t)),r)}var tD=((t,...e)=>new o(1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]),t,s))`
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
`;let tj={temperature:[20,26],humidity:[30,60],absolute_humidity:[0,12]},tB=t=>Array.isArray(t)&&2===t.length&&t.every(t=>Number.isFinite(Number(t))),tI=["type","temperature_entity","humidity_entity","header","days","altitude","pressure","comfort_zone","warning_bands","show_labels","show_legend","scale"],tq=(t,e,i,s)=>({number:{step:t,mode:"box",unit_of_measurement:e,min:i,max:s}});customElements.define("comfort-compass-card",class extends ta{static styles=tD;static get properties(){return{layout:{type:String,reflect:!0},_fixedHeight:{type:Boolean,reflect:!0,attribute:"fixed-height"},_config:{state:!0},_days:{state:!0},_error:{state:!0},_compact:{state:!0},_box:{state:!0}}}constructor(){super(),this._hass=void 0,this._fetchKey=null,this._days=[],this._compact=!1,this._box=null,this._resizeObserver=void 0}connectedCallback(){super.connectedCallback(),clearInterval(this._refreshTimer),this._refreshTimer=setInterval(()=>this._maybeFetch(!0),36e5),this._wasConnected&&this._maybeFetch(!0),this._wasConnected=!0,!this._resizeObserver&&"u">typeof ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>this._measure())),this.updateComplete.then(()=>{let t=this.renderRoot?.querySelector(".card-content");t&&this._resizeObserver&&this._resizeObserver.observe(t)})}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._refreshTimer),this._refreshTimer=void 0,this._resizeObserver?.disconnect()}_measure(){let t=this.renderRoot?.querySelector(".card-content");if(!t)return;let e=t.getBoundingClientRect();if(!e.width)return;let i=getComputedStyle(t),s=parseFloat(i.paddingLeft)+parseFloat(i.paddingRight),r=parseFloat(i.paddingTop)+parseFloat(i.paddingBottom),o=this.renderRoot.querySelector(".legend"),a=this.renderRoot.querySelector(".glyph-box"),n=o&&a&&o.getBoundingClientRect().top>=a.getBoundingClientRect().bottom-1,l=n?o.getBoundingClientRect().height+8:0,h=o&&!n?o.getBoundingClientRect().width+20:0,d=e.width-s-h,c=e.height-r-l,u=(this._fixedHeight?Math.min(d,c):d)<200;if(u!==this._compact&&(this._compact=u),a){let t=a.getBoundingClientRect(),e={w:Math.round(t.width),h:this._fixedHeight?Math.round(t.height):0},i=this._box;(!i||Math.abs(i.w-e.w)>2||Math.abs(i.h-e.h)>2)&&(this._box=e)}}setConfig(t){if(!t.temperature_entity)throw Error("temperature_entity is required");if(!t.humidity_entity)throw Error("humidity_entity is required");this._config=t,this._period=Math.max(1,Math.round(Number(t.days)||30)),this._pressure=Number.isFinite(Number(t.altitude))&&null!==t.altitude&&""!==t.altitude?101325*Math.pow(1-225577e-10*Number(t.altitude),5.25588):Number(t.pressure)||101325,this._comfort=function(t){let e={...tj,...t&&"object"==typeof t?t:{}},i=tB(e.temperature)?e.temperature:tj.temperature,s=tB(e.humidity)?e.humidity:tj.humidity,r=tB(e.absolute_humidity)?e.absolute_humidity:tj.absolute_humidity,o=t=>t.map(Number).sort((t,e)=>t-e),[a,n]=o(i),[l,h]=o(s),[d,c]=o(r);return{range_t:[a,n],range_phi:[l/100,h/100],range_x:[d/1e3,c/1e3]}}(t.comfort_zone),this._bands=ty(t.warning_bands||!0),this._mollier=function(t){if("classical"!==(t=t||"classical")&&"glueck"!==t)throw Error("Unknown Mollier convention: "+t);let e="classical"===t?function(t,e){return 1.01*e/(1.01+1.86*t)}:function(t,e){return(1.01*e*(1+t)+2501*t*t)/(1.01+1.86*t)},i="classical"===t?function(t,e){return t*(1.01+1.86*e)/1.01}:function(t,e){return(t*(1.01+1.86*e)-2501*e*e)/(1.01*(1+e))};function s(t,e,s){return i(tu(e*s/(t*(.6222+e))),e)}function r(t,i,s){let r=function(t){return t/(.6222+t)*s/td(e(t,i))},o=0,a=r(0)-t,n=0;for(;Math.abs(a)>1e-5;)if(o-=2*a*1e-6/(r(o+1e-6)-r(o-1e-6)),a=r(o)-t,++n>100)return console.log("too many iterations!"),null;return o}return{convention:t,temperature:function(t,i){return e(t,i)},rel_humidity:function(t,i,s){return t/(.6222+t)*s/td(e(t,i))},density:function(t,i,s){return s/(tl*(273.15+e(t,i)))*(1+t)/(.6222+t)/1e3},get_x_y:function(t,e,s){let r={};return r.x=.6222*e/(s/td(t)-e),r.y=i(t,r.x),r},get_x_y_tx:function(t,e,s){return{x:e,y:i(t,e)}},get_x_y_phix:function(t,e,i){return{x:e,y:s(t,e,i)}},get_x_y_phiy:function(t,e,i){return{x:r(t,e,i),y:e}},y_phix:s,x_phiy:r,y_rhox:function(t,e,s){return i(s/(tl*t)*(1+e)/(.6222+e)*.001-273.15,e)},enthalpy:tp,x_hy:tm,y_hx:t_,p_sat:td,log_p_sat:tc,temperature_p_sat:tu}}("classical"),this._updateSizingMode(),this._hass&&this._maybeFetch()}set hass(t){let e=!this._hass,i=this._hass?.locale?.language!==t?.locale?.language,s=this._hass?.themes?.darkMode!==t?.themes?.darkMode;this._hass=t,e&&this._config&&this._maybeFetch(),(i||s)&&this.requestUpdate()}get hass(){return this._hass}_updateSizingMode(){let t=this._config?.grid_options?.rows;this._fixedHeight="panel"===this.layout||"grid"===this.layout&&"number"==typeof t}willUpdate(t){t.has("layout")&&this._updateSizingMode()}_t(t,e){return tL(this._hass,t,e)}async _maybeFetch(t=!1){let e=this._config;if(!this._hass||!e)return;let i=`${e.temperature_entity}|${e.humidity_entity}|${this._period}`;if(i!==this._fetchKey||t){this._fetchKey=i;try{let t=await async function(t,e,i,s){let r=new Date;r.setHours(0,0,0,0);let o=new Date(r);o.setDate(o.getDate()-s);let a=await t.callWS({type:"recorder/statistics_during_period",start_time:o.toISOString(),end_time:r.toISOString(),statistic_ids:[e,i],period:"day",types:["mean"],units:{temperature:"°C"}}),n=a?.[e]||[],l=a?.[i]||[],h=t=>"number"==typeof t?t:Date.parse(t),d=new Map;for(let t of n)d.set(h(t.start),{date:new Date(h(t.start)),t:t.mean});for(let t of l){let e=d.get(h(t.start));e&&(e.rh=t.mean)}return[...d.values()].filter(t=>Number.isFinite(t.t)&&Number.isFinite(t.rh)).map(t=>({date:t.date,t:t.t,phi:t.rh>1?t.rh/100:t.rh})).sort((t,e)=>t.date-e.date)}(this._hass,e.temperature_entity,e.humidity_entity,this._period);if(this._fetchKey!==i)return;this._days=t,this._error=t.length?void 0:{key:"card.no_statistics"}}catch(t){if(this._fetchKey!==i)return;this._error={key:"card.fetch_failed",vars:{error:t&&t.message||t}},this._fetchKey=null}}}render(){let t;if(!this._config)return W;let e=this._config;if(this._error){let e="card.no_statistics"===this._error.key;t=B`<p class="message ${e?"":"error"}">${this._t(this._error.key,this._error.vars)}</p>`}else t=this._days.length?function(t,e,i={}){let s=!1!==i.showLabels,r=i.dark?"l":"s",o=e=>Number(t[e]||0),a=Object.values(t).reduce((t,e)=>t+Number(e||0),0),n=t=>a?o(t)/a:0,l=t=>1===Math.round(t)?e("compass.day"):e("compass.days"),h=t=>e(`compass.names.${t}`),d=t=>e(`compass.stages.${t}`),c=t=>a?(t/a*100).toFixed(0):"0",u=t=>`${Math.round(t)} ${l(t)} \xb7 ${c(t)}%`,p=t=>tb.reduce((e,i)=>e+o(`${t}_${i}`),0),m=n("ok"),_=+Math.sqrt(Math.max(m,0)),f=[],g=[],y=Math.max(_,1);t$.forEach((t,e)=>{let i=0,s=_;for(let r of tb){let a=o(`${t}_${r}`),l=Math.sqrt(_*_+2*tM*(i+=n(`${t}_${r}`))/tE);if(l>s+1e-9){let i=p(t);f.push({r1:s,r2:l,deg:tk[e],color:tA[t][r],tip:{bg:tA[t][r],fg:tR(r),lines:[`${h(t)} \xb7 ${d(r)}`,u(a),`${h(t)}: ${u(i)}`,tb.map(e=>`${d(e)} ${c(o(`${t}_${e}`))}%`).join(" / ")]}})}s=l}y=Math.max(y,s),g.push(Math.max(s,1))});let $=90/(i.fixedScale?tC:y),b=(t,e)=>[t*$*Math.cos(tO(e)),-t*$*Math.sin(tO(e))],x=t=>{let o=1.08*t,a=i.fixedScale?{x0:-tC*$,x1:tC*$,y0:-tC*$,y1:tC*$}:{x0:-y*$,x1:y*$,y0:-y*$,y1:y*$},n=s?tk.map((i,s)=>{let[n,l]=b(g[s],i),[h,d]=[Math.cos(tO(i)),-Math.sin(tO(i))],c=.58*t,u=n+h*c,p=l+d*c,m=e(`compass.labels.${t$[s]}`).split("\n"),_=tT[s],f=.58*Math.max(...m.map(t=>t.length))*t,y=m.length*o,$="top"===_.v?p-y:"bottom"===_.v?p:p-y/2,x="start"===_.anchor?u:"end"===_.anchor?u-f:u-f/2;return a.x0=Math.min(a.x0,x),a.x1=Math.max(a.x1,x+f),a.y0=Math.min(a.y0,$),a.y1=Math.max(a.y1,$+y),{ax:u,baseline:$+.875*t,anchor:_.anchor,lines:m,color:tA[t$[s]][r]}}):[],l=t/3;return{font:t,lh:o,specs:n,vb:[a.x0-l,a.y0-l,a.x1-a.x0+2*l,a.y1-a.y0+2*l]}},w=x(12);if(s&&i.boxW>0)for(let t=0;t<3;t++){let[,,t,e]=w.vb,s=Math.max(6,Math.min(40,12.5/(i.boxH>0?Math.min(i.boxW/t,i.boxH/e):i.boxW/t)));if(.2>Math.abs(s-w.font))break;w=x(s)}let v=w.specs.map(t=>I`<text x=${tP(t.ax)} y=${tP(t.baseline)} text-anchor=${t.anchor} fill=${t.color} font-size=${tP(w.font)} font-weight="500">
        ${t.lines.map((e,i)=>I`<tspan x=${tP(t.ax)} dy=${0===i?0:tP(w.lh)}>${e}</tspan>`)}</text>`),A=w.vb.map(tP).join(" "),S=[{k:"ok",cnt:o("ok"),color:tv}],k=[];for(let t of t$){let e=p(t);e>0&&k.push({k:t,cnt:e,color:tA[t].d})}k.sort((t,e)=>e.cnt-t.cnt),S.push(...k);let M=(100*m).toFixed(0),E=Math.max(12,Math.min(22,_*$*.45)),C={bg:tv,fg:"#ffffff",lines:[h("ok"),u(o("ok"))]},O=t=>e=>(function(t,e){let i=t.currentTarget,s=i.closest(".compass-body"),r=s&&s.querySelector(".tip");if(!r)return;let o=s.getBoundingClientRect(),a=i.getBoundingClientRect();r.replaceChildren(),e.lines.forEach((t,e)=>{let i=document.createElement("div");i.textContent=t,0===e&&(i.className="tip-head"),r.appendChild(i)}),r.style.background=e.bg,r.style.color=e.fg,r.style.left=`${a.left+a.width/2-o.left}px`,r.style.top=`${a.top-o.top}px`,r.style.display="block"})(e,t),P=i.showLegend?B`
        <div class="legend">
            ${S.map(t=>B`
                <div class="row"><span class="dot" style="background:${t.color}"></span>
                    <span class="name">${h(t.k)}</span>
                    <span class="count">${Math.round(t.cnt)} <span class="unit">${l(t.cnt)}</span></span>
                    <span class="share">${c(t.cnt)}%</span></div>`)}
            ${k.length?B`
                <div class="stage-key">
                    ${tb.map(t=>B`<span><span class="dot" style="background:${tS[t]}"></span>${d(t)}</span>`)}
                </div>`:W}
        </div>`:W;return B`
        <div class="compass-body ${i.showLegend?"with-legend":""}">
            <div class="glyph-box">
                <svg class="glyph" viewBox=${A} role="img" aria-label=${e("compass.title")}>
                    <circle class="ref" r=${tP(+$)}></circle>
                    ${_>0?I`<circle class="seg ok" r=${tP(_*$)} fill=${tv}
                        @mouseenter=${O(C)} @click=${O(C)} @mouseleave=${tN}></circle>`:W}
                    ${f.map(t=>I`<path class="seg" d=${((t,e,i)=>{let s=i-20,r=i+20,[o,a]=b(e,s),[n,l]=b(e,r),h=e*$,d=`M${tP(o)},${tP(a)}A${tP(h)},${tP(h)} 0 0 0 ${tP(n)},${tP(l)}`;if(t<1e-9)return`${d}L0,0Z`;let[c,u]=b(t,r),[p,m]=b(t,s),_=t*$;return`${d}L${tP(c)},${tP(u)}A${tP(_)},${tP(_)} 0 0 1 ${tP(p)},${tP(m)}Z`})(t.r1,t.r2,t.deg)} fill=${t.color}
                        @mouseenter=${O(t.tip)} @click=${O(t.tip)} @mouseleave=${tN}></path>`)}
                    ${100*m>=15?I`<text class="ok-pct" y=${tP(.36*E)} text-anchor="middle" font-size=${tP(E)}>${M}%</text>`:W}
                    ${v}
                </svg>
            </div>
            ${P}
            <div class="tip" role="tooltip"></div>
        </div>
    `}(function(t,e,i,s,r){let o=i||ty(!0),a={ok:0};for(let t of t$)for(let e of tb)a[`${t}_${e}`]=0;let[n,l]=e.range_t,h=100*e.range_phi[0],d=100*e.range_phi[1],[c,u]=e.range_x,p=[o.orange.dt,o.red.dt],m=[o.orange.dphi,o.red.dphi],_=[o.orange.dx/1e3,o.red.dx/1e3];for(let e of t){let t=e.t,i=100*e.phi;if(!Number.isFinite(t)||!Number.isFinite(i))continue;let o=t<n?-1:+(t>l),f=tw(1===o?t-l:-1===o?n-t:0,p[0],p[1]),g=r.get_x_y(t,e.phi,s).x,y=i>d||g>u?1:i<h||g<c?-1:0,$=1===y?i-d:-1===y?h-i:0,b=1===y?g-u:-1===y?c-g:0,x=Math.max(f,Math.max(tw($,m[0],m[1]),tw(b,_[0],_[1]))),w=x<=1?"l":x<=2?"d":"s",v=tx[`${o},${y}`];a["ok"===v?"ok":`${v}_${w}`]+=1}return a}(this._days,this._comfort,this._bands,this._pressure,this._mollier),(t,e)=>this._t(t,e),{fixedScale:"fixed"===e.scale,showLegend:!0===e.show_legend,showLabels:!1!==e.show_labels&&!this._compact,dark:!!this._hass?.themes?.darkMode,boxW:this._box?.w,boxH:this._box?.h}):this._fetchKey?B`<p class="message">${this._t("card.no_data")}</p>`:W;return B`
            <ha-card .header=${e.header||void 0}>
                <div class="card-content">${t}</div>
            </ha-card>
        `}static getConfigElement(){return document.createElement("comfort-compass-card-editor")}static getStubConfig(t){let e=Object.values(t?.states||{}),i=t=>e.find(e=>e.attributes?.device_class===t&&e.attributes?.state_class==="measurement")?.entity_id;return{temperature_entity:i("temperature")||"sensor.living_room_temperature",humidity_entity:i("humidity")||"sensor.living_room_humidity",days:30}}getCardSize(){return 5}getGridOptions(){return{columns:6,min_columns:3,min_rows:3}}}),customElements.define("comfort-compass-card-editor",class extends ta{static get properties(){return{hass:{attribute:!1},_config:{state:!0}}}setConfig(t){this._config=t}render(){let t,e;if(!this._config)return B``;let i=t=>tL(this.hass,t),s=function(t={}){let e={...tj,...t.comfort_zone||{}},i="object"==typeof t.warning_bands&&t.warning_bands?t.warning_bands:{},s=(t,e,s)=>i[t]?.[e]??tf[t][s];return{header:t.header??"",temperature_entity:t.temperature_entity??"",humidity_entity:t.humidity_entity??"",days:t.days??30,air_mode:void 0!==t.altitude&&null!==t.altitude?"altitude":"pressure",altitude:t.altitude??450,pressure:t.pressure??101325,comfort_t_min:e.temperature[0],comfort_t_max:e.temperature[1],comfort_phi_min:e.humidity[0],comfort_phi_max:e.humidity[1],comfort_x_min:e.absolute_humidity[0],comfort_x_max:e.absolute_humidity[1],orange_dt:s("orange","temperature","dt"),orange_dphi:s("orange","humidity","dphi"),orange_dx:s("orange","absolute_humidity","dx"),red_dt:s("red","temperature","dt"),red_dphi:s("red","humidity","dphi"),red_dx:s("red","absolute_humidity","dx"),show_labels:!1!==t.show_labels,show_legend:!0===t.show_legend,fixed_scale:"fixed"===t.scale}}(this._config);return B`
            <ha-form
                .hass=${this.hass}
                .data=${s}
                .schema=${t=(t,e,i)=>({type:"grid",schema:[{name:t,selector:i},{name:e,selector:i}]}),e=t=>({type:"grid",schema:[{name:`${t}_dt`,selector:tq(.5,"K",0)},{name:`${t}_dphi`,selector:tq(1,"%",0,100)},{name:`${t}_dx`,selector:tq(.5,"g/kg",0)}]}),[{name:"header",selector:{text:{}}},{type:"grid",schema:[{name:"temperature_entity",required:!0,selector:{statistic:{device_class:"temperature"}}},{name:"humidity_entity",required:!0,selector:{statistic:{device_class:"humidity"}}}]},{type:"grid",schema:[{name:"days",selector:tq(1,void 0,1,365)},{name:"air_mode",selector:{select:{mode:"dropdown",options:[{value:"altitude",label:i("editor.options.altitude")},{value:"pressure",label:i("editor.options.pressure")}]}}},"pressure"===s.air_mode?{name:"pressure",selector:tq(1,"Pa",5e4,11e4)}:{name:"altitude",selector:tq(10,"m",0,5e3)}]},{type:"expandable",title:i("editor.sections.display"),schema:[{type:"grid",schema:[{name:"show_labels",selector:{boolean:{}}},{name:"show_legend",selector:{boolean:{}}},{name:"fixed_scale",selector:{boolean:{}}}]}]},{type:"expandable",title:i("editor.sections.comfort"),schema:[t("comfort_t_min","comfort_t_max",tq(.5,"°C")),t("comfort_phi_min","comfort_phi_max",tq(1,"%",0,100)),t("comfort_x_min","comfort_x_max",tq(.5,"g/kg",0))]},{type:"expandable",title:i("editor.sections.bands"),schema:[e("orange"),e("red")]}]}
                .computeLabel=${t=>i(`editor.fields.${t.name}`)}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `}_valueChanged(t){let e=function(t,e={}){let i={...e};for(let t of tI)delete i[t];Object.assign(i,{type:"custom:comfort-compass-card",temperature_entity:t.temperature_entity,humidity_entity:t.humidity_entity}),t.header&&(i.header=t.header),30!==t.days&&(i.days=t.days),"altitude"===t.air_mode?i.altitude=t.altitude:(void 0!==e.pressure||101325!==t.pressure)&&(i.pressure=t.pressure);let s={temperature:[t.comfort_t_min,t.comfort_t_max],humidity:[t.comfort_phi_min,t.comfort_phi_max],absolute_humidity:[t.comfort_x_min,t.comfort_x_max]};JSON.stringify(s)!==JSON.stringify(tj)&&(i.comfort_zone=s);let r="object"==typeof e.warning_bands&&e.warning_bands?e.warning_bands:{},o={};for(let e of["orange","red"]){let i={...r[e]||{}},s={temperature:t[`${e}_dt`],humidity:t[`${e}_dphi`],absolute_humidity:t[`${e}_dx`]},a={temperature:tf[e].dt,humidity:tf[e].dphi,absolute_humidity:tf[e].dx};for(let t of Object.keys(s))s[t]!==a[t]?i[t]=s[t]:delete i[t];Object.keys(i).length&&(o[e]=i)}return Object.keys(o).length&&(i.warning_bands=o),t.show_labels||(i.show_labels=!1),t.show_legend&&(i.show_legend=!0),t.fixed_scale&&(i.scale="fixed"),i}(t.detail.value,this._config);this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}}),window.customCards=window.customCards||[],window.customCards.push({type:"comfort-compass-card",name:"Comfort compass card",description:"Shows how the days split into in range, too warm, too humid, too dry or too cold, from a temperature and a humidity sensor.",preview:!0,documentationURL:"https://github.com/retomarek/comfort-compass-card"}),console.info("%c COMFORT-COMPASS-CARD %c v1.0.0-beta.1 ","color: white; background: #22a35a; font-weight: 700;","color: #22a35a; background: white; font-weight: 700;")})();