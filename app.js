'use strict';
(() => {
  const {dishes,categories,signatureSet,featured} = window.MENU;
  const images = window.MENU_IMAGES || {};
  const byId = new Map(dishes.map(d=>[d.id,d]));
  const byCategory = new Map(categories.map(c=>[c.id,c]));
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tags = {mild:'清淡参考',spicy:'香辣参考',hakka:'客家风味'};
  const STORAGE_KEY='jianfeng-home-menu:v1';
  let currentCategory='all', currentTaste='all', search='';
  let state={version:2,items:{},notes:'',custom:'',bundle:false};
  let storageWarningShown=false,toastTimer;
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(saved && typeof saved==='object'){
      for(const [id,qty] of Object.entries(saved.items||{})) if(byId.has(id)&&Number.isInteger(qty)&&qty>0) state.items[id]=Math.min(99,qty);
      for(const [key,limit] of [['notes',20000],['custom',80]]) if(typeof saved[key]==='string')state[key]=saved[key].slice(0,limit);
      state.bundle=saved.bundle===true;
      // Fold legacy per-dish requests into the single dietary field once, without losing them.
      if(saved.version!==2){
        const legacy=Object.entries(saved.dishNotes||{}).filter(([id,note])=>state.items[id]&&byId.has(id)&&typeof note==='string'&&note.trim()).map(([id,note])=>{
          const text=state.bundle?note.replace(/(?:^|；)选鲈鱼(?=；|$)/g,'').replace(/^；|；$/g,''):note;
          return text.trim()?`${byId.get(id).name}：${text.trim().slice(0,160)}`:'';
        }).filter(Boolean);
        state.notes=[state.notes,...legacy].filter(Boolean).join('；').slice(0,20000);
      }
    }
  }catch{/* Invalid or unavailable storage starts a clean selection. */}
  function notify(message){
    $('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);
    // Place the toast in the top-layer dialog when one is open.
    const openDialogs=[...document.querySelectorAll('dialog[open]')];
    (openDialogs.at(-1)||document.body).append($('toast'));
    toastTimer=setTimeout(()=>{$('toast').hidden=true;document.body.append($('toast'));},3500);
  }
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{if(!storageWarningShown){notify('当前浏览器无法保存选择，请在离开前复制菜单。');storageWarningShown=true;}}}
  function counts(){const quantities=Object.values(state.items);const custom=state.custom.trim()?1:0;return {dishes:quantities.length+custom,portions:quantities.reduce((a,b)=>a+b,0)+custom};}
  function stepper(d){const qty=state.items[d.id]||0;return `<div class="stepper">${qty?`<button type="button" class="quantity-button minus" data-action="minus" data-id="${d.id}" aria-label="减少${esc(d.name)}">−</button><span class="quantity-value" aria-label="${esc(d.name)}已选${qty}份">${qty}</span>`:''}<button type="button" class="quantity-button plus" data-action="plus" data-id="${d.id}" aria-label="增加${esc(d.name)}" ${qty>=99?'disabled':''}>＋</button></div>`;}
  function dishPhoto(photo,name,index){
    if(!photo)return '';
    const parts=photo.parts||[photo];
    return `<figure class="dish-photo ${photo.parts?'dish-photo-pair':''}">${parts.map(part=>`<div class="photo-part"><img src="${esc(part.src)}" alt="${esc(part.label||name)}菜品示意" width="800" height="600" loading="${index<3?'eager':'lazy'}" decoding="async" style="object-position:${esc(part.position||'center')}">${photo.parts?`<span class="photo-part-label">${esc(part.label)}</span>`:''}</div>`).join('')}<figcaption class="image-label">${esc(photo.parts?'搭配示意':photo.caption||'菜品示意')}</figcaption></figure>`;
  }
  function visibleDishes(){
    return dishes.filter(d=>(currentCategory==='all'||d.categories.includes(currentCategory))&&(currentTaste==='all'||d.tags.includes(currentTaste))&&(!search||(d.name+' '+d.ingredients+' '+(signatureSet.find(item=>item.id===d.id)?.label||'')).toLowerCase().includes(search.toLowerCase())));
  }
  function card(d,index,feature=false){
    const photo=images[d.name];
    const signature=featured.includes(d.id);
    const descriptor=feature?({'酿蛋':'蛋香裹着馅，一口家乡味','卤水拼盘':'一盘卤香，慢慢吃、慢慢聊','豆豉蒸排骨':'豆豉咸香，最是下饭'}[d.name]):d.ingredients;
    return `<article class="dish-card ${feature?'featured-card':''} ${feature&&index===0?'feature-lead':''} ${photo?'':'text-only'} ${state.items[d.id]?'selected':''}" data-dish="${d.id}">${dishPhoto(photo,d.name,index)}<div class="dish-info">${feature?`<div class="dish-category"><span class="signature-label">家里招牌</span><span class="feature-number">0${index+1}</span></div>`:''}<h3>${esc(d.name)}</h3><p class="dish-description">${esc(descriptor)}</p><div class="dish-bottom"><div class="dish-tags">${(feature?[]:d.tags).map(t=>`<span class="dish-tag ${t==='spicy'?'spicy':''}">${tags[t]}</span>`).join('')}${!feature&&signature?'<span class="dish-tag signature-tag">招牌</span>':''}</div>${stepper(d)}</div></div></article>`;
  }
  function renderMenu(){
    const found=visibleDishes();
    const unfiltered=currentTaste==='all'&&!search;
    const home=currentCategory==='all'&&unfiltered;
    const featureView=currentCategory==='signature'&&unfiltered;
    const setView=currentCategory==='signature-set'&&unfiltered;
    $('featured-section').hidden=!(home||featureView);
    $('featured-list').innerHTML=home||featureView?featured.map((id,i)=>card(byId.get(id),i,true)).join(''):'';
    $('regular-menu').hidden=featureView||setView;
    $('section-title').textContent=search?'找到这些好菜':home?'家常菜单':currentCategory==='all'?tags[currentTaste]||'全部菜品':byCategory.get(currentCategory).label;
    $('section-kicker').textContent=home?'荤素搭配，随心挑':'喜欢的，就加一道';
    $('result-count').textContent=(home?dishes.filter(d=>!featured.includes(d.id)&&d.categories.some(id=>!['signature','signature-set'].includes(id))).length:found.length)+' 道可选';
    $('filter-hint').hidden=currentTaste==='all';
    $('filter-hint').textContent=currentTaste==='mild'?'清淡做法参考，口味和忌口在选好后一起写。':currentTaste==='spicy'?'香辣做法参考，辣度在选好后一起写。':'家乡风味，按你喜欢的口味来。';
    $('empty-state').hidden=found.length>0;
    if(home){
      const daily=categories.filter(c=>!['signature','signature-set'].includes(c.id));
      $('dish-list').innerHTML=daily.map(c=>{
        const rows=dishes.filter(d=>d.categories[0]===c.id&&!featured.includes(d.id));
        if(!rows.length)return '';
        return `<section class="dish-group" aria-labelledby="group-${c.id}"><div class="group-heading"><h3 id="group-${c.id}">${esc(c.label)}</h3><span>${rows.length} 道</span></div><div class="dish-grid">${rows.map((d,i)=>card(d,i+3)).join('')}</div></section>`;
      }).join('');
    }else $('dish-list').innerHTML=(featureView||setView)?'':`<div class="dish-grid">${found.map((d,i)=>card(d,i)).join('')}</div>`;
    updateNavigation();renderSet();
  }
  function renderSet(){
    const show=(currentCategory==='all'||currentCategory==='signature-set')&&currentTaste==='all'&&!search;
    $('signature-set').hidden=!show;if(!show)return;
    const complete=signatureSet.every(item=>state.items[item.id]>0);
    const photos=['椰子鸡汤','清蒸鱼','小龙虾'].map(name=>`<img src="${esc(images[name].src)}" alt="${esc(name)}菜品示意" loading="lazy" width="300" height="225">`).join('');
    const expanded=$('set-details')?.open||false;
    $('signature-set').innerHTML=`<div class="block-heading"><div><p class="section-kicker">一桌好菜，替你搭好了</p><h2>招牌套餐<span class="set-count">10 道</span></h2></div><span class="block-index" aria-hidden="true">02</span></div><div class="set-panel"><div class="set-photos">${photos}<span class="image-label">菜品示意</span></div><ol class="set-menu-preview">${signatureSet.map(item=>`<li>${esc(item.label)}</li>`).join('')}</ol><button type="button" id="add-signature-set" class="primary-button set-button">${complete?'已加入 · 查看菜单':'整套加入'} <span aria-hidden="true">→</span></button><details id="set-details" ${expanded?'open':''}><summary>也可以单独选 <span aria-hidden="true">＋</span></summary><div class="set-dishes">${signatureSet.map(item=>`<div class="set-dish"><span class="set-name">${esc(item.label)}</span>${stepper(byId.get(item.id))}</div>`).join('')}</div></details></div>`;
  }
  function addSet(){
    const alreadyComplete=signatureSet.every(item=>state.items[item.id]>0);
    state.bundle=true;
    for(const item of signatureSet)state.items[item.id]=Math.max(1,state.items[item.id]||0);
    persist();updateCards();if(alreadyComplete)openCart();else notify('招牌套餐已加入，可以继续挑或查看点菜单。');
  }
  function updateNavigation(){
    $('categories').innerHTML=[{id:'all',label:'全部',count:dishes.length},...['signature','signature-set'].map(id=>byCategory.get(id)),...categories.filter(c=>!['signature','signature-set'].includes(c.id))].map(c=>{
      const qty=dishes.filter(d=>c.id==='all'||d.categories.includes(c.id)).reduce((sum,d)=>sum+(state.items[d.id]||0),0);
      return `<button type="button" class="category-button ${currentCategory===c.id?'active':''}" data-category="${c.id}" ${currentCategory===c.id?'aria-current="true"':''}><span>${c.label}</span><span class="category-number">${c.count}</span>${qty?`<span class="category-badge" aria-label="已选${qty}份">${qty}</span>`:''}</button>`;
    }).join('');
    $('taste-filters').innerHTML=[['all','全部口味'],...Object.entries(tags)].map(([id,label])=>`<button type="button" class="taste-pill ${id===currentTaste?'active':''}" data-taste="${id}" aria-pressed="${id===currentTaste}">${id==='spicy'?'<span class="taste-symbol" aria-hidden="true">♨</span>':''}${label}</button>`).join('');
  }
  function updateSummary(){
    const c=counts();
    $('cart-title').textContent=c.dishes?`已选 ${c.dishes} 道菜`:'想吃什么，随心挑';
    $('cart-subtitle').textContent=c.dishes?`共 ${c.portions} 份 · 点这里查看`:'选好后，一键复制菜单';
    $('cart-badge').textContent=c.portions;$('cart-badge').hidden=!c.portions;
    $('finish').disabled=!c.dishes;$('copy-menu').disabled=!c.dishes;
    $('sheet-count').textContent=c.dishes?`${c.dishes} 道菜，共 ${c.portions} 份`:'还没有选菜';
    $('clear-cart').disabled=!c.dishes;
  }
  function updateCards(){
    const active=document.activeElement;const focusAction=active?.dataset.action;const focusId=active?.dataset.id;const focusDialog=active?.closest('dialog')?.id;const focusSet=!!active?.closest('#signature-set');const focusFeatured=!!active?.closest('#featured-list');
    for(const card of $('menu-main').querySelectorAll('[data-dish]')){const d=byId.get(card.dataset.dish);card.classList.toggle('selected',!!state.items[d.id]);card.querySelector('.stepper').outerHTML=stepper(d);}
    updateSummary();updateNavigation();renderSet();
    if($('cart-dialog').open)renderCart();
    if(focusAction&&focusId){const root=focusDialog?$(focusDialog):focusSet?$('signature-set'):focusFeatured?$('featured-list'):$('dish-list');const replacement=root.querySelector(`[data-action="${focusAction}"][data-id="${focusId}"]`)||root.querySelector(`[data-action="plus"][data-id="${focusId}"]`);replacement?.focus({preventScroll:true});}
  }
  function setQuantity(id,quantity){
    if(!byId.has(id)||!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('请选择有效菜品，份数需为 0–99 的整数。');
    if(quantity)state.items[id]=quantity;else delete state.items[id];
    persist();updateCards();
  }
  function orderedSelection(){const picked=dishes.filter(d=>state.items[d.id]);if(!state.bundle)return picked;const rank=id=>{const i=signatureSet.findIndex(item=>item.id===id);return i<0?100:i;};return picked.sort((a,b)=>rank(a.id)-rank(b.id));}
  function selectedName(d){return state.bundle?signatureSet.find(item=>item.id===d.id)?.label||d.name:d.name;}
  function renderCart(){
    const ordered=orderedSelection();
    $('cart-items').innerHTML=ordered.length?ordered.map((d,i)=>`<div class="cart-item"><div class="cart-item-main"><span class="cart-item-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(selectedName(d))}</h3>${stepper(d)}<button type="button" class="remove-item" data-action="remove" data-id="${d.id}" aria-label="移除${esc(d.name)}">移除</button></div></div>`).join(''):'<p class="cart-empty">还没有选菜，先去挑几道喜欢的吧。</p>';
    updateSummary();
  }
  function openDialog(id){const dialog=$(id);if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}}
  function openCart(custom=false){renderCart();$('guest-notes').value=state.notes;$('custom-dish').value=state.custom;$('extra-details').open=custom||!!state.custom;openDialog('cart-dialog');if(custom)setTimeout(()=>$('custom-dish').focus(),80);}
  function menuText(){
    const c=counts();if(!c.dishes)return '';
    const lines=['剑锋家点菜单',`共 ${c.dishes} 道菜，${c.portions} 份`,''];let index=1;
    for(const d of orderedSelection())lines.push(`${index++}. ${selectedName(d)} × ${state.items[d.id]}份`);
    if(state.custom.trim())lines.push(`${index}. 菜单外想吃：${state.custom.trim()} × 1份`);
    if(state.notes.trim())lines.push('',`口味与忌口：${state.notes.trim()}`);
    return lines.filter(x=>x!==null).join('\n');
  }
  async function copyMenu(){const text=menuText();if(!text)return;try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);notify('已复制，可以粘贴到微信发给剑锋');}catch{$('copy-text').value=text;openDialog('copy-dialog');}}
  function resetFilters(){currentCategory='all';currentTaste='all';search='';$('search').value='';renderMenu();scrollToMenu();}
  function scrollToMenu(){const toolbar=document.querySelector('.toolbar');const top=$('menu-main').getBoundingClientRect().top+window.scrollY-toolbar.offsetHeight;if(window.scrollY>top)window.scrollTo({top:Math.max(0,top),behavior:'instant'});}
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.action){const id=button.dataset.id,qty=state.items[id]||0;if(button.closest('#signature-set'))state.bundle=true;setQuantity(id,button.dataset.action==='plus'?qty+1:button.dataset.action==='minus'?Math.max(0,qty-1):0);}
    if(button.dataset.category){currentCategory=button.dataset.category;renderMenu();scrollToMenu();$('categories').querySelector(`[data-category="${currentCategory}"]`)?.focus({preventScroll:true});}
    if(button.dataset.taste){currentTaste=button.dataset.taste;renderMenu();scrollToMenu();$('taste-filters').querySelector(`[data-taste="${currentTaste}"]`)?.focus({preventScroll:true});}
    if(button.id==='add-signature-set')addSet();
    if(button.classList.contains('close-dialog'))button.closest('dialog').close();
  });
  $('search').addEventListener('input',event=>{search=event.target.value.trim();renderMenu();scrollToMenu();});
  $('reset-filters').addEventListener('click',resetFilters);
  $('finish').addEventListener('click',()=>openCart());$('open-cart').addEventListener('click',()=>openCart());$('custom-request').addEventListener('click',()=>openCart(true));
  $('copy-menu').addEventListener('click',copyMenu);
  $('select-copy').addEventListener('click',()=>{$('copy-text').focus();$('copy-text').select();$('copy-text').setSelectionRange(0,$('copy-text').value.length);});
  $('clear-cart').addEventListener('click',()=>openDialog('confirm-dialog'));
  $('confirm-clear').addEventListener('click',()=>{state.items={};state.custom='';state.bundle=false;$('custom-dish').value='';persist();$('confirm-dialog').close();updateCards();});
  for(const [id,key,limit] of [['guest-notes','notes',20000],['custom-dish','custom',80]])$(id).addEventListener('input',event=>{state[key]=event.target.value.slice(0,limit);persist();updateSummary();});
  for(const dialog of document.querySelectorAll('dialog')){
    dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';if(dialog.contains($('toast')))document.body.append($('toast'));});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  $('open-sources').addEventListener('click',()=>{
    const seen=new Set();const sources=Object.entries(images).flatMap(([name,photo])=>(photo.parts||[photo]).map(img=>[img.label?`${name} · ${img.label}`:name,img])).filter(([,img])=>{if(seen.has(img.src))return false;seen.add(img.src);return true;});
    $('source-list').innerHTML='<p>照片按菜名、主料与做法核对，仅作菜品示意。搭配菜分图展示，并标注对应菜名；实际摆盘以家里制作的为准。</p>'+sources.map(([name,img])=>`<article><h3>${esc(name)}</h3><p>${esc(img.author||'来源见原文')}${img.license&&img.license!=='unknown'?` · ${esc(img.license)}`:''}</p><p><a href="${esc(img.sourcePage)}" target="_blank" rel="noopener noreferrer">原始来源</a>${img.licenseUrl?` · <a href="${esc(img.licenseUrl)}" target="_blank" rel="noopener noreferrer">使用许可</a>`:''} · <a href="${esc(img.src)}" target="_blank" rel="noopener noreferrer">查看图片</a></p></article>`).join('');openDialog('sources-dialog');
  });
  function sizeToolbar(){document.documentElement.style.setProperty('--header',document.querySelector('.toolbar').offsetHeight+'px');}
  if(window.ResizeObserver)new ResizeObserver(sizeToolbar).observe(document.querySelector('.toolbar'));else window.addEventListener('resize',sizeToolbar);
  $('menu-main').addEventListener('error',event=>{
    if(event.target.tagName!=='IMG')return;
    const img=event.target;const card=img.closest('.dish-card');
    if(card){img.closest('.dish-photo')?.remove();card.classList.add('text-only');}
    else img.hidden=true;
  },true);
  renderMenu();updateSummary();sizeToolbar();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* Do not interrupt the initial view. */}
  // Optional structured browser tools share the visible interface's state and validation.
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const definitions=[
      {name:'read_menu',title:'查看剑锋家菜单',description:'读取菜品、分类、口味标签与当前已选数量。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){return {dishes:dishes.map(d=>({...d,quantity:state.items[d.id]||0})),counts:counts()};}},
      {name:'set_menu_quantities',title:'调整想吃的菜',description:'批量设置当前浏览器点菜单中的份数；数量 0 表示移除。不会发送菜单。',inputSchema:{type:'object',properties:{items:{type:'array',items:{type:'object',properties:{id:{type:'string'},quantity:{type:'integer',minimum:0,maximum:99}},required:['id','quantity'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Array.isArray(input.items)||input.items.length>dishes.length||input.items.some(item=>!item||!byId.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<0||item.quantity>99))throw new Error('无效菜品或份数');for(const item of input.items){if(item.quantity)state.items[item.id]=item.quantity;else delete state.items[item.id];}persist();updateCards();return {counts:counts(),items:{...state.items}};}},
      {name:'read_selected_menu',title:'读取点菜单文本',description:'返回当前点菜单文本供用户复制，不发送给任何人。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(){return {text:menuText(),counts:counts()};}}
    ];
    for(const tool of definitions)try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser support must not affect ordering. */}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
