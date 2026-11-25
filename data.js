/* 鲜知 FreshSense — 手机 App 数据模型
 * 剩余天数与新鲜度随食材数据一起保存，App 端直接展示。
 */

const LAYERS = ['冷藏室上层', '冷藏室中层', '冷藏室下层', '果蔬抽屉', '冷冻室'];

// 每层的展示元数据：图标、温度说明（供首页/食材库/弹窗统一使用）
const LAYER_META = {
  '冷藏室上层': { icon: '❄️', temp: '冷藏保鲜 · 2~6℃' },
  '冷藏室中层': { icon: '🧊', temp: '冷藏保鲜 · 2~6℃' },
  '冷藏室下层': { icon: '🫧', temp: '冷藏保鲜 · 0~4℃' },
  '果蔬抽屉':   { icon: '🥬', temp: '果蔬保湿 · 4~8℃' },
  '冷冻室':     { icon: '🧊', temp: '冷冻保存 · -18℃' },
  '冷藏室':     { icon: '❄️', temp: '冷藏保鲜 · 2~6℃' },
  '冷冻室上层': { icon: '🧊', temp: '冷冻保存 · -18℃ · 上层' },
  '冷冻室中层': { icon: '🧊', temp: '冷冻保存 · -18℃ · 中层' },
  '冷冻室下层': { icon: '🧊', temp: '冷冻保存 · -18℃ · 下层' }
};

// 不同冰箱型号的分区结构：用户可在「我的」里切换，或拍照识别
const FRIDGE_MODELS = [
  { key: 'standard', name: '常规双门', layers: ['冷藏室上层', '冷藏室中层', '冷藏室下层', '果蔬抽屉', '冷冻室'] },
  { key: 'french', name: '法式多门（冷冻双层）', layers: ['冷藏室上层', '冷藏室中层', '果蔬抽屉', '冷冻室上层', '冷冻室下层'] },
  { key: 'multi', name: '多门冰箱（冷冻三层）', layers: ['冷藏室上层', '冷藏室中层', '果蔬抽屉', '冷冻室上层', '冷冻室中层', '冷冻室下层'] },
  { key: 'side', name: '对开门', layers: ['冷藏室', '果蔬抽屉', '冷冻室'] }
];

const FRESHNESS = {
  green: { key: 'green', label: '新鲜', color: '#1DB954', soft: '#E8F7EE', note: '绿 = 新鲜' },
  yellow: { key: 'yellow', label: '还剩 2 天', color: '#F2B705', soft: '#FFF6DA', note: '黄 = 还剩 2 天' },
  red: { key: 'red', label: '还剩 1 天', color: '#E5484D', soft: '#FDECEC', note: '红 = 还剩 1 天 / 已过期' }
};

// 参考日：2025-06-06（演示数据中的剩余天数以此为准）
const TODAY = '2025-06-06';

