/* V7 display-only metadata. Stable menu IDs and order state stay in menu.js/app.js. */
const menuArt = id => ({
  src: `assets/banner-v7-${id}-w640.webp`,
  srcset: `assets/banner-v7-${id}-w320.webp 320w, assets/banner-v7-${id}-w640.webp 640w`,
  width: 640, height: 213
});
window.MENU_PRESENTATION = {
  version: 7,
  masthead: { ...menuArt('masthead'), src: 'assets/banner-v7-masthead-w1280.webp', srcset: 'assets/banner-v7-masthead-w320.webp 320w, assets/banner-v7-masthead-w640.webp 640w, assets/banner-v7-masthead-w1280.webp 1280w', width: 1280, height: 427 },
  badge: { src: 'assets/signature-seal-v6.webp', mobile: 44, compact: 36, desktop: 48, offset: 8 },
  categories: {
    signature: { art: menuArt('signature'), subtitle: '来家吃饭，先尝这几道', eyebrow: '家里的拿手味', navigation: 'signature' },
    'signature-set': { art: menuArt('signature-set'), subtitle: '一桌海鲜好菜，一次配齐', eyebrow: '海鲜当主角', navigation: 'banquet' },
    hakka: { art: menuArt('hakka'), subtitle: '一口家乡味，几道拿手菜', eyebrow: '熟悉的家乡味' },
    pork: { art: menuArt('pork'), subtitle: '新鲜买菜，又好吃又下饭', eyebrow: '添一碗饭吧' },
    chicken: { art: menuArt('chicken'), subtitle: '鲜嫩有滋味，家常也好吃', eyebrow: '家常好滋味' },
    beef: { art: menuArt('beef'), subtitle: '浓香或鲜嫩，挑个合口味', eyebrow: '越嚼越有味' },
    seafood: { art: menuArt('seafood'), subtitle: '清鲜到浓香，换着尝尝', eyebrow: '尝一口鲜' },
    vegetables: { art: menuArt('vegetables'), subtitle: '来点清爽，荤素刚刚好', eyebrow: '给餐桌添点绿' },
    soup: { art: menuArt('soup'), subtitle: '一碗热乎的，慢慢喝', eyebrow: '暖暖胃，也暖暖心' },
    night: { art: menuArt('night'), subtitle: '夜里再加点，边吃边聊', eyebrow: '好吃的，再来点' }
  },
  highlights: {
    'dish-029': { copy: '蛋香软嫩' },
    'dish-078': { copy: '卤香入味' },
    'dish-001': { copy: '豉香鲜嫩' },
    'dish-lu-goose': { copy: '酱香醇厚' },
    'dish-hakka-tofu': { copy: '软嫩入味' },
    'dish-hakka-pork-soup': { copy: '清鲜甘甜' },
    'dish-002': { copy: '酸甜开胃' },
    'dish-005': { copy: '焦香爽嫩' },
    'dish-char-siu': { copy: '甜香柔嫩' },
    'dish-019': { copy: '咸香紧实' },
    'dish-022': { copy: '香辣过瘾' },
    'dish-032': { copy: '软烂浓香' },
    'dish-040': { copy: '清鲜嫩滑' },
    'dish-042': { copy: '清甜弹嫩' },
    'dish-black-bean-fried-fish': { copy: '豉香酥口' },
    'dish-072': { copy: '鲜香惹味' },
    'dish-063': { copy: '咸香爽脆' },
    'dish-079': { copy: '清甜鲜香' },
    'dish-night-beef-shank': { copy: '卤香有嚼劲' },
    'dish-011': { copy: '酿出家常鲜' }
  }
};
