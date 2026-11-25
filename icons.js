/* 鲜知 FreshSense · 专属写实风格小图标 */
(function () {
  const ICON = {
    egg: `<ellipse cx="16" cy="17" rx="8" ry="11" fill="#F7DFAE" stroke="#B98F52" stroke-width="1.6"/><path d="M10 15c1-4 3-6 6-7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".9"/><path d="M12 23c2 2 6 2 8 0" stroke="#D7B87E" stroke-width="1.2" fill="none"/>`,
    milk: `<path d="M10 9h12v18H10z" fill="#F9FDFF" stroke="#5B93B8" stroke-width="1.6"/><path d="M10 9l6-5 6 5" fill="#E4F1F8" stroke="#5B93B8" stroke-width="1.6"/><rect x="10" y="14" width="12" height="7" fill="#3E86D6"/><path d="M12 17.5h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M12 5h8" stroke="#5B93B8" stroke-width="1.6" stroke-linecap="round"/>`,
    yogurt: `<path d="M9 11h14l-2 15H11z" fill="#FFFDFB" stroke="#7FA88F" stroke-width="1.6"/><ellipse cx="16" cy="11" rx="7" ry="3" fill="#EAF4EE" stroke="#7FA88F" stroke-width="1.6"/><path d="M12 12c2 2 6 2 8 0" stroke="#B9D2C1" stroke-width="1.4" fill="none"/><circle cx="13" cy="18" r="1.4" fill="#D9607E"/><circle cx="19" cy="20" r="1.2" fill="#D9607E"/>`,
    bread: `<path d="M7 13c0-4 4-6 9-6s9 2 9 6v12H7z" fill="#D99A50" stroke="#9A6028" stroke-width="1.6"/><path d="M10 14c0-2.6 3-4.2 6-4.2s6 1.6 6 4.2v8H10z" fill="#F4D39A"/><path d="M11 18h10" stroke="#D1A367" stroke-width="1.4" stroke-linecap="round"/>`,
    salmon: `<path d="M5 20c4-8 12-11 22-9l-2 8c-7-1-13 1-18 5z" fill="#F08052" stroke="#B95B38" stroke-width="1.6"/><path d="M7 21c5-4 11-6 17-6M10 23.5c4-2.5 9-4 13-4" stroke="#FFE3D2" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M5 23c3-1 5-1 7 0" stroke="#8C4F3B" stroke-width="2.4" stroke-linecap="round"/><path d="M9 18c4-4 9-6 15-6" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"/>`,
    tofu: `<path d="M7 12l12-4 7 4-12 5z" fill="#FFFDF6" stroke="#A9A692" stroke-width="1.6"/><path d="M7 12v10l7 4V17z" fill="#F1EEE1" stroke="#A9A692" stroke-width="1.6"/><path d="M14 17l12-5v10l-12 4z" fill="#FFFEFB" stroke="#A9A692" stroke-width="1.6"/><path d="M10 15l4.5-1.6" stroke="#D9D4C3" stroke-width="1.2" stroke-linecap="round"/>`,
    chicken: `<path d="M8 20c-1-6 3-11 9-11 5 0 8 4 7 9-1 4-5 6-9 6-4 0-6-1-7-4z" fill="#F2C0A8" stroke="#C98E73" stroke-width="1.6"/><path d="M13 12c2 3 2 7 0 10M19 13c-1 3-1 6 1 8" stroke="#DFA78F" stroke-width="1.6" fill="none"/><path d="M10 14c1-2 3-3 5-3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"/>`,
    broccoli: `<path d="M11 28V16M16 28V14M21 28V17" stroke="#5E9C48" stroke-width="4.5" stroke-linecap="round"/><circle cx="10" cy="11" r="4.6" fill="#3F8C3B" stroke="#2E6B2C" stroke-width="1.2"/><circle cx="17" cy="9" r="5.2" fill="#59A84A" stroke="#2E6B2C" stroke-width="1.2"/><circle cx="23" cy="12" r="4.4" fill="#408D3A" stroke="#2E6B2C" stroke-width="1.2"/><path d="M11 18h10v10H11z" fill="#9CCB72" stroke="#5E9C48" stroke-width="1.2"/>`,
    frozenBroccoli: `<path d="M11 28V16M16 28V14M21 28V17" stroke="#6FA9C9" stroke-width="4.5" stroke-linecap="round"/><circle cx="10" cy="11" r="4.6" fill="#3F8C3B" stroke="#2E6B2C" stroke-width="1.2"/><circle cx="17" cy="9" r="5.2" fill="#59A84A" stroke="#2E6B2C" stroke-width="1.2"/><circle cx="23" cy="12" r="4.4" fill="#408D3A" stroke="#2E6B2C" stroke-width="1.2"/><path d="M26 21v7M22.5 24.5h7M23.5 22l5 5M28.5 22l-5 5" stroke="#6CB6F0" stroke-width="1.8" stroke-linecap="round"/>`,
    tomato: `<circle cx="16" cy="18" r="9.5" fill="#E84045" stroke="#B92E33" stroke-width="1.6"/><path d="M10 14c2-3 4-4 6-4" stroke="#FF9A9E" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/><path d="M16 10l-5-3 3 4-4 1 5 1 1 4 1-4 5-1-4-1 3-4z" fill="#3F8C3B" stroke="#2E6B2C" stroke-width="1"/>`,
    apple: `<path d="M16 11c-4-3-10 0-10 7 0 6 4 10 8 9 1 0 2 0 3 0 4 1 8-3 8-9 0-7-6-10-9-7z" fill="#E84045" stroke="#B92E33" stroke-width="1.6"/><path d="M16 11c0-3 1-5 3-6" stroke="#7A5A34" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M18.5 6c2-2 5-2 6.5 0-2 2-4.5 2-6.5 0z" fill="#3F8C3B" stroke="#2E6B2C" stroke-width="1"/><path d="M10 15c1-2 3-3 4-3" stroke="#FF9A9E" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/>`,
    carrot: `<path d="M11 12l10 12-4 3L8 15z" fill="#EF8A3C" stroke="#B86224" stroke-width="1.6"/><path d="M11 12c-2-3-1-6 1-7 1 3 2 5 1 7zM14 11c0-4 2-6 4-6-1 3-1 5-2 7z" fill="#3F8C3B" stroke="#2E6B2C" stroke-width="1"/><path d="M12 17l4 4M15 20l3 3" stroke="#B86224" stroke-width="1.4" stroke-linecap="round"/>`,
    lettuce: `<path d="M7 18c0-7 4-11 9-11s9 4 9 11c0 5-4 8-9 8s-9-3-9-8z" fill="#83C45F" stroke="#4F8E3B" stroke-width="1.6"/><path d="M16 8v17M10 13c3 2 4 5 4 9M22 13c-3 2-4 5-4 9" stroke="#4F8E3B" stroke-width="1.6" fill="none"/><path d="M10 12c2-2 4-3 6-3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`,
    blueberry: `<circle cx="10" cy="20" r="5.2" fill="#4358A8" stroke="#2B3B78" stroke-width="1.3"/><circle cx="22" cy="19" r="5.6" fill="#5B70BD" stroke="#2B3B78" stroke-width="1.3"/><circle cx="16" cy="12" r="5.4" fill="#3A4E9C" stroke="#2B3B78" stroke-width="1.3"/><path d="M13.5 10l2.5-2.5 2.5 2.5M19 7.5l2-2 2 2M8 18l2-2 2 2" stroke="#263467" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
    lemon: `<ellipse cx="16" cy="18" rx="9.5" ry="6.8" fill="#F4C542" stroke="#C99A1E" stroke-width="1.6"/><path d="M8 17c1-2 2-3 3-3M24 17c-1-2-2-3-3-3" stroke="#FFF0A8" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M16 12c-1-2 0-4 2-4" stroke="#3F8C3B" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
    dumpling: `<path d="M6 20c0-6 5-10 10-10s10 4 10 10-5 7-10 7-10-1-10-7z" fill="#F7F2E6" stroke="#C9BDA2" stroke-width="1.6"/><path d="M8 18c3-3 5-3 8 0 3-3 5-3 8 0" stroke="#C9BDA2" stroke-width="1.6" fill="none"/><path d="M10 22c4 2 8 2 12 0" stroke="#E3DAC4" stroke-width="1.4" fill="none"/>`,
    icecream: `<path d="M10 14h12l-2 13h-8z" fill="#DEA85F" stroke="#A86E2E" stroke-width="1.6"/><path d="M9 14c0-4.5 3-7 7-7s7 2.5 7 7z" fill="#F8EAD5" stroke="#C9AC83" stroke-width="1.6"/><path d="M12 12c2-2 5-2 7 0" stroke="#EF7B45" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M12 19h8" stroke="#fff" stroke-width="1.6" opacity=".7"/>`,
    cheese: `<path d="M6 22l14-10 6 8-14 6z" fill="#F2B705" stroke="#BF8A00" stroke-width="1.6"/><path d="M6 22v3l6 1v-3z" fill="#D69A00"/><circle cx="13" cy="20" r="2" fill="#BF8A00"/><circle cx="18.5" cy="18" r="1.4" fill="#BF8A00"/><circle cx="20" cy="22" r="1.2" fill="#BF8A00"/>`,
    sausage: `<path d="M8 20c0-4 3-6 6-5 2-3 6-3 8 0 4-1 7 2 6 6-1 4-5 5-8 4-3 2-7 1-9-2-2 0-3-1-3-3z" fill="#D97A50" stroke="#A8502E" stroke-width="1.6"/><path d="M10 19c3 1 5 1 7 0M18 22c2 1 4 0 5-1" stroke="#F2B08C" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
    juice: `<path d="M11 9h10v18H11z" fill="#F5A623" stroke="#C97A0E" stroke-width="1.6"/><path d="M11 9l5-5 5 5" fill="#F7C15A" stroke="#C97A0E" stroke-width="1.6"/><rect x="12" y="14" width="8" height="8" rx="1" fill="#FFF3D6"/><path d="M14 18c1-2 3-2 4 0" stroke="#DE8415" stroke-width="1.8" fill="none"/>`,
    potato: `<ellipse cx="16" cy="18" rx="10" ry="7" fill="#C99A5B" stroke="#9A6E38" stroke-width="1.6" transform="rotate(-18 16 18)"/><circle cx="12" cy="16" r="1" fill="#9A6E38"/><circle cx="19" cy="20" r=".9" fill="#9A6E38"/><path d="M10 14c2-2 4-3 6-3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".55"/>`,
    pepper: `<path d="M12 12c0-3 2-5 4-5s4 2 4 5l4 6c-2 7-12 7-16 0z" fill="#4C9E42" stroke="#2F6E2A" stroke-width="1.6"/><path d="M16 8V5" stroke="#2F6E2A" stroke-width="2.4" stroke-linecap="round"/><path d="M11 15c2-2 4-2 5 0" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`,
    garlic: `<path d="M16 8c5 3 7 8 5 13-2 5-8 5-10 0-2-5 0-10 5-13z" fill="#FFFDF4" stroke="#C8C2AC" stroke-width="1.6"/><path d="M16 9v13M12 13c1 3 1 6 0 8M20 13c-1 3-1 6 0 8" stroke="#C8C2AC" stroke-width="1.4" fill="none"/>`,
    scallion: `<path d="M12 27c0-9 1-16 4-22M20 27c0-9-1-16-4-22" stroke="#4E9A45" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M13 24h6" stroke="#2F6E2A" stroke-width="2.4" stroke-linecap="round"/>`,
    ginger: `<path d="M8 18c1-5 5-8 9-7 3 1 3 4 6 5 3 1 3 5-1 7-4 2-8 0-11 1-3 1-4-2-3-6z" fill="#D9B36A" stroke="#A8843E" stroke-width="1.6"/><path d="M11 16c2 1 3 3 3 6M18 15c-1 3 0 6 2 8" stroke="#A8843E" stroke-width="1.4" fill="none"/>`,
    cola: `<path d="M11 10h10v17H11z" fill="#E84045" stroke="#B92E33" stroke-width="1.6"/><path d="M11 10l5-5 5 5" fill="#F07B7F" stroke="#B92E33" stroke-width="1.6"/><rect x="12" y="15" width="8" height="5" fill="#fff"/><path d="M14 17.5h4" stroke="#E84045" stroke-width="1.6"/>`,
    sugar: `<path d="M8 14h16l-2 13H10z" fill="#FFFDF8" stroke="#C8C2AC" stroke-width="1.6"/><path d="M8 14l8-5 8 5" fill="#F1EEE1" stroke="#C8C2AC" stroke-width="1.6"/><path d="M13 20h6" stroke="#C8C2AC" stroke-width="1.8" stroke-linecap="round"/>`,
    rice: `<path d="M7 16h18c0 7-4 11-9 11s-9-4-9-11z" fill="#F9FDFF" stroke="#9CBBA9" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="9" ry="3" fill="#FFF" stroke="#9CBBA9" stroke-width="1.6"/><path d="M11 20h10" stroke="#DCE9E0" stroke-width="1.6" stroke-linecap="round"/>`,
    oat: `<path d="M12 27c-2-7 0-14 4-20 4 6 6 13 4 20z" fill="#D9B36A" stroke="#A8843E" stroke-width="1.6"/><path d="M16 9v17M13 15l6 4M19 15l-6 4" stroke="#A8843E" stroke-width="1.4" fill="none"/>`,
    soup: `<path d="M6 15h20c0 6-4 10-10 10S6 21 6 15z" fill="#EAF7EF" stroke="#6FA88F" stroke-width="1.6"/><ellipse cx="16" cy="15" rx="10" ry="3" fill="#FFF" stroke="#6FA88F" stroke-width="1.6"/><path d="M10 15c2-2 4-2 6 0 2-2 4-2 6 0" stroke="#F2B705" stroke-width="2" fill="none"/><path d="M12 10c0-2 2-2 2-4M18 10c0-2 2-2 2-4" stroke="#9CBBA9" stroke-width="2" stroke-linecap="round" fill="none"/>`,
    pan: `<path d="M7 15h16c0 6-3 9-8 9s-8-3-8-9z" fill="#4E6259" stroke="#2E3D36" stroke-width="1.6"/><path d="M23 16h6" stroke="#2E3D36" stroke-width="3" stroke-linecap="round"/><ellipse cx="15" cy="15" rx="8" ry="3" fill="#F7DFAE" stroke="#B98F52" stroke-width="1.4"/><circle cx="15" cy="15" r="2.6" fill="#F2B705"/>`,
    salad: `<path d="M6 16h20c0 6-4 10-10 10S6 22 6 16z" fill="#FFF" stroke="#6FA88F" stroke-width="1.6"/><circle cx="12" cy="14" r="4.4" fill="#59A84A"/><circle cx="18" cy="13" r="5" fill="#83C45F"/><circle cx="23" cy="15" r="4" fill="#3F8C3B"/><circle cx="16" cy="17" r="2.6" fill="#E84045"/>`,
    sandwich: `<path d="M7 12l18 2-2 6-18-2z" fill="#F4D39A" stroke="#B98443" stroke-width="1.6"/><path d="M7 18l18 2-2 5-18-2z" fill="#DEA85F" stroke="#B98443" stroke-width="1.6"/><path d="M8 15l18 2" stroke="#3F8C3B" stroke-width="2.6"/><path d="M8 20l18 2" stroke="#F2B705" stroke-width="2.6"/>`,
    plate: `<circle cx="16" cy="17" r="10" fill="#F9FDFF" stroke="#9CBBA9" stroke-width="1.6"/><circle cx="16" cy="17" r="6.5" fill="#EAF7EF" stroke="#9CBBA9" stroke-width="1.6"/><path d="M4 13v8M28 13v8" stroke="#6FA88F" stroke-width="2" stroke-linecap="round"/>`,
    fridge: `<rect x="8" y="3" width="16" height="26" rx="4" fill="#F9FDFF" stroke="#5B93B8" stroke-width="1.6"/><path d="M8 12h16" stroke="#5B93B8" stroke-width="2"/><path d="M11 6v4M11 16v8" stroke="#3E86D6" stroke-width="2.4" stroke-linecap="round"/>`,
    zone: `<rect x="6" y="5" width="20" height="22" rx="4" fill="#F9FDFF" stroke="#5B93B8" stroke-width="1.6"/><path d="M8 14h16M8 21h16" stroke="#5B93B8" stroke-width="1.6"/><circle cx="11.5" cy="11" r="2" fill="#F2B705"/><path d="M17 9h4v4h-4z" fill="#E84045"/><path d="M11 17h4v3h-4z" fill="#83C45F"/><path d="M18 17h3v3h-3z" fill="#F08052"/>`,
    snow: `<circle cx="16" cy="16" r="10" fill="#EEF7FD" stroke="#8CC6FF" stroke-width="1.6"/><path d="M16 6v20M7.5 11l17 10M24.5 11l-17 10" stroke="#2E86D6" stroke-width="2.4" stroke-linecap="round"/><path d="M13 9l3 3 3-3M13 23l3-3 3 3" stroke="#2E86D6" stroke-width="1.8" fill="none"/>`,
    leaf: `<path d="M26 6C13 6 7 11 7 19c0 4 3 7 7 7 8 0 12-8 12-20z" fill="#83C45F" stroke="#4F8E3B" stroke-width="1.6"/><path d="M9 25C13 17 18 12 25 8" stroke="#4F8E3B" stroke-width="2" fill="none"/><path d="M14 17l1-4M18 14l2-3" stroke="#4F8E3B" stroke-width="1.4" fill="none"/>`,
    camera: `<rect x="5" y="10" width="22" height="15" rx="4" fill="#EAF7EF" stroke="#4F8E3B" stroke-width="1.6"/><circle cx="16" cy="17.5" r="4.8" fill="#F9FDFF" stroke="#4F8E3B" stroke-width="1.6"/><circle cx="16" cy="17.5" r="2.2" fill="#3E86D6"/><path d="M11 10l2-3h6l2 3" fill="#EAF7EF" stroke="#4F8E3B" stroke-width="1.6"/>`,
    pen: `<path d="M8 24l2-6 12-12 4 4-12 12z" fill="#F2C705" stroke="#B98A00" stroke-width="1.6"/><path d="M10 18l4 4" stroke="#fff" stroke-width="1.6"/><path d="M8 24l-2 4 4-2" fill="#4E6259"/>`,
    chat: `<path d="M6 8h20v14H15l-5 4v-4H6z" fill="#EAF7EF" stroke="#4F8E3B" stroke-width="1.6"/><path d="M11 14h10M11 18h7" stroke="#4F8E3B" stroke-width="2" stroke-linecap="round"/>`,
    basket: `<path d="M6 14h20l-2 12H8z" fill="#F4D39A" stroke="#B98443" stroke-width="1.6"/><path d="M11 14l5-7 5 7" stroke="#B98443" stroke-width="2" fill="none"/><path d="M11 19h10" stroke="#B98443" stroke-width="1.6"/>`,
    nfc: `<rect x="6" y="5" width="20" height="22" rx="5" fill="#EAF7EF" stroke="#4F8E3B" stroke-width="1.6"/><path d="M11 12a7 7 0 0 1 0 8M15 12a11 11 0 0 1 0 8M19 12a15 15 0 0 1 0 8" stroke="#3E86D6" stroke-width="2" stroke-linecap="round" fill="none"/>`,
    check: `<circle cx="16" cy="16" r="11" fill="#1DB954"/><path d="M10 16.5l4 4 8-9" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    mic: `<rect x="12" y="5" width="8" height="14" rx="4" fill="#EAF7EF" stroke="#4F8E3B" stroke-width="1.6"/><path d="M9 15a7 7 0 0 0 14 0M16 22v5M12 27h8" stroke="#4F8E3B" stroke-width="2" stroke-linecap="round" fill="none"/>`,
    cart: `<path d="M4 7h3.5l2.5 12h13l2.5-9H9" fill="none" stroke="#B98443" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="24" r="2" fill="#B98443"/><circle cx="22" cy="24" r="2" fill="#B98443"/><path d="M11 12h13" stroke="#E4B36A" stroke-width="1.6" stroke-linecap="round"/>`
  };

  const ALIAS = {
    '鲜鸡蛋': 'egg', '鸡蛋': 'egg', '蛋': 'egg', '🥚': 'egg',
    '全脂牛奶': 'milk', '牛奶': 'milk', '🥛': 'milk',
    '原味酸奶': 'yogurt', '酸奶': 'yogurt', '🥣': 'yogurt',
    '吐司面包': 'bread', '吐司': 'bread', '面包': 'bread', '🍞': 'bread',
    '三文鱼': 'salmon', '鱼': 'salmon', '🐟': 'salmon',
    '豆腐': 'tofu', '🧈': 'tofu',
    '鸡胸肉': 'chicken', '鸡肉': 'chicken', '🍗': 'chicken', '鸡翅': 'chicken', '🍖': 'chicken',
    '西兰花': 'broccoli', '花椰菜': 'broccoli', '🥦': 'broccoli', '冷冻西兰花': 'frozenBroccoli',
    '番茄': 'tomato', '西红柿': 'tomato', '🍅': 'tomato',
    '红苹果': 'apple', '苹果': 'apple', '🍎': 'apple',
    '胡萝卜': 'carrot', '🥕': 'carrot',
    '生菜': 'lettuce', '青菜': 'lettuce', '🥬': 'lettuce',
    '蓝莓': 'blueberry', '🫐': 'blueberry',
    '柠檬': 'lemon', '🍋': 'lemon',
    '速冻水饺': 'dumpling', '水饺': 'dumpling', '饺子': 'dumpling', '🥟': 'dumpling', '汤圆': 'dumpling',
    '冰淇淋': 'icecream', '雪糕': 'icecream', '🍦': 'icecream',
    '奶酪': 'cheese', '🧀': 'cheese',
    '香肠': 'sausage', '🌭': 'sausage',
    '橙汁': 'juice', '🧃': 'juice',
    '土豆': 'potato', '🥔': 'potato',
    '青椒': 'pepper', '🫑': 'pepper',
    '蒜': 'garlic', '🧄': 'garlic', '葱': 'scallion', '🌿': 'scallion', '姜': 'ginger', '🫚': 'ginger',
    '可乐': 'cola', '🥤': 'cola', '糖': 'sugar', '🍬': 'sugar', '米饭': 'rice', '🍚': 'rice', '燕麦': 'oat', '🌾': 'oat',
    '🍳': 'pan', '🍲': 'soup', '🍜': 'soup', '🥗': 'salad', '🥪': 'sandwich', '🍽️': 'plate', '🍽': 'plate',
    '🧊': 'fridge', '❄️': 'snow', '❄': 'snow',
    '📷': 'camera', '✍️': 'pen', '✍': 'pen', '💬': 'chat', '🧺': 'basket', '📡': 'nfc', '✅': 'check', '✔': 'check', '🎤': 'mic', '🛒': 'cart'
  };

  function wrap(body) {
    return `<svg viewBox="0 0 32 32" class="food-ico" aria-hidden="true" focusable="false">${body}</svg>`;
  }
  function resolve(key) {
    if (!key) return 'plate';
    if (ALIAS[key]) return ALIAS[key];
    if (ICON[key]) return key;
    return 'plate';
  }
  window.foodIcon = function (name, fallback) {
    const key = resolve(name) === 'plate' && fallback ? resolve(fallback) : resolve(name);
    return wrap(ICON[key] || ICON.plate);
  };
  window.emojiIcon = function (emoji) { return wrap(ICON[resolve(emoji)] || ICON.plate); };
  window.layerIcon = function (layer) {
    if (String(layer).includes('冷冻')) return wrap(ICON.snow);
    if (String(layer).includes('果蔬')) return wrap(ICON.leaf);
    return wrap(ICON.zone);
  };
})();