const ITEMS = [
  { id: 'it-01', name: '鲜鸡蛋', icon: '🥚', photo: './assets/food/eggs.png', layer: '冷藏室中层', purchaseDate: '2025-06-01', expiryDate: '2025-06-10', remainingDays: 4, freshness: 'green', freshPct: 55, quantity: 6, unit: '枚', source: '手动录入' },
  { id: 'it-02', name: '全脂牛奶', icon: '🥛', photo: './assets/food/milk.png', layer: '冷藏室中层', purchaseDate: '2025-05-30', expiryDate: '2025-06-08', remainingDays: 2, freshness: 'yellow', freshPct: 38, quantity: 1, unit: '盒', source: 'NFC 碰一碰' },
  { id: 'it-03', name: '原味酸奶', icon: '🥣', photo: './assets/food/yogurt.png', layer: '冷藏室上层', purchaseDate: '2025-05-31', expiryDate: '2025-06-07', remainingDays: 1, freshness: 'red', freshPct: 18, quantity: 2, unit: '杯', source: '手动录入' },
  { id: 'it-04', name: '三文鱼', icon: '🐟', photo: './assets/food/salmon.png', layer: '冷藏室下层', purchaseDate: '2025-06-04', expiryDate: '2025-06-07', remainingDays: 1, freshness: 'red', freshPct: 15, quantity: 1, unit: '块', source: 'NFC 碰一碰' },
  { id: 'it-05', name: '西兰花', icon: '🥦', photo: './assets/food/broccoli.png', layer: '果蔬抽屉', purchaseDate: '2025-06-02', expiryDate: '2025-06-12', remainingDays: 6, freshness: 'green', freshPct: 78, quantity: 1, unit: '颗', source: '手动录入' },
  { id: 'it-06', name: '番茄', icon: '🍅', photo: './assets/food/tomato.png', layer: '果蔬抽屉', purchaseDate: '2025-06-03', expiryDate: '2025-06-08', remainingDays: 2, freshness: 'yellow', freshPct: 42, quantity: 4, unit: '个', source: '手动录入' },
  { id: 'it-07', name: '吐司面包', icon: '🍞', photo: './assets/food/bread.png', layer: '冷藏室上层', purchaseDate: '2025-06-05', expiryDate: '2025-06-13', remainingDays: 7, freshness: 'green', freshPct: 85, quantity: 1, unit: '袋', source: 'NFC 碰一碰' },
  { id: 'it-08', name: '豆腐', icon: '🧈', photo: './assets/food/tofu.png', layer: '冷藏室下层', purchaseDate: '2025-06-03', expiryDate: '2025-06-09', remainingDays: 3, freshness: 'green', freshPct: 60, quantity: 2, unit: '盒', source: '手动录入' },
  { id: 'it-09', name: '鸡胸肉', icon: '🍗', layer: '冷藏室下层', purchaseDate: '2025-06-05', expiryDate: '2025-06-07', remainingDays: 1, freshness: 'red', freshPct: 14, quantity: 1, unit: '块', source: 'NFC 碰一碰' },
  { id: 'it-10', name: '奶酪', icon: '🧀', layer: '冷藏室上层', purchaseDate: '2025-06-01', expiryDate: '2025-06-08', remainingDays: 2, freshness: 'yellow', freshPct: 40, quantity: 1, unit: '盒', source: '手动录入' },
  { id: 'it-11', name: '红苹果', icon: '🍎', layer: '果蔬抽屉', purchaseDate: '2025-06-02', expiryDate: '2025-06-15', remainingDays: 9, freshness: 'green', freshPct: 88, quantity: 5, unit: '个', source: '手动录入' },
  { id: 'it-12', name: '胡萝卜', icon: '🥕', layer: '果蔬抽屉', purchaseDate: '2025-06-04', expiryDate: '2025-06-11', remainingDays: 5, freshness: 'green', freshPct: 70, quantity: 3, unit: '根', source: '手动录入' },
  { id: 'it-13', name: '生菜', icon: '🥬', layer: '果蔬抽屉', purchaseDate: '2025-06-04', expiryDate: '2025-06-08', remainingDays: 2, freshness: 'yellow', freshPct: 42, quantity: 1, unit: '颗', source: '手动录入' },
  { id: 'it-14', name: '香肠', icon: '🌭', layer: '冷藏室中层', purchaseDate: '2025-06-02', expiryDate: '2025-06-08', remainingDays: 2, freshness: 'yellow', freshPct: 38, quantity: 2, unit: '根', source: '手动录入' },
  { id: 'it-15', name: '蓝莓', icon: '🫐', layer: '果蔬抽屉', purchaseDate: '2025-06-05', expiryDate: '2025-06-12', remainingDays: 6, freshness: 'green', freshPct: 76, quantity: 2, unit: '盒', source: 'NFC 碰一碰' },
  { id: 'it-16', name: '橙汁', icon: '🧃', layer: '冷藏室上层', purchaseDate: '2025-06-04', expiryDate: '2025-06-13', remainingDays: 7, freshness: 'green', freshPct: 82, quantity: 1, unit: '瓶', source: '手动录入' },
  { id: 'it-17', name: '速冻水饺', icon: '🥟', layer: '冷冻室', purchaseDate: '2025-05-20', expiryDate: '2025-08-20', remainingDays: 75, freshness: 'green', freshPct: 95, quantity: 1, unit: '袋', source: '手动录入' },
  { id: 'it-18', name: '冷冻西兰花', icon: '🥦', layer: '冷冻室', purchaseDate: '2025-05-25', expiryDate: '2025-08-25', remainingDays: 80, freshness: 'green', freshPct: 92, quantity: 1, unit: '袋', source: 'NFC 碰一碰' },
  { id: 'it-19', name: '冰淇淋', icon: '🍦', layer: '冷冻室', purchaseDate: '2025-06-01', expiryDate: '2025-09-01', remainingDays: 87, freshness: 'green', freshPct: 98, quantity: 2, unit: '盒', source: '手动录入' }
];

const ITEMS_INITIAL = ITEMS.map(x => ({ ...x }));

