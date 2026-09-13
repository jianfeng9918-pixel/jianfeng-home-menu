'use strict';
(() => {
  const {dishes,categories,signatureSet,featured,archivedDishes=[]}=window.MENU;
  const images=window.MENU_IMAGES||{};
  const byId=new Map([...archivedDishes,...dishes].map(d=>[d.id,d]));
  const activeIds=new Set(dishes.map(d=>d.id));
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const preferences={all:'随心选',mild:'偏清淡',spicy:'偏麻辣',kids:'小孩爱吃'};
  const STORAGE_KEY='jianfeng-home-menu:v1';
  let state={version:4,lines:[],notes:'',custom:'',preference:'all'};
  let currentCategory='all',choices={},toastTimer,storageWarningShown=false;
  const variantFor=(d,id)=>d.variants?.find(v=>v.id===id);
  const defaultVariant=d=>d.defaultVariant||d.variants?.[0]?.id||'';
  const lineKey=(id,variantId='')=>id+'::'+variantId;
  const chosenVariant=d=>choices[d.id]||state.lines.find(l=>l.id===d.id)?.variantId||defaultVariant(d);
  const quantity=(id,variantId='')=>state.lines.find(l=>l.id===id&&l.variantId===variantId)?.quantity||0;
  const totalQuantity=id=>state.lines.filter(l=>l.id===id).reduce((n,l)=>n+l.quantity,0);
  function lineName(line){const d=byId.get(line.id);return variantFor(d,line.variantId)?.cartName||d.name;}
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
      if(!Array.isArray(saved.lines)&&saved.bundle&&signatureSet.every(i=>saved.items?.[i.id]>0))source=source.map(l=>({...l,variantId:signatureSet.find(i=>i.id===l.id)?.variantId}));
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
    return `<div class="stepper ${qty?'has-quantity':''}">${qty?`<button type="button" class="quantity-button minus" data-action="minus" ${attrs} aria-label="减少${esc(name)}">−</button><span class="quantity-value" aria-label="${esc(name)}已选${qty}份">${qty}</span><button type="button" class="quantity-button plus" data-action="plus" ${attrs} aria-label="增加${esc(name)}" ${qty>=99?'disabled':''}>＋</button>`:`<button type="button" class="add-dish ${compact?'compact':''}" data-action="plus" ${attrs} aria-label="增加${esc(name)}"><span aria-hidden="true">＋</span>加一道</button>`}</div>`;
  }
  function photoFor(d){return images[d.imageKey||d.name];}
  function dishPhoto(d,index=9){
    const photo=photoFor(d);if(!photo||d.display==='text')return '';
    const parts=photo.parts||[photo];
    return `<figure class="dish-photo ${photo.parts?'dish-photo-pair':''}">${parts.map(p=>`<div class="photo-part"><img src="${esc(p.src)}" alt="${esc(p.label||d.name)}示意图" width="800" height="600" loading="${index<2?'eager':'lazy'}" decoding="async" style="object-position:${esc(p.position||'center')}">${photo.parts?`<span class="photo-part-label">${esc(p.label)}</span>`:''}</div>`).join('')}${featured.includes(d.id)?'<img class="signature-badge" src="assets/signature-badge.png" alt="家里招牌" width="216" height="216">':''}<figcaption class="image-label">${esc(photo.parts?'搭配示意':photo.caption||(d.imageKey==='炒生菜'?'清炒示意':'菜品示意'))}</figcaption></figure>`;
  }
  function variantPicker(d){return d.variants?.length>1?`<div class="variant-picker" role="group" aria-label="${esc(d.name)}做法">${d.variants.map(v=>`<button type="button" data-choice="${esc(v.id)}" data-id="${esc(d.id)}" aria-pressed="${chosenVariant(d)===v.id}" class="variant-pill ${chosenVariant(d)===v.id?'active':''}">${esc(v.label)}</button>`).join('')}</div>`:'';}
  function card(d,index=9,feature=false){
    const photo=dishPhoto(d,index),qty=totalQuantity(d.id);
    const recommendation=variantFor(d,chosenVariant(d))?.description||d.recommendation||'';
    const chips=feature?'家里拿手':d.fulfillment==='takeaway'?'点外卖':d.tags.includes('hakka')?'客家风味':'';
    return `<article class="dish-card ${photo?'photo-card':'text-card'} ${feature?'featured-card':''} ${feature&&index===0?'feature-lead':''} ${qty?'selected':''}" data-dish="${esc(d.id)}">${photo}<div class="dish-info"><div class="dish-name-line"><h3>${esc(d.name)}</h3>${d.fulfillment==='takeaway'?'<span class="takeaway-label">外卖</span>':''}</div><p class="dish-description">${esc(recommendation)}</p>${variantPicker(d)}<div class="dish-bottom"><span class="selection-status">${qty?`已选 ${qty} 份`:`<span class="quiet-tag">${esc(chips)}</span>`}</span>${stepper(d)}</div></div></article>`;
  }
  function visibleDishes(){

    return dishes.filter(d=>(currentCategory==='all'||d.categories.includes(currentCategory))&&(state.preference==='all'||d.tags.includes(state.preference)));
  }
  function dishGroups(rows){
    const photo=rows.filter(d=>d.display!=='text'&&photoFor(d)),text=rows.filter(d=>d.display==='text'||!photoFor(d));
    return `${photo.length?`<div class="dish-grid">${photo.map((d,i)=>card(d,i+3)).join('')}</div>`:''}${text.length?`<div class="text-dishes">${text.map(d=>card(d)).join('')}</div>`:''}`;
  }
  function renderMenu(){
    const found=visibleDishes(),unfiltered=state.preference==='all',home=currentCategory==='all'&&unfiltered;
    const featuresOnly=currentCategory==='signature'&&unfiltered,setOnly=currentCategory==='signature-set'&&unfiltered;
    $('featured-section').hidden=!(home||featuresOnly);
    $('featured-list').innerHTML=home||featuresOnly?featured.map((id,i)=>card(byId.get(id),i,true)).join(''):'';
    $('regular-menu').hidden=featuresOnly||setOnly;
    $('section-title').textContent=home?'家常好菜':currentCategory==='all'?preferences[state.preference]:categories.find(c=>c.id===currentCategory)?.label||'家常好菜';
    $('section-kicker').textContent=home?'有荤有素，慢慢挑':'合口味的，加一道';
    $('result-count').textContent=(home?dishes.length-featured.length:found.length)+' 道可选';
    $('filter-hint').hidden=state.preference==='all';
    $('filter-hint').textContent=state.preference==='kids'?'先看看这些温和、软嫩或酸甜口味，具体要求选好后一起写。':`先看${preferences[state.preference]}的选择，具体口味和忌口选好后一起写。`;
    $('empty-state').hidden=found.length>0||featuresOnly||setOnly;
    if(home){
      const regular=categories.filter(c=>!['signature','signature-set','hakka'].includes(c.id));
      $('dish-list').innerHTML=regular.map(c=>{const rows=dishes.filter(d=>d.categories[0]===c.id&&!featured.includes(d.id));if(!rows.length)return '';return `<section class="dish-group" aria-labelledby="group-${esc(c.id)}"><div class="group-heading"><h3 id="group-${esc(c.id)}">${esc(c.label)}</h3><span>${rows.length} 道</span></div>${dishGroups(rows)}</section>`;}).join('');
    }else $('dish-list').innerHTML=featuresOnly||setOnly?'':dishGroups(found);
    renderSet();updateNavigation();updateSummary();
  }
  function renderSet(){
    const show=(currentCategory==='all'||currentCategory==='signature-set')&&state.preference==='all';
    $('signature-set').hidden=!show;if(!show)return;
    const missing=signatureSet.filter(i=>!totalQuantity(i.id)).length,selected=signatureSet.length-missing;
    const expanded=$('set-details')?.open||false;
    const preview=signatureSet.slice(0,3).map(i=>byId.get(i.id)).filter(d=>photoFor(d)?.src);
    $('signature-set').innerHTML=`<div class="block-heading"><div><p class="section-kicker">不用纠结，一桌配好了</p><h2>招牌套餐 <span class="set-count">10 道</span></h2></div><span class="block-index" aria-hidden="true">02</span></div><div class="set-panel"><div class="set-photos">${preview.map(d=>`<img src="${esc(photoFor(d).src)}" alt="${esc(d.name)}示意图" loading="lazy" width="300" height="225" style="object-position:${esc(photoFor(d).position||'center')}">`).join('')}<span class="image-label">菜品示意</span></div><ol class="set-menu-preview">${signatureSet.map(i=>`<li class="${totalQuantity(i.id)?'set-picked':''}">${esc(i.label)}${totalQuantity(i.id)?'<span aria-label="已选">✓</span>':''}</li>`).join('')}</ol><button type="button" id="add-signature-set" class="primary-button set-button">${!missing?'已配齐 · 查看菜单':selected?`补齐其余 ${missing} 道`:'这一桌都想吃'} <span aria-hidden="true">→</span></button><p class="set-note">${selected?'保留已选菜的做法和份数，只补还没选的。':'整套加入后，也可以自由增减。'}</p><details id="set-details" ${expanded?'open':''}><summary>也可以单独挑 <span aria-hidden="true">＋</span></summary><div class="set-dishes">${signatureSet.map(i=>{const d=byId.get(i.id),variantId=i.variantId||defaultVariant(d);const other=state.lines.filter(l=>l.id===i.id&&l.variantId!==variantId);return `<div class="set-dish"><div><span class="set-name">${esc(i.label)}</span>${other.length?`<small>已另选：${esc(other.map(l=>lineName(l)).join('、'))}</small>`:''}</div>${stepper(d,variantId,true)}</div>`;}).join('')}</div></details></div>`;
  }
  function updateNavigation(){
    const nav=[{id:'all',label:'全部菜品',count:dishes.length},...categories];
    $('categories').innerHTML=nav.map(c=>{const qty=dishes.filter(d=>c.id==='all'||d.categories.includes(c.id)).reduce((n,d)=>n+totalQuantity(d.id),0);return `${c.id==='pork'?'<span class="nav-divider" aria-hidden="true"></span>':''}<button type="button" class="category-button ${currentCategory===c.id?'active':''}" data-category="${esc(c.id)}" ${currentCategory===c.id?'aria-current="true"':''}><span>${esc(c.label)}</span><span class="category-number">${c.count}</span>${qty?`<span class="category-badge" aria-label="已选${qty}份">${qty}</span>`:''}</button>`;}).join('');
    const pills=Object.entries(preferences).map(([id,label])=>`<button type="button" class="taste-pill ${state.preference===id?'active':''}" data-preference="${id}" aria-pressed="${state.preference===id}">${label}</button>`).join('');
    $('taste-filters').innerHTML=pills;
    $('cart-preferences').innerHTML=pills;
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
    const focused=document.activeElement,dataset=focused?.dataset||{},root=focused?.closest('dialog')?.id|| (focused?.closest('#signature-set')?'signature-set':focused?.closest('#featured-list')?'featured-list':'dish-list');
    for(const card of $('menu-main').querySelectorAll('[data-dish]')){
      const d=byId.get(card.dataset.dish),qty=totalQuantity(d.id);card.classList.toggle('selected',!!qty);
      card.querySelector('.stepper').outerHTML=stepper(d);
      const status=card.querySelector('.selection-status');if(status)status.textContent=qty?`已选 ${qty} 份`:d.tags.includes('hakka')?'客家风味':'';
    }
    updateSummary();updateNavigation();renderSet();if($('cart-dialog').open)renderCart();
    if(dataset.action&&dataset.id){const target=$(root)?.querySelector(`[data-action="${dataset.action}"][data-id="${dataset.id}"][data-variant="${dataset.variant||''}"]`)||$(root)?.querySelector(`[data-action="plus"][data-id="${dataset.id}"]`);target?.focus({preventScroll:true});}
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
  function renderCart(){
    $('cart-items').innerHTML=state.lines.length?state.lines.map(l=>{const d=byId.get(l.id);return `<div class="cart-item"><div class="cart-item-main"><div class="cart-item-name"><h3>${esc(lineName(l))}</h3>${!activeIds.has(d.id)?'<small>之前选过的菜，已为你保留</small>':d.fulfillment==='takeaway'?'<small>点外卖</small>':''}</div>${stepper(d,l.variantId,true)}<button type="button" class="remove-item" data-action="remove" data-id="${esc(d.id)}" data-variant="${esc(l.variantId)}" aria-label="移除${esc(lineName(l))}">移除</button></div></div>`;}).join(''):'<p class="cart-empty">先去挑几道喜欢的吧。</p>';
    updateSummary();
  }
  function openDialog(id){const dialog=$(id);if(dialog.open)return;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');document.body.style.overflow='hidden';}
  function openCart(custom=false){renderCart();$('guest-notes').value=state.notes;$('custom-dish').value=state.custom;$('extra-details').open=custom||!!state.custom;openDialog('cart-dialog');if(custom)$('custom-dish').focus();}
  function menuText(){
    const c=counts();if(!c.dishes)return '';const lines=['剑锋家点菜单',`共 ${c.dishes} 道菜，${c.portions} 份`,''];
    state.lines.forEach((l,i)=>lines.push(`${i+1}. ${lineName(l)} × ${l.quantity}份`));
    if(state.custom.trim())lines.push(`${state.lines.length+1}. 菜单外想吃：${state.custom.trim()} × 1份`);
    if(state.preference!=='all')lines.push('',`口味偏好：${preferences[state.preference]}`);
    if(state.notes.trim())lines.push('',`口味与忌口：${state.notes.trim()}`);
    return lines.join('\n');
  }
  async function copyMenu(){const text=menuText();if(!text)return;try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);notify('已复制，可以粘贴到微信发给剑锋');}catch{$('copy-text').value=text;openDialog('copy-dialog');}}
  function scrollToMenu(){const top=$('menu-main').getBoundingClientRect().top+window.scrollY-document.querySelector('.toolbar').offsetHeight;if(window.scrollY>top)window.scrollTo({top:Math.max(0,top),behavior:'auto'});}
  function resetFilters(){currentCategory='all';state.preference='all';persist();renderMenu();scrollToMenu();}
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.action){const {id,variant=''}=button.dataset;const qty=quantity(id,variant);setQuantity(id,button.dataset.action==='plus'?qty+1:button.dataset.action==='minus'?Math.max(0,qty-1):0,variant);}
    if(button.dataset.choice){choices[button.dataset.id]=button.dataset.choice;renderMenu();const root=button.closest('#featured-list')?$('featured-list'):$('dish-list');root.querySelector(`[data-id="${button.dataset.id}"][data-choice="${button.dataset.choice}"]`)?.focus({preventScroll:true});}
    if(button.dataset.category){currentCategory=button.dataset.category;renderMenu();scrollToMenu();$('categories').querySelector(`[data-category="${currentCategory}"]`)?.focus({preventScroll:true});}
    if(button.dataset.preference){state.preference=button.dataset.preference;persist();renderMenu();if(!$('cart-dialog').open)scrollToMenu();}
    if(button.dataset.suggest){currentCategory=button.dataset.suggest;state.preference='all';persist();renderMenu();scrollToMenu();}
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
    const seen=new Set();const sources=dishes.filter(d=>d.display!=='text'||signatureSet.some(i=>i.id===d.id)).flatMap(d=>{const photo=photoFor(d);return photo?(photo.parts||[photo]).map(img=>[d.name,img]):[];}).filter(([,img])=>{if(seen.has(img.src))return false;seen.add(img.src);return true;});
    $('source-list').innerHTML='<p>图片为菜品示意，实际做法和摆盘以家里制作的为准。</p>'+sources.map(([name,img])=>`<article><h3>${esc(name)}</h3><p>${esc(img.author||'来源见原文')}${img.license&&img.license!=='unknown'?` · ${esc(img.license)}`:''}</p><a href="${esc(img.sourcePage)}" target="_blank" rel="noopener noreferrer">查看原始来源</a>${img.licenseUrl?` · <a href="${esc(img.licenseUrl)}" target="_blank" rel="noopener noreferrer">使用许可</a>`:''}</article>`).join('');openDialog('sources-dialog');
  });
  function sizeToolbar(){document.documentElement.style.setProperty('--header',document.querySelector('.toolbar').offsetHeight+'px');}
  if(window.ResizeObserver)new ResizeObserver(sizeToolbar).observe(document.querySelector('.toolbar'));else window.addEventListener('resize',sizeToolbar);
  $('menu-main').addEventListener('error',event=>{if(event.target.tagName!=='IMG')return;const img=event.target,card=img.closest('.dish-card');if(card){img.closest('.dish-photo')?.remove();card.classList.remove('photo-card');card.classList.add('text-card');}else img.hidden=true;},true);
  renderMenu();sizeToolbar();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* Defer storage notices until an edit. */}
  const context=document.modelContext;
  if(context?.registerTool){
    const definitions=[
      {name:'read_menu',title:'查看剑锋家菜单',description:'读取可选菜、做法和当前份数。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {dishes:dishes.map(d=>({...d,quantity:totalQuantity(d.id)})),counts:counts(),preference:state.preference};}},
      {name:'set_menu_quantities',title:'调整想吃的菜',description:'设置本浏览器的菜品与做法份数，0表示移除，不发送菜单。',inputSchema:{type:'object',properties:{items:{type:'array',items:{type:'object',properties:{id:{type:'string'},variantId:{type:'string'},quantity:{type:'integer',minimum:0,maximum:99}},required:['id','quantity'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false},execute({items}){const checked=items.map(i=>({...i,variantId:validateQuantity(i.id,i.quantity,i.variantId)}));for(const i of checked)assignQuantity(i.id,i.quantity,i.variantId);persist();updateCards();return {counts:counts(),text:menuText()};}},
      {name:'read_selected_menu',title:'读取点菜单文本',description:'返回当前点菜单，不发送给任何人。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {text:menuText(),counts:counts(),preference:state.preference,items:state.lines.map(l=>({...l,name:lineName(l)}))};}}
    ];
    for(const definition of definitions)try{context.registerTool(definition);}catch{/* Optional browser tools cannot interrupt the menu. */}
  }
})();
