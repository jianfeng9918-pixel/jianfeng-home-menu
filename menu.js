/* 菜名、分类与食材提示独立维护；同名菜只建立一个 ID。图片配置见 images.js。 */
(() => {
  const groups = [
    ['pork','猪肉类',[
      ['豆豉蒸排骨','排骨 · 豆豉'],['酸甜排骨','排骨 · 酸甜口味'],['排骨芋头煲','排骨 · 芋头'],['粉肠排骨煲','粉肠 · 排骨'],['香煎猪颈肉','猪颈肉 · 香煎'],['香煎五花肉','五花肉 · 香煎'],['酸菜炒生肠','酸菜 · 生肠'],['酸菜炒大肠','酸菜 · 大肠'],['卤各种肠','卤肠 · 想吃的部位可备注'],['猪肉炒青菜','猪肉 · 青菜'],['酿苦瓜、辣椒、豆腐','想选哪种酿菜，可在点菜单中备注'],['梅菜肉饼','梅菜 · 肉饼'],['凉拌猪肚','猪肚 · 凉拌'],['腊肉炒青菜','腊肉 · 青菜'],['猪脚煲','猪脚 · 煲制'],['猪脚醋煲','猪脚 · 醋香']
    ]],
    ['chicken','鸡肉类',[
      ['三杯鸡','鸡肉 · 三杯做法'],['白切鸡','鸡肉 · 白切'],['盐焗鸡','鸡肉 · 盐焗风味'],['沙姜鸡','鸡肉 · 沙姜'],['咖喱鸡','鸡肉 · 咖喱'],['辣子鸡','鸡肉 · 辣椒'],['茶树菇蒸鸡','鸡肉 · 茶树菇'],['香菇鸡煲','鸡肉 · 香菇'],['萝卜鸡煲','鸡肉 · 萝卜'],['鸡杂炒青菜','鸡杂 · 青菜'],['奥尔良烤鸡翅','鸡翅 · 奥尔良风味'],['蒸水蛋','鸡蛋 · 清蒸'],['酿蛋','鸡蛋 · 酿制'],['韭菜炒蛋','韭菜 · 鸡蛋']
    ]],
    ['beef','牛肉类',[
      ['姜葱炒牛肉','牛肉 · 姜葱'],['牛腩萝卜煲','牛腩 · 萝卜'],['黑椒牛仔骨','牛仔骨 · 黑椒'],['孜然炒牛肉','牛肉 · 孜然'],['牛肉丸','牛肉丸 · 做法可备注']
    ]],
    ['other','鸭鹅羊鱼类',[
      ['三杯鸭鹅','鸭 / 鹅 · 想吃哪种可备注'],['焖鸭鹅羊肉','鸭 / 鹅 / 羊肉 · 想吃哪种可备注'],['卤鸭鹅羊肉','鸭 / 鹅 / 羊肉 · 卤味'],['羊肉煲','羊肉 · 煲制'],['清蒸鱼','鲜鱼 · 清蒸'],['煎海鱼','海鱼 · 香煎']
    ]],
    ['seafood','海鲜类',[
      ['白灼虾','鲜虾 · 白灼'],['黄金虾（炸）','鲜虾 · 酥炸'],['蒜蓉开边虾','鲜虾 · 蒜蓉'],['蒜蓉扇贝','扇贝 · 蒜蓉'],['蒜蓉蒸鲍鱼','鲍鱼 · 蒜蓉'],['蒜蓉烤生蚝','生蚝 · 蒜蓉 · 烤制'],['高压锅生蚝','生蚝 · 压锅'],['清蒸生蚝','生蚝 · 清蒸'],['盐焗花螺','花螺 · 盐焗'],['白灼花螺','花螺 · 白灼'],['白灼鱿鱼','鱿鱼 · 白灼'],['姜葱炒鱿鱼','鱿鱼 · 姜葱'],['姜葱炒花甲','花甲 · 姜葱'],['姜葱炒田螺','田螺 · 姜葱'],['姜葱炒圣子皇','贝类 · 姜葱'],['姜葱炒蟹','螃蟹 · 姜葱'],['生蚝煎蛋','生蚝 · 鸡蛋'],['番茄鲍鱼煲','番茄 · 鲍鱼'],['鱿鱼蒸粉丝','鱿鱼 · 粉丝']
    ]],
    ['vegetables','青菜类',[
      ['苦瓜炒蛋','苦瓜 · 鸡蛋'],['炒腰果玉米','腰果 · 玉米'],['腐乳通心菜','通心菜 · 腐乳'],['蒜蓉炒青菜','青菜 · 蒜蓉'],['炒莴笋','莴笋 · 清炒'],['炒生菜','生菜 · 清炒'],['炒荷兰豆','荷兰豆 · 清炒'],['炒麦菜','麦菜 · 清炒'],['炒莲藕','莲藕 · 清炒'],['炒上海青','上海青 · 清炒'],['上汤菠菜','菠菜 · 上汤做法']
    ]],
    ['special','特色菜',[
      ['小龙虾','小龙虾 · 口味可备注'],['酸菜鱼','鲜鱼 · 酸菜'],['烧烤','想烤的食材，可在点菜单中备注'],['砂锅粥','砂锅慢煮 · 想加的食材可备注'],['东北一锅炖','一锅热乎菜 · 食材可备注'],['火锅','想吃的锅底和食材，可在点菜单中备注']
    ]],
    ['signature','招牌菜',[
      ['卤水拼盘','卤味拼盘 · 想吃的食材可备注'],['酿蛋','鸡蛋 · 酿制'],['腐乳通心菜','通心菜 · 腐乳'],['酸菜炒生肠','酸菜 · 生肠']
    ]],
    ['soup','汤',[
      ['椰子鸡汤','椰子 · 鸡肉'],['花旗参鸡汤','花旗参 · 鸡肉'],['猪肚鸡汤','猪肚 · 鸡肉'],['胡萝卜玉米排骨汤','胡萝卜 · 玉米 · 排骨'],['清蒸猪肉汤','猪肉 · 清蒸'],['莲藕排骨汤','莲藕 · 排骨'],['茶树菇汤','茶树菇 · 汤'],['红枣枸杞鸡汤','红枣 · 枸杞 · 鸡肉'],['老鸭冬瓜汤','老鸭 · 冬瓜'],['番茄蛋花汤','番茄 · 鸡蛋'],['紫菜肉丸汤','紫菜 · 肉丸'],['丝瓜汤','丝瓜 · 汤'],['枸杞汤','枸杞 · 汤']
    ]],
    ['sides','小菜',[
      ['凉拌鸡爪','鸡爪 · 凉拌'],['酸辣八爪鱼','八爪鱼 · 酸辣'],['凉拌青瓜','青瓜 · 凉拌'],['酸辣毛豆','毛豆 · 酸辣']
    ]]
  ];
  const mild = new Set(['白切鸡','蒸水蛋','茶树菇蒸鸡','清蒸鱼','白灼虾','清蒸生蚝','白灼花螺','白灼鱿鱼','炒莴笋','炒生菜','炒荷兰豆','炒麦菜','炒莲藕','炒上海青','蒜蓉炒青菜','上汤菠菜','椰子鸡汤','花旗参鸡汤','胡萝卜玉米排骨汤','清蒸猪肉汤','莲藕排骨汤','茶树菇汤','红枣枸杞鸡汤','老鸭冬瓜汤','番茄蛋花汤','紫菜肉丸汤','丝瓜汤','枸杞汤']);
  const spicy = new Set(['辣子鸡','酸辣八爪鱼','酸辣毛豆']);
  const hakka = new Set(['盐焗鸡','酿苦瓜、辣椒、豆腐','酿蛋','梅菜肉饼']);
  const dishes = [], byName = new Map();
  for(const [categoryId,,rows] of groups) for(const [name,ingredients] of rows){
    if(byName.has(name)){byName.get(name).categories.push(categoryId);continue;}
    const dish = {id:'dish-'+String(dishes.length+1).padStart(3,'0'),name,ingredients,categories:[categoryId],tags:[mild.has(name)?'mild':null,spicy.has(name)?'spicy':null,hakka.has(name)?'hakka':null].filter(Boolean)};
    dishes.push(dish);byName.set(name,dish);
  }
  // 招牌套餐中独立的搭配菜保留为一盘；不拆成两份。
  const additions=[
    ['dish-set-octopus-shrimp','凉拌八爪鱼虾','八爪鱼 · 鲜虾 · 凉拌'],
    ['dish-set-pickled-beans','酸豆角炒生肠','酸豆角 · 生肠'],
    ['dish-set-squid-snail','白灼鱿鱼+花螺','鱿鱼 · 花螺 · 白灼'],
    ['dish-set-stuffed-egg','酿蛋+苦瓜','鸡蛋 · 苦瓜 · 酿制']
  ];
  for(const [id,name,ingredients] of additions){const d={id,name,ingredients,categories:['signature-set'],tags:name.startsWith('白灼')?['mild']:name.startsWith('酿蛋')?['hakka']:[]};dishes.push(d);byName.set(name,d);}
  const signatureSet=[
    ['椰子鸡汤','椰子鸡汤'],['猪脚醋','猪脚醋煲'],['小龙虾','小龙虾'],['腐乳炒通心菜','腐乳通心菜'],['凉拌八爪鱼虾','凉拌八爪鱼虾'],['酸豆角炒生肠','酸豆角炒生肠'],['白灼鱿鱼+花螺','白灼鱿鱼+花螺'],['卤味拼盘','卤水拼盘'],['清蒸鲈鱼','清蒸鱼','选鲈鱼'],['酿蛋+苦瓜','酿蛋+苦瓜']
  ].map(([label,name,note])=>({label,id:byName.get(name).id,note:note||''}));
  for(const item of signatureSet){const d=byIdLocal(item.id);if(!d.categories.includes('signature-set'))d.categories.push('signature-set');}
  function byIdLocal(id){return dishes.find(d=>d.id===id);}
  const categoryList=groups.map(([id,label,rows])=>({id,label,count:rows.length}));
  categoryList.push({id:'signature-set',label:'招牌套餐',count:signatureSet.length});
  // Preserve IDs and earlier selections while updating the family's current signatures.
  const signatureNames=['酿蛋','卤水拼盘','豆豉蒸排骨'];
  for(const d of dishes){d.categories=d.categories.filter(id=>id!=='signature');if(signatureNames.includes(d.name))d.categories.push('signature');}
  const featured=signatureNames.map(name=>byName.get(name).id);
  for(const c of categoryList)c.count=dishes.filter(d=>d.categories.includes(c.id)).length;
  window.MENU = {categories:categoryList,dishes,signatureSet,featured};
})();