const RESTOCK_ITEMS = [
  { id: 'rs-01', name: '鲜鸡蛋', suggestQty: 6, unit: '枚', source: '手动', status: '待补' },
  { id: 'rs-02', name: '全脂牛奶', suggestQty: 1, unit: '盒', source: '快到期提醒', status: '待补' },
  { id: 'rs-03', name: '面条', suggestQty: 2, unit: '包', source: '食谱缺料', status: '待补' },
  { id: 'rs-04', name: '柠檬', suggestQty: 3, unit: '个', source: '食谱缺料', status: '待补' },
  { id: 'rs-05', name: '原味酸奶', suggestQty: 2, unit: '杯', source: '快到期提醒', status: '待补' }
];

const RECIPES = [
  { id: 'rc-01', name: '番茄炒蛋', emoji: '🍳', image: './assets/recipes/tomato-eggs.png?v=59', minutes: 15, thumb: 'linear-gradient(135deg,#FFB86B,#FF7A59)',
    ingredients: [
      { name: '鲜鸡蛋', have: true }, { name: '番茄', have: true }, { name: '葱', have: false }
    ],
    expiring: ['番茄'],
    steps: ['番茄切块、鸡蛋打散备用。', '热油炒蛋至凝固盛出。', '下番茄炒出汁，回锅鸡蛋调味即成。'],
    video: { title: '小高姐番茄炒蛋技巧', url: 'https://www.bilibili.com/video/BV1PW411T7YB', source: '哔哩哔哩' } },
  { id: 'rc-02', name: '香煎三文鱼', emoji: '🐟', image: './assets/recipes/salmon.png?v=59', minutes: 20, thumb: 'linear-gradient(135deg,#FF9A8B,#FF6A88)',
    ingredients: [
      { name: '三文鱼', have: true }, { name: '西兰花', have: true }, { name: '柠檬', have: false }
    ],
    expiring: ['三文鱼'],
    steps: ['三文鱼撒盐腌制 10 分钟。', '西兰花焯水备用。', '两面煎至金黄，挤柠檬汁装盘。'],
    video: { title: '一个技巧煎出酥脆香煎三文鱼', url: 'https://www.bilibili.com/video/BV1oS421R7T5', source: '哔哩哔哩' } },
  { id: 'rc-03', name: '豆腐蔬菜汤', emoji: '🍲', image: './assets/recipes/tofu-soup.png?v=59', minutes: 12, thumb: 'linear-gradient(135deg,#A8E063,#56AB2F)',
    ingredients: [
      { name: '豆腐', have: true }, { name: '番茄', have: true }, { name: '西兰花', have: true }
    ],
    expiring: ['番茄'],
    steps: ['食材切块备用。', '水开下豆腐与蔬菜。', '小火煮 8 分钟，加盐调味。'],
    video: { title: '家常番茄豆腐汤做法', url: 'https://www.bilibili.com/video/BV1cfaQz2ENA', source: '哔哩哔哩' } }
];

