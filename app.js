'use strict';
(() => {
  const {dishes,categories,signatureSet,featured,archivedDishes=[],setDishes=[],setTitle='招牌套餐',legacySignatureSet=[]}=window.MENU;
  const images=window.MENU_IMAGES||{};
  const presentation=window.MENU_PRESENTATION||{categories:{},highlights:{}};
  const highlightFor=d=>presentation.highlights[d.id];
  const signatureCopy=d=>presentation.signatureRibbons?.[d.id];
  const recommendationFor=d=>variantFor(d,chosenVariant(d))?.description||highlightFor(d)?.copy||d.recommendation||'';
  const imageSizes=window.MENU_IMAGE_SIZES||{};
  const byId=new Map([...archivedDishes,...dishes,...setDishes].map(d=>[d.id,d]));
  const activeIds=new Set([...dishes,...setDishes].map(d=>d.id));
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dishTitle=d=>d.id==='dish-029'?'<span class="dish-name-word">客家</span><span class="dish-name-word">招牌</span><span class="dish-name-word">酿蛋</span>':esc(d.name);
  const preferences={all:'随心选',mild:'偏清淡',spicy:'偏麻辣',kids:'小孩爱吃'};
  const STORAGE_KEY='jianfeng-home-menu:v1';
  let state={version:4,lines:[],notes:'',custom:'',preference:'all'};
  let currentCategory='signature',choices={},toastTimer,storageWarningShown=false;
  let imageObserver,scrollFrame=0;
  const variantFor=(d,id)=>d.variants?.find(v=>v.id===id);
  const defaultVariant=d=>d.defaultVariant||d.variants?.[0]?.id||'';
  const lineKey=(id,variantId='')=>id+'::'+variantId;
  const chosenVariant=d=>choices[d.id]||state.lines.find(l=>l.id===d.id)?.variantId||defaultVariant(d);
  const quantity=(id,variantId='')=>state.lines.find(l=>l.id===id&&l.variantId===variantId)?.quantity||0;
  const totalQuantity=id=>state.lines.filter(l=>l.id===id).reduce((n,l)=>n+l.quantity,0);
  function lineName(line,plain=false){const d=byId.get(line.id);const name=variantFor(d,line.variantId)?.cartName||d.name;return !plain&&d.scope==='seafood-set'?name+'（海鲜套餐）':name;}
  function normalizeLine(item){
    if(!item||typeof item!=='object')return null;
    const d=byId.get(item.id);if(!d||!Number.isInteger(item.quantity)||item.quantity<=0)return null;
    const v=item.variantId??defaultVariant(d);
    if(d.variants?.length&&!variantFor(d,v))return null;
    if(!d.variants?.length&&v)return null;
    return {id:d.id,variantId:v,quantity:Math.min(99,item.quantity)};
  }
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved&&typeof saved==='object'){
      for(const [k,limit]of [['notes',20000],['custom',80]])if(typeof saved[k]==='string')state[k]=saved[k].slice(0,limit);
      if(Object.prototype.hasOwnProperty.call(preferences,saved.preference))state.preference=saved.preference;
      let source=Array.isArray(saved.lines)?saved.lines:Object.entries(saved.items||{}).map(([id,quantity])=>({id,quantity}));
      // Older orders keep their IDs. A complete old package explicitly selected bass.
      if(!Array.isArray(saved.lines)&&saved.bundle&&legacySignatureSet.every(i=>saved.items?.[i.id]>0))source=source.map(l=>({...l,variantId:legacySignatureSet.find(i=>i.id===l.id)?.variantId}));
      const restored=new Map();
      for(const raw of source){const line=normalizeLine(raw);if(line){const key=lineKey(line.id,line.variantId);line.quantity=Math.min(99,line.quantity+(restored.get(key)?.quantity||0));restored.set(key,line);}}
      state.lines=[...restored.values()];
      if(saved.version!==2&&saved.version!==4){
        const legacy=Object.entries(saved.dishNotes||{}).filter(([id,note])=>totalQuantity(id)>0&&typeof note==='string'&&note.trim()).map(([id,note])=>byId.get(id).name+'：'+note.trim().slice(0,160));
        state.notes=[state.notes,...legacy].filter(Boolean).join('；').slice(0,20000);
      }
    }
  }catch{/* A damaged or unavailable saved order does not block choosing dishes. */}
  function notify(message){
    const toast=$('toast');toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);
    const dialogs=[...document.querySelectorAll('dialog[open]')];(dialogs[dialogs.length-1]||document.body).append(toast);
    toastTimer=setTimeout(()=>{toast.hidden=true;document.body.append(toast);},3300);
  }
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{if(!storageWarningShown){notify('当前浏览器无法保存，请在离开前复制菜单。');storageWarningShown=true;}}}
  function counts(){const custom=state.custom.trim()?1:0;return {dishes:state.lines.length+custom,portions:state.lines.reduce((n,l)=>n+l.quantity,0)+custom};}
  function stepper(d,variantId=chosenVariant(d),compact=false){
    const qty=quantity(d.id,variantId),name=variantFor(d,variantId)?.cartName||d.name;
    const attrs=`data-id="${esc(d.id)}" data-variant="${esc(variantId)}"`;
    return `<div class="stepper ${qty?'has-quantity':''}">${qty?`<button type="button" class="quantity-button minus" data-action="minus" ${attrs} aria-label="减少${esc(name)}">−</button><span class="quantity-value" aria-label="${esc(name)}已选${qty}份">${qty}</span><button type="button" class="quantity-button plus" data-action="plus" ${attrs} aria-label="增加${esc(name)}" ${qty>=99?'disabled':''}>＋</button>`:`<button type="button" class="add-dish ${compact?'compact':''}" data-action="plus" ${attrs} aria-label="增加${esc(name)}">想吃这个<span class="add-symbol" aria-hidden="true">＋</span></button>`}</div>`;
  }
  function photoFor(d){return images[d.imageKey||d.name];}
  function imageMarkup(photo,alt,{eager=false,wide=false,hero=false}={}){
    const size=photo.srcset?photo:(imageSizes[photo.src]||{}),sizes=hero?'(max-width: 700px) calc(100vw - 118px), 1000px':wide?'(max-width: 700px) calc(100vw - 96px), (max-width: 1000px) calc(100vw - 146px), 340px':'(max-width: 359px) 92px, (max-width: 700px) calc((100vw - 105px) / 2), (max-width: 1000px) calc((100vw - 180px) / 2), 340px';
    return `<img class="food-image" src="${esc(photo.src)}" ${size.srcset?`srcset="${esc(size.srcset)}" sizes="${sizes}"`:''} alt="${esc(alt)}" width="${size.width||800}" height="${size.height||600}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':''} decoding="async" style="object-position:${esc(photo.position||'center')}">`;
  }
  function dishPhoto(d,index=9,feature=false){
    const photo=photoFor(d);if(!photo||d.display==='text')return '';
    const parts=photo.parts||[photo],copy=signatureCopy(d);
    return `<figure class="dish-photo ${photo.parts?'dish-photo-pair':''} ${copy?'has-signature-ribbon':''}">${parts.map(p=>`<div class="photo-part">${imageMarkup(p,(p.label||d.name)+'示意图',{eager:feature&&index===0,wide:feature&&index%3===0})}${photo.parts?`<span class="photo-part-label">${esc(p.label)}</span>`:''}</div>`).join('')}${copy?`${signatureBadge()}<figcaption class="signature-ribbon"><span class="ribbon-copy"><strong class="ribbon-main">${esc(copy.split('，')[0])}</strong><span class="ribbon-comma">，</span><span class="ribbon-detail">${esc(copy.split('，')[1]||'')}</span></span></figcaption>`:''}</figure>`;
  }
  function variantPicker(d){return d.variants?.length>1?`<div class="variant-picker" role="group" aria-label="${esc(d.name)}做法">${d.variants.map(v=>`<button type="button" data-choice="${esc(v.id)}" data-id="${esc(d.id)}" aria-pressed="${chosenVariant(d)===v.id}" class="variant-pill ${chosenVariant(d)===v.id?'active':''}">${esc(v.label)}</button>`).join('')}</div>`:'';}
  function card(d,index=9,feature=false){
    const photo=dishPhoto(d,index,feature),qty=totalQuantity(d.id);
    const signature=signatureCopy(d);
    const recommendation=signature||recommendationFor(d);
    const chips=feature?'家里拿手':d.fulfillment==='takeaway'?'点外卖':d.tags.includes('hakka')?'客家风味':'';
    return `<article class="dish-card ${photo?'photo-card':'text-card'} ${highlightFor(d)?'highlight-card':''} ${feature?'featured-card':''} ${feature&&index===0?'feature-lead':''} ${signature?'signature-card':''} ${qty?'selected':''}" data-dish="${esc(d.id)}">${photo}<div class="dish-info"><div class="dish-name-line"><h3>${dishTitle(d)}</h3>${d.fulfillment==='takeaway'&&!d.name.includes('外卖')?'<span class="takeaway-label">外卖</span>':''}</div><p class="dish-description ${highlightFor(d)?'selling-point':''} ${highlightFor(d)&&!signature?'wheat-point':''}">${esc(recommendation)}</p>${variantPicker(d)}<div class="dish-bottom"><span class="selection-status">${qty?`已选 ${qty} 份`:`<span class="quiet-tag">${esc(chips)}</span>`}</span>${stepper(d)}</div></div></article>`;
  }
  function visibleDishes(){return dishes.filter(d=>state.preference==='all'||d.tags.includes(state.preference));}
  function rowsForCategory(id){return visibleDishes().filter(d=>d.categories.includes(id));}
  function availableCategories(){return categories.filter(c=>c.id==='signature-set'?state.preference==='all':rowsForCategory(c.id).length);}
  function dishGroups(rows){
    const photo=rows.filter(d=>d.display!=='text'&&photoFor(d)),text=rows.filter(d=>d.display==='text'||!photoFor(d));
    return `${photo.length?`<div class="dish-grid">${photo.map((d,i)=>card(d,i+3)).join('')}</div>`:''}${text.length?`<div class="text-dishes">${text.map(d=>card(d)).join('')}</div>`:''}`;
  }
  function decorationMarkup(art,eager=false,masthead=false){
    if(!art?.src)return '';
    const sizes=masthead?'(max-width: 1400px) 100vw, 1400px':art.role==='ingredients'?'(max-width: 700px) 40vw, 380px':'(max-width: 700px) calc(100vw - 98px), 1100px';
    return `<picture class="banner-picture">${art.desktop?`<source media="(min-width: 701px)" srcset="${esc(art.desktop.srcset)}" sizes="${sizes}" width="${art.desktop.width}" height="${art.desktop.height}">`:''}<img class="decor-image" data-text-included="${art.textIncluded?'true':'false'}" src="${esc(art.src)}" srcset="${esc(art.srcset)}" sizes="${sizes}" alt="" aria-hidden="true" width="${art.width}" height="${art.height}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':''} decoding="async"></picture>`;
  }
  function signatureBadge(){
    return `<span class="signature-stamp signature-seal" aria-label="家里招牌"><img src="${esc(presentation.badge?.src||'assets/signature-tag.svg')}" width="72" height="64" alt="" aria-hidden="true"></span>`;
  }
  function categoryBanner(id,count,{headingId,title}={}){
    const category=categories.find(c=>c.id===id),display=presentation.categories[id]||{};
    return `<header class="category-banner" data-banner="${esc(id)}"><div class="banner-copy"><h2 id="${esc(headingId||'group-'+id)}" tabindex="-1">${esc(title||category.label)}</h2><p class="banner-subtitle">${esc(display.subtitle||'合口味的，随心选')}</p></div><span class="banner-art" aria-hidden="true">${decorationMarkup(display.art,id==='signature')}</span><span ${id==='signature'?'id="featured-count"':''} class="banner-count">${count} 道${id==='signature'?'拿手菜':'可选'}</span></header>`;
  }
  function renderMenu(){
    const found=visibleDishes(),available=availableCategories();
    if(!available.some(c=>c.id===currentCategory))currentCategory=available[0]?.id||'signature';
    const featuredRows=featured.map(id=>byId.get(id)).filter(d=>found.includes(d));
    $('featured-section').hidden=!featuredRows.length;
    $('featured-list').innerHTML=featuredRows.map((d,i)=>card(d,i,true)).join('');
    $('featured-heading').innerHTML=categoryBanner('signature',featuredRows.length,{headingId:'featured-title'});
    $('filter-hint').hidden=state.preference==='all';
    $('filter-hint').textContent=state.preference==='kids'?'先看看温和、软嫩或酸甜的菜。具体口味和忌口选好后一起写。':`已挑出${preferences[state.preference]}的菜，往下慢慢选。`;
    $('empty-state').hidden=found.length>0;
    const regular=available.filter(c=>!['signature','signature-set'].includes(c.id));
    $('regular-menu').hidden=!regular.length;
    $('dish-list').innerHTML=regular.map(c=>`<section id="menu-category-${esc(c.id)}" class="dish-group menu-section" data-menu-section="${esc(c.id)}" aria-labelledby="group-${esc(c.id)}">${categoryBanner(c.id,rowsForCategory(c.id).length)}${dishGroups(rowsForCategory(c.id))}</section>`).join('');
    renderSet();updateNavigation();updateSummary();observeImages();
  }
  function renderSet(){
    const show=state.preference==='all';$('signature-set').hidden=!show;if(!show)return;
    const hero=images['海鲜套餐家宴'];
    const fallback=[];
    $('signature-set').innerHTML=`${categoryBanner('signature-set',10,{headingId:'seafood-set-title'})}<div class="set-panel">${hero?`<figure class="set-table-photo">${imageMarkup(hero,'用户提供的家宴照片，海鲜版套餐菜品以清单为准',{hero:true})}</figure>`:`<div class="set-photos">${fallback.map(d=>imageMarkup(photoFor(d),d.name+'示意图')).join('')}</div>`}<div class="set-intro"><strong>${esc(setTitle)}</strong><span>10 道搭配 · 独立选，不与单点合并</span></div><ol class="set-menu-preview"></ol><button type="button" id="add-signature-set" class="primary-button set-button"></button><p class="set-note"></p><details id="set-details"><summary>也可以单独挑 <span aria-hidden="true">＋</span></summary><div class="set-dishes"></div></details></div>`;
    updateSet();
  }
  function updateSet(){
    if($('signature-set').hidden)return;
    const root=$('signature-set'),missing=signatureSet.filter(i=>!totalQuantity(i.id)).length,selected=signatureSet.length-missing;
    const preview=root.querySelector('.set-menu-preview'),button=$('add-signature-set'),note=root.querySelector('.set-note'),list=root.querySelector('.set-dishes');
    if(preview)preview.innerHTML=signatureSet.map(i=>`<li class="${totalQuantity(i.id)?'set-picked':''}">${esc(i.label)}${totalQuantity(i.id)?'<span aria-label="已选">✓</span>':''}</li>`).join('');
    if(button)button.innerHTML=`${!missing?'已配齐 · 查看菜单':selected?`补齐其余 ${missing} 道`:'这一桌都想吃'} <span aria-hidden="true">→</span>`;
    if(note)note.textContent=selected?'保留套餐里已选的份数，只补还没选的。':'套餐独立计数，也可以在下面单独挑。';
    if(list)list.innerHTML=signatureSet.map(i=>{const d=byId.get(i.id),variantId=i.variantId||defaultVariant(d),other=state.lines.filter(l=>l.id===i.id&&l.variantId!==variantId);return `<div class="set-dish"><div><span class="set-name">${esc(i.label)}</span>${other.length?`<small>已另选：${esc(other.map(l=>lineName(l)).join('、'))}</small>`:''}</div>${stepper(d,variantId,true)}</div>`;}).join('');
  }
  function updateNavigation(){
    const available=new Set(availableCategories().map(c=>c.id)),scrollTop=$('categories').scrollTop;
    $('categories').innerHTML=categories.map(c=>{const qty=(c.id==='signature-set'?setDishes:dishes.filter(d=>d.categories.includes(c.id))).reduce((n,d)=>n+totalQuantity(d.id),0),count=c.id==='signature-set'?(available.has(c.id)?10:0):rowsForCategory(c.id).length;return `${c.id==='pork'?'<span class="nav-divider" aria-hidden="true"></span>':''}<button type="button" class="category-button nav-${esc(presentation.categories[c.id]?.navigation||'regular')} ${currentCategory===c.id?'active':''}" data-category="${esc(c.id)}" aria-controls="${c.id==='signature'?'featured-section':c.id==='signature-set'?'signature-set':'menu-category-'+c.id}" ${currentCategory===c.id?'aria-current="true"':''} ${available.has(c.id)?'':'disabled'}><span class="category-label">${esc(c.label)}</span><span class="category-number">${count}</span>${qty?`<span class="category-badge" aria-label="已选${qty}份">${qty}</span>`:''}</button>`;}).join('');
    $('categories').scrollTop=scrollTop;
    const pills=Object.entries(preferences).map(([id,label])=>`<button type="button" class="taste-pill ${state.preference===id?'active':''}" data-preference="${id}" aria-pressed="${state.preference===id}"><span class="taste-check" aria-hidden="true">✓</span><span>${label}</span></button>`).join('');
    $('taste-filters').innerHTML=pills;$('cart-preferences').innerHTML=pills;
  }
  function setActiveCategory(id){
    currentCategory=id;
    const nav=$('categories');
    for(const b of nav.querySelectorAll('[data-category]')){const active=b.dataset.category===id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');}
    const active=nav.querySelector(`[data-category="${id}"]`);
    if(active){const a=active.getBoundingClientRect(),r=nav.getBoundingClientRect();if(a.top<r.top)nav.scrollTop-=r.top-a.top+8;else if(a.bottom>r.bottom)nav.scrollTop+=a.bottom-r.bottom+8;}
  }
  function sectionFor(id){return $(id==='signature'?'featured-section':id==='signature-set'?'signature-set':'menu-category-'+id);}
  function jumpToCategory(id){
    const section=sectionFor(id);if(!section||section.hidden||!availableCategories().some(c=>c.id===id))return;
    section.querySelectorAll('.decor-image').forEach(img=>img.loading='eager');
    [...section.querySelectorAll('.food-image')].slice(0,4).forEach(img=>img.loading='eager');
    const top=section.getBoundingClientRect().top+window.scrollY-document.querySelector('.toolbar').offsetHeight-14;
    window.scrollTo({top:Math.max(0,top),behavior:'auto'});setActiveCategory(id);
    section.querySelector('h2')?.focus({preventScroll:true});
  }
  function syncActiveCategory(){
    scrollFrame=0;const sections=[...$('menu-main').querySelectorAll('[data-menu-section]')].filter(s=>!s.hidden);if(!sections.length)return;
    const line=document.querySelector('.toolbar').offsetHeight+50;
    let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=line)active=s;
    if(window.scrollY>0&&window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-5)active=sections[sections.length-1];
    if(active.dataset.menuSection!==currentCategory)setActiveCategory(active.dataset.menuSection);
  }
  function observeImages(){
    imageObserver?.disconnect();
    document.querySelectorAll('.decor-image').forEach(img=>{if(img.complete&&img.naturalWidth)imageReady(img);});
    if(!window.IntersectionObserver)return;
    imageObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.loading='eager';imageObserver.unobserve(entry.target);}},{rootMargin:'1200px 0px'});
    $('menu-main').querySelectorAll('.food-image[loading="lazy"], .decor-image[loading="lazy"]').forEach(img=>imageObserver.observe(img));
  }
  function updateSummary(){
    const c=counts();$('cart-title').textContent=c.dishes?`已选 ${c.dishes} 道`:'今天想吃点什么？';
    $('cart-subtitle').textContent=c.dishes?`共 ${c.portions} 份 · 查看已选`:'慢慢挑，选好后一键复制';
    $('cart-badge').textContent=c.portions;$('cart-badge').hidden=!c.portions;
    $('finish').disabled=!c.dishes;$('copy-menu').disabled=!c.dishes;
    $('sheet-count').textContent=c.dishes?`${c.dishes} 道菜 · 共 ${c.portions} 份`:'还没有选菜';$('clear-cart').disabled=!c.dishes;
    const balance={meat:0,veg:0,soup:0};for(const l of state.lines){const role=byId.get(l.id)?.role;if(Object.prototype.hasOwnProperty.call(balance,role))balance[role]+=l.quantity;}
    $('table-balance').hidden=c.dishes<3;
    $('table-balance').innerHTML=`<span>这一桌：荤菜 ${balance.meat} · 蔬菜 ${balance.veg} · 汤 ${balance.soup}</span>${!balance.soup?'<button type="button" data-suggest="soup">再看看汤 →</button>':!balance.veg?'<button type="button" data-suggest="vegetables">再看看青菜 →</button>':''}`;
  }
  function updateCards(){
    const focused=document.activeElement,dataset=focused?.dataset||{},root=focused?.closest('dialog')?.id||focused?.closest('[data-menu-section]')?.id||'menu-main';
    for(const card of $('menu-main').querySelectorAll('[data-dish]')){
      const d=byId.get(card.dataset.dish),qty=totalQuantity(d.id);card.classList.toggle('selected',!!qty);
      card.querySelector('.stepper').outerHTML=stepper(d);
      const picker=card.querySelector('.variant-picker');if(picker)picker.outerHTML=variantPicker(d);
      const description=card.querySelector('.dish-description');if(description)description.textContent=signatureCopy(d)||recommendationFor(d);
      const status=card.querySelector('.selection-status');if(status)status.textContent=qty?`已选 ${qty} 份`:d.tags.includes('hakka')?'客家风味':'';
    }
    updateSummary();updateNavigation();updateSet();if($('cart-dialog').open)renderCart();
    const attr=dataset.action?'action':dataset.choice?'choice':null;
    if(attr&&dataset.id){const selector=`[data-${attr}="${dataset[attr]}"][data-id="${dataset.id}"]${attr==='action'?`[data-variant="${dataset.variant||''}"]`:''}`;const target=$(root)?.querySelector(selector)||$(root)?.querySelector(`[data-action="plus"][data-id="${dataset.id}"]`);target?.focus({preventScroll:true});}
  }
  function validateQuantity(id,quantity,variantId){const d=byId.get(id);if(!d||!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('请选择有效菜品，份数为 0–99 的整数。');const v=variantId??defaultVariant(d);if(d.variants?.length?!variantFor(d,v):!!v)throw new Error('请选择有效做法。');return v;}
  function assignQuantity(id,quantity,variantId){const key=lineKey(id,variantId);const existing=state.lines.find(l=>lineKey(l.id,l.variantId)===key);if(!quantity)state.lines=state.lines.filter(l=>lineKey(l.id,l.variantId)!==key);else if(existing)existing.quantity=quantity;else state.lines.push({id,variantId,quantity});}
  function setQuantity(id,quantity,variantId){const v=validateQuantity(id,quantity,variantId);assignQuantity(id,quantity,v);persist();updateCards();}
  function addSet(){
    const missing=signatureSet.filter(i=>!totalQuantity(i.id));
    if(!missing.length){openCart();return;}
    const hadSelection=state.lines.length>0;
    for(const i of missing){const d=byId.get(i.id);assignQuantity(i.id,1,i.variantId||defaultVariant(d));}
    persist();updateCards();notify(hadSelection?`已补上 ${missing.length} 道，原来选的做法和份数保留。`:'招牌套餐已加入，选好的菜还可以自由增减。');
  }
  function cartFallbackCopy(d,line){
    const copy=variantFor(d,line.variantId)?.description||highlightFor(d)?.copy||d.recommendation||lineName(line,true);
    return Array.from(copy.split(/[，,。；;]/)[0].trim()).slice(0,6).join('');
  }
  function cartThumbMarkup(d,line){
    const photo=d.display!=='text'?photoFor(d):null,copy=cartFallbackCopy(d,line);
    const parts=photo?(photo.parts||[photo]):[];
    if(!parts.length)return `<div class="cart-thumb cart-thumb-text" aria-hidden="true"><span class="cart-thumb-fallback">${esc(copy)}</span></div>`;
    return `<div class="cart-thumb ${parts.length>1?'cart-thumb-pair':''}" aria-hidden="true">${parts.map(part=>{
      const size=part.srcset?part:(imageSizes[part.src]||{});
      const small=size.variants?.find(v=>v.width===320)?.src||(size.srcset||'').split(',').map(s=>s.trim()).find(s=>/\s320w$/.test(s))?.replace(/\s320w$/,'');
      return `<div class="cart-thumb-part"><span class="cart-thumb-fallback">${esc(Array.from(part.label||copy).slice(0,6).join(''))}</span>${part.src?`<img class="cart-thumb-image" src="${esc(part.src)}" ${small?`srcset="${esc(small)} 320w" sizes="80px"`:''} alt="" width="104" height="78" loading="lazy" decoding="async" style="object-position:${esc(part.position||'center')}">`:''}</div>`;
    }).join('')}</div>`;
  }
  function cartGroups(){
    const groups=categories.map(c=>({id:c.id,label:c.label,lines:[]})),previous={id:'previous',label:'之前选过',lines:[]};
    for(const line of state.lines){
      const d=byId.get(line.id);
      const category=activeIds.has(d.id)?categories.find(c=>d.scope==='seafood-set'?c.id==='signature-set':c.id!=='signature-set'&&d.categories?.includes(c.id)):null;
      (groups.find(g=>g.id===category?.id)||previous).lines.push(line);
    }
    return [...groups,previous].filter(group=>group.lines.length);
  }
  function cartPreviewItem(line){
    const d=byId.get(line.id),name=lineName(line,true);
    return `<article class="cart-item cart-preview-item" data-cart-line="${esc(lineKey(line.id,line.variantId))}">${cartThumbMarkup(d,line)}<div class="cart-item-name"><h4>${esc(name)}</h4>${!activeIds.has(d.id)?'<small>之前选过的菜，已为你保留</small>':d.fulfillment==='takeaway'?'<small>点外卖</small>':''}</div><div class="cart-preview-controls">${stepper(d,line.variantId,true)}</div><button type="button" class="remove-item" data-action="remove" data-id="${esc(d.id)}" data-variant="${esc(line.variantId)}" aria-label="移除${esc(name)}">×</button></article>`;
  }
  function cartGroupCount(group){return `${group.lines.length} 道 · ${group.lines.reduce((sum,line)=>sum+line.quantity,0)} 份`;}
  function renderCart(){
    const scrollBody=$('cart-dialog').querySelector('.sheet-body'),scrollTop=scrollBody?.scrollTop||0;
    const groups=cartGroups(),groupNodes=[...$('cart-items').querySelectorAll('.cart-menu-group')];
    // Keep thumbnails and their loading/fallback state when only quantities change.
    const quantitiesOnly=groups.length>0&&groups.length===groupNodes.length&&groups.every((group,index)=>{
      const node=groupNodes[index],items=[...node.querySelectorAll('[data-cart-line]')];
      return node.dataset.cartCategory===group.id&&node.querySelector('.cart-group-heading > span')&&items.length===group.lines.length&&items.every((item,i)=>item.dataset.cartLine===lineKey(group.lines[i].id,group.lines[i].variantId)&&item.querySelector('.cart-preview-controls'));
    });
    if(quantitiesOnly){
      groups.forEach((group,index)=>{
        const node=groupNodes[index];node.querySelector('.cart-group-heading > span').textContent=cartGroupCount(group);
        node.querySelectorAll('[data-cart-line]').forEach((item,i)=>{const line=group.lines[i];item.querySelector('.cart-preview-controls').innerHTML=stepper(byId.get(line.id),line.variantId,true);});
      });
    }else{
      $('cart-items').innerHTML=groups.length?groups.map(group=>`<section class="cart-menu-group" data-cart-category="${esc(group.id)}" aria-labelledby="cart-group-${esc(group.id)}"><div class="cart-group-heading"><h3 class="cart-group-title" id="cart-group-${esc(group.id)}">${esc(group.label)}</h3><span>${cartGroupCount(group)}</span></div><div class="cart-menu-grid">${group.lines.map(cartPreviewItem).join('')}</div></section>`).join(''):'<p class="cart-empty">先去挑几道喜欢的吧。</p>';
    }
    updateSummary();if(scrollBody)scrollBody.scrollTop=scrollTop;
  }
  function openDialog(id){const dialog=$(id);if(dialog.open)return;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.style.overflow='hidden';}
  function openCart(custom=false){renderCart();$('guest-notes').value=state.notes;$('custom-dish').value=state.custom;$('extra-details').open=custom||!!state.custom;openDialog('cart-dialog');if(custom)$('custom-dish').focus();}
  function menuText(){
    const c=counts();if(!c.dishes)return '';const lines=['剑锋家点菜单',`共 ${c.dishes} 道菜，${c.portions} 份`,''];
    state.lines.forEach((l,i)=>lines.push(`${i+1}. ${lineName(l,true)} × ${l.quantity}份`));
    if(state.custom.trim())lines.push(`${state.lines.length+1}. 菜单外想吃：${state.custom.trim()} × 1份`);
    if(state.preference!=='all')lines.push('',`口味偏好：${preferences[state.preference]}`);
    if(state.notes.trim())lines.push('',`口味与忌口：${state.notes.trim()}`);
    return lines.join('\n');
  }
  async function copyMenu(){const text=menuText();if(!text)return;try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);notify('已复制，可以粘贴到微信发给剑锋');}catch{$('copy-text').value=text;openDialog('copy-dialog');}}
  function resetFilters(){state.preference='all';persist();renderMenu();jumpToCategory('signature');}
  function selectionFeedback(id){
    const targets=[...document.querySelectorAll('[data-dish="'+id+'"]'),document.querySelector('.cart-bar')];
    targets.forEach(node=>node.classList.add('just-picked'));
    setTimeout(()=>targets.forEach(node=>node.classList.remove('just-picked')),460);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.action){const {id,variant=''}=button.dataset;const qty=quantity(id,variant);setQuantity(id,button.dataset.action==='plus'?qty+1:button.dataset.action==='minus'?Math.max(0,qty-1):0,variant);if(button.dataset.action==='plus')selectionFeedback(id);}
    if(button.dataset.choice){choices[button.dataset.id]=button.dataset.choice;updateCards();}
    if(button.dataset.category)jumpToCategory(button.dataset.category);
    if(button.dataset.preference){state.preference=button.dataset.preference;persist();renderMenu();if(!$('cart-dialog').open)jumpToCategory(currentCategory);}
    if(button.dataset.suggest){if(state.preference!=='all'){state.preference='all';persist();renderMenu();}jumpToCategory(button.dataset.suggest);}
    if(button.id==='add-signature-set')addSet();
    if(button.classList.contains('close-dialog')){const dialog=button.closest('dialog');if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');document.body.style.overflow='';}}
  });
  $('reset-filters').addEventListener('click',resetFilters);
  $('finish').addEventListener('click',()=>openCart());$('open-cart').addEventListener('click',()=>openCart());$('custom-request').addEventListener('click',()=>openCart(true));
  $('copy-menu').addEventListener('click',copyMenu);
  $('select-copy').addEventListener('click',()=>{$('copy-text').focus();$('copy-text').select();$('copy-text').setSelectionRange(0,$('copy-text').value.length);});
  $('clear-cart').addEventListener('click',()=>openDialog('confirm-dialog'));
  $('confirm-clear').addEventListener('click',()=>{state.lines=[];state.custom='';$('custom-dish').value='';persist();$('confirm-dialog').close();updateCards();});
  for(const [id,key,limit]of [['guest-notes','notes',20000],['custom-dish','custom',80]])$(id).addEventListener('input',event=>{state[key]=event.target.value.slice(0,limit);persist();updateSummary();});
  for(const dialog of document.querySelectorAll('dialog')){
    dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';if(dialog.contains($('toast')))document.body.append($('toast'));});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  $('open-sources').addEventListener('click',()=>{
    const seen=new Set();const sources=dishes.filter(d=>d.display!=='text'||signatureSet.some(i=>i.id===d.id)).flatMap(d=>{const photo=photoFor(d);return photo?(photo.parts||[photo]).map(img=>[d.name,img]):[];}).concat(images['海鲜套餐家宴']?[['海鲜套餐家宴',images['海鲜套餐家宴']]]:[]).filter(([,img])=>{if(seen.has(img.src))return false;seen.add(img.src);return true;});
    $('source-list').innerHTML='<p>图片为菜品示意，实际做法和摆盘以家里制作的为准。</p>'+sources.map(([name,img])=>`<article><h3>${esc(name)}</h3><p>${esc(img.author||'来源见原文')}${img.license&&img.license!=='unknown'?` · ${esc(img.license)}`:''}</p>${img.sourcePage?`<a href="${esc(img.sourcePage)}" target="_blank" rel="noopener noreferrer">查看原始来源</a>`:''}${img.licenseUrl?` · <a href="${esc(img.licenseUrl)}" target="_blank" rel="noopener noreferrer">使用许可</a>`:''}</article>`).join('')+'<article><h3>V10 三张食材构图精修</h3><p>家里招牌、鸡肉与蛋、鱼虾海鲜三张食材图由内置 ImageGen 重新生成，保留其他七张栏目图。麦穗短句和招牌标签由网页绘制。</p><a href="V10图片生成记录.json" target="_blank" rel="noopener noreferrer">查看 V10 提示词与生成记录</a></article><article><h3>V9 栏目食材图</h3><p>十张食材画面由内置 ImageGen 生成，栏目文字、暖金招牌标签和绿色卖点条由网页排版。门头继续使用家宴照片。</p><a href="V9图片生成记录.json" target="_blank" rel="noopener noreferrer">查看提示词与生成记录</a></article><article><h3>此前菜品图记录</h3><a href="V8图片生成记录.json" target="_blank" rel="noopener noreferrer">查看 V8 生成记录</a></article>';openDialog('sources-dialog');
  });
  function sizeToolbar(){document.documentElement.style.setProperty('--header',document.querySelector('.toolbar').offsetHeight+'px');}
  if(window.ResizeObserver)new ResizeObserver(sizeToolbar).observe(document.querySelector('.toolbar'));else window.addEventListener('resize',sizeToolbar);
  function imageReady(img){
    if(img.classList.contains('decor-image')){img.hidden=false;img.closest('.category-banner, .masthead')?.classList.toggle('art-ready',img.dataset.textIncluded==='true');}
  }
  document.addEventListener('load',event=>{if(event.target.tagName==='IMG')imageReady(event.target);},true);
  document.addEventListener('error',event=>{
    if(event.target.tagName!=='IMG')return;const img=event.target;
    if(img.classList.contains('decor-image')){img.hidden=true;img.closest('.category-banner, .masthead')?.classList.remove('art-ready');return;}
    if(img.getAttribute('srcset')&&!img.dataset.fallback){img.dataset.fallback='true';img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=img.getAttribute('src');return;}
    const card=img.closest('.dish-card');if(card){img.closest('.dish-photo')?.remove();card.classList.remove('photo-card');card.classList.add('text-card');}else img.hidden=true;
  },true);
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(syncActiveCategory);},{passive:true});
  window.addEventListener('resize',()=>{sizeToolbar();syncActiveCategory();});
  $('masthead-art').innerHTML=decorationMarkup(presentation.masthead,true,true);
  renderMenu();sizeToolbar();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* Defer storage notices until an edit. */}
  const context=document.modelContext;
  if(context?.registerTool){
    const definitions=[
      {name:'read_menu',title:'查看剑锋家菜单',description:'读取可选菜、做法和当前份数。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {dishes:dishes.map(d=>({...d,quantity:totalQuantity(d.id)})),counts:counts(),preference:state.preference,setTitle,setDishes:setDishes.map(d=>({...d,quantity:totalQuantity(d.id)}))};}},
      {name:'set_menu_quantities',title:'调整想吃的菜',description:'设置本浏览器的菜品与做法份数，0表示移除，不发送菜单。',inputSchema:{type:'object',properties:{items:{type:'array',items:{type:'object',properties:{id:{type:'string'},variantId:{type:'string'},quantity:{type:'integer',minimum:0,maximum:99}},required:['id','quantity'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false},execute({items}){const checked=items.map(i=>({...i,variantId:validateQuantity(i.id,i.quantity,i.variantId)}));for(const i of checked)assignQuantity(i.id,i.quantity,i.variantId);persist();updateCards();return {counts:counts(),text:menuText()};}},
      {name:'read_selected_menu',title:'读取点菜单文本',description:'返回当前点菜单，不发送给任何人。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {text:menuText(),counts:counts(),preference:state.preference,items:state.lines.map(l=>({...l,name:lineName(l)}))};}}
    ];
    for(const definition of definitions)try{context.registerTool(definition);}catch{/* Optional browser tools cannot interrupt the menu. */}
  }
})();