// 配菜菜品库：含菜名、常见食材与分类标签
// 用 tags 匹配「想吃什么」，ingredients 为应有食材，再与冰箱库存比对
const AI_DISHES = [
  { name: '番茄炒蛋', emoji: '🍳', minutes: 15, tags: ['番茄', '鸡蛋', '蛋', '西红柿', '家常'], ingredients: ['鲜鸡蛋', '番茄', '葱'] },
  { name: '香煎三文鱼', emoji: '🐟', minutes: 20, tags: ['三文鱼', '鱼', '海鲜', '煎'], ingredients: ['三文鱼', '西兰花', '柠檬'] },
  { name: '豆腐蔬菜汤', emoji: '🍲', minutes: 12, tags: ['豆腐', '汤', '蔬菜', '清淡'], ingredients: ['豆腐', '番茄', '西兰花'] },
  { name: '青椒土豆丝', emoji: '🥔', minutes: 12, tags: ['土豆', '青椒', '素菜', '家常'], ingredients: ['土豆', '青椒', '胡萝卜'] },
  { name: '可乐鸡翅', emoji: '🍗', minutes: 25, tags: ['鸡翅', '鸡肉', '鸡', '可乐', '荤'], ingredients: ['鸡翅', '可乐', '姜'] },
  { name: '蒜蓉西兰花', emoji: '🥦', minutes: 10, tags: ['西兰花', '花椰菜', '素菜', '蒜'], ingredients: ['西兰花', '蒜'] },
  { name: '牛奶炖蛋', emoji: '🥛', minutes: 18, tags: ['牛奶', '蛋', '甜品', '布丁'], ingredients: ['全脂牛奶', '鲜鸡蛋', '糖'] },
  { name: '酸奶水果杯', emoji: '🥣', minutes: 5, tags: ['酸奶', '水果', '甜品', '蓝莓', '早餐'], ingredients: ['原味酸奶', '红苹果', '蓝莓'] },
  { name: '胡萝卜炒蛋', emoji: '🥕', minutes: 12, tags: ['胡萝卜', '蛋', '鸡蛋', '家常'], ingredients: ['胡萝卜', '鲜鸡蛋', '葱'] },
  { name: '鸡蛋三明治', emoji: '🥪', minutes: 10, tags: ['吐司', '面包', '鸡蛋', '早餐', '三明治'], ingredients: ['吐司面包', '鲜鸡蛋', '生菜', '奶酪'] },
  { name: '香肠煎蛋', emoji: '🌭', minutes: 10, tags: ['香肠', '蛋', '鸡蛋', '早餐', '快手'], ingredients: ['香肠', '鲜鸡蛋'] },
  { name: '清炒时蔬', emoji: '🥬', minutes: 8, tags: ['生菜', '青菜', '蔬菜', '清淡', '素菜'], ingredients: ['生菜', '胡萝卜'] },
  { name: '橙汁奶昔', emoji: '🧃', minutes: 5, tags: ['橙汁', '奶昔', '饮品', '酸奶'], ingredients: ['橙汁', '原味酸奶'] },
  { name: '香煎鸡胸肉', emoji: '🍖', minutes: 20, tags: ['鸡胸肉', '鸡肉', '鸡', '健身', '减脂'], ingredients: ['鸡胸肉', '生菜', '柠檬'] },
  { name: '蓝莓酸奶奶昔', emoji: '🫐', minutes: 5, tags: ['蓝莓', '酸奶', '饮品', '甜品'], ingredients: ['蓝莓', '原味酸奶'] }
];

const DEVICE = {
  id: 'dev-01', name: '鲜知智能冰箱屏', model: 'FS-Screen 10.1',
  online: true, battery: 86, lastSync: '刚刚',
  nfcBound: true, firmware: 'v2.3.1', firmwareLatest: true,
  wifi: 'Home_5G'
};

// 商品 SKU → 食材名映射（App 内加购提醒用）
const PRODUCT_MAPPING = {
  'SKU-EGG-6': '鲜鸡蛋',
  'SKU-MILK-1L': '全脂牛奶',
  'SKU-NOODLE-2': '面条',
  'SKU-LEMON-3': '柠檬',
  'SKU-YOGURT-4': '原味酸奶',
  'SKU-SALMON-1': '三文鱼'
};

const PRODUCTS = [
  { sku: 'SKU-EGG-6', name: '谷饲鲜鸡蛋 6 枚装', emoji: '🥚', price: 12.9 },
  { sku: 'SKU-MILK-1L', name: '全脂鲜牛奶 1L', emoji: '🥛', price: 15.8 },
  { sku: 'SKU-NOODLE-2', name: '手擀面条 2 包', emoji: '🍜', price: 9.9 },
  { sku: 'SKU-LEMON-3', name: '新鲜柠檬 3 个', emoji: '🍋', price: 8.8 },
  { sku: 'SKU-YOGURT-4', name: '原味酸奶 4 杯', emoji: '🥣', price: 19.9 },
  { sku: 'SKU-SALMON-1', name: '挪威三文鱼 1 块', emoji: '🐟', price: 39.9 }
];

// 下单入库预置：SKU → 放入层 / 数量 / 单位 / 保质天数 / 新鲜度条
// 下单入库预置：App 下单时读取对应食材的存放位置与保质天数
const PURCHASE_PRESETS = {
  'SKU-EGG-6':    { layer: '冷藏室中层', qty: 6, unit: '枚', shelfDays: 10, freshPct: 100, icon: '🥚' },
  'SKU-MILK-1L':  { layer: '冷藏室中层', qty: 1, unit: '盒', shelfDays: 8,  freshPct: 100, icon: '🥛' },
  'SKU-NOODLE-2': { layer: '冷藏室上层', qty: 2, unit: '包', shelfDays: 30, freshPct: 100, icon: '🍜' },
  'SKU-LEMON-3':  { layer: '果蔬抽屉',   qty: 3, unit: '个', shelfDays: 12, freshPct: 100, icon: '🍋' },
  'SKU-YOGURT-4': { layer: '冷藏室上层', qty: 4, unit: '杯', shelfDays: 7,  freshPct: 100, icon: '🥣' },
  'SKU-SALMON-1': { layer: '冷藏室下层', qty: 1, unit: '块', shelfDays: 4,  freshPct: 100, icon: '🐟' }
};

// 根据下单 SKU 生成一条新入库食材
function purchaseToItem(sku) {
  const p = PURCHASE_PRESETS[sku];
  const name = PRODUCT_MAPPING[sku];
  const prod = PRODUCTS.find(x => x.sku === sku);
  if (!p || !name) return null;
  const exp = new Date(TODAY);
  exp.setDate(exp.getDate() + p.shelfDays);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return {
    id: 'it-' + Date.now() + '-' + sku, name, icon: p.icon,
    photo: prod && ITEMS.find(i => i.name === name && i.photo) ? ITEMS.find(i => i.name === name).photo : undefined,
    layer: p.layer, purchaseDate: TODAY, expiryDate: iso(exp),
    remainingDays: p.shelfDays, freshness: 'green', freshPct: p.freshPct,
    quantity: p.qty, unit: p.unit, source: 'App 下单'
  };
}

/* ---------- 手机 App 状态 ---------- */
const STATE = {
  appPage: 'home',         // nfc | home | fridge | recipes | recipe | restock | product | cart | device
  homeModule: 'expiry',    // 首页模块：expiry | zones | recipes（今日食谱）
  recipeId: 'rc-01',
  productSku: null,
  restock: RESTOCK_ITEMS.map(x => ({ ...x })),
  cart: [],                // { sku, name, qty, fromRestockId }
  checked: new Set(),      // 补货清单勾选状态
  device: { ...DEVICE },
  expiryDay: 3,            // 到期提醒筛选：0=已过期；1/2/3/7=N天内
  fridgeModel: 'standard', // 当前冰箱型号 key
  autoRestockAsked: false, // 自动补货提醒是否已询问
  aiDish: null,
  focusLayer: null
};

/* ---------- 手动/语音/拍照 添加食材：名称 → 图标/默认层 ---------- */
function iconForFood(name) {
  const map = {
    '鸡蛋':'🥚','鲜鸡蛋':'🥚','牛奶':'🥛','全脂牛奶':'🥛','酸奶':'🥣','原味酸奶':'🥣',
    '三文鱼':'🐟','鱼':'🐟','西兰花':'🥦','番茄':'🍅','西红柿':'🍅','面包':'🍞','吐司面包':'🍞',
    '豆腐':'🧈','鸡胸肉':'🍗','鸡肉':'🍗','奶酪':'🧀','苹果':'🍎','红苹果':'🍎','胡萝卜':'🥕',
    '生菜':'🥬','青菜':'🥬','香肠':'🌭','蓝莓':'🫐','橙汁':'🧃','柠檬':'🍋','土豆':'🥔','青椒':'🫑',
    '蒜':'🧄','葱':'🌿','鸡翅':'🍗','可乐':'🥤','糖':'🍬','姜':'🫚','米饭':'🍚','燕麦':'🌾',
    '速冻水饺':'🥟','水饺':'🥟','冷冻':'🧊','冰淇淋':'🍦','雪糕':'🍦','汤圆':'🍡'
  };
  return map[name] || '🥗';
}
function defaultLayerForFood(name) {
  if (/冻|冰|雪糕|冰淇淋|水饺|汤圆/.test(name)) return '冷冻室';
  if (/奶|酸奶|蛋|奶酪|吐司|面包|橙汁/.test(name)) return '冷藏室上层';
  if (/鱼|肉|鸡|豆腐|香肠/.test(name)) return '冷藏室下层';
  if (/番茄|苹果|胡萝卜|生菜|蓝莓|柠檬|西兰花|土豆|青椒|蒜|葱|姜/.test(name)) return '果蔬抽屉';
  return '冷藏室中层';
}

/* ---------- 重复购买判定 ---------- */
// 命中：商品映射食材在冰箱存在，且新鲜度=绿，且剩余≥2天
// 黄/红不提醒（反而引导补货）
function checkDuplicate(sku) {
  const name = PRODUCT_MAPPING[sku];
  if (!name) return null;
  const item = ITEMS.find(i => i.name === name);
  if (!item) return { hit: false, reason: 'none', name };
  if (item.freshness === 'green' && item.remainingDays >= 2) {
    return { hit: true, item, name, reason: 'fresh-enough' };
  }
  return { hit: false, item, name, reason: item.freshness, guideRestock: true };
}
