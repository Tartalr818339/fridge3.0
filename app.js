/* 鲜知 FreshSense — 手机 App 交互逻辑（无构建步骤，原生 ES） */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // 与冰箱显示屏共用同一套写实 SVG 图标
  const foodIcon = (name, fallback) => window.foodIcon(name, fallback);
  const dishIcon = (emoji) => window.emojiIcon(emoji);

  // 内联 SVG 图标（避免部分设备上 emoji 渲染成方框）
  const svg = (paths, size) => `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const navIcon = path => `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${path}</svg>`;
  const ICON = {
    x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 20),
    home: svg('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>', 22),
    book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>', 22),
    cart: svg('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>', 22),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.65 1.65 0 0 0-1.8-.3 1.65 1.65 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-1-1.5 1.65 1.65 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.65 1.65 0 0 0 .3-1.8 1.65 1.65 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1.5-1 1.65 1.65 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.65 1.65 0 0 0 1.8.3H9a1.65 1.65 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.65 1.65 0 0 0 1 1.5 1.65 1.65 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.65 1.65 0 0 0-.3 1.8V9a1.65 1.65 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1.5 1z"/>', 22),
    snow: svg('<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5M12 2l-2 2m2-2 2 2m-2 18-2-2m2 2 2-2"/>', 18),
    fridge: svg('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14M9 6v2M9 14v3"/>', 18),
    leaf: svg('<path d="M11 20A7 7 0 0 1 4 13c0-6 7-11 16-11 0 9-5 16-11 16z"/><path d="M4 20c3-5 8-9 14-11"/>', 18),
    box: svg('<path d="m21 8-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>', 18)
  };

  const appEl = $('#app-content');
  const phoneFrame = $('.phone-frame');
  const topbarEl = $('#app-topbar');
  const tabEl = $('#app-tabbar');
  const modalRoot = $('#modal-root');
  const toastRoot = $('#toast-root');
  const scrollRail = $('#scroll-rail');
  const dockRoot = $('#dock-root');

  // 分区图标与冰箱显示屏保持一致
  function layerIcon(layer) {
    return window.layerIcon(layer);
  }
  function currentLayers() {
    const m = FRIDGE_MODELS.find(x => x.key === STATE.fridgeModel) || FRIDGE_MODELS[0];
    return m.layers;
  }
  function currentModel() {
    return FRIDGE_MODELS.find(x => x.key === STATE.fridgeModel) || FRIDGE_MODELS[0];
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function toastWithAction(msg, actionLabel, onClick) {
    const t = document.createElement('div');
    t.className = 'toast toast-action';
    const text = document.createElement('span');
    text.textContent = msg;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => { t.remove(); onClick(); });
    t.append(text, btn);
    toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 5200);
  }

  function highlightAddedLayer(layer) {
    if (!layer) return;
    setTimeout(() => {
      const selector = `.fv-row[data-layer="${CSS.escape(layer)}"], .fd-layer[data-layer="${CSS.escape(layer)}"]`;
      $$(selector).forEach(el => {
        el.classList.remove('just-added');
        void el.offsetWidth;
        el.classList.add('just-added');
        setTimeout(() => el.classList.remove('just-added'), 2600);
      });
    }, 80);
  }

  function viewAddedLayer(layer) {
    if (!layer) return;
    STATE.appPage = 'fridge';
    STATE.focusLayer = layer;
    renderApp();
  }

  function announceAdded(items) {
    const list = (items || []).filter(Boolean);
    if (!list.length) return;
    const layers = Array.from(new Set(list.map(x => x.layer).filter(Boolean)));
    const text = layers.length === 1 ? `已放入${layers[0]}` : `已放入 ${layers.length} 个分区`;
    layers.forEach(highlightAddedLayer);
    toastWithAction(text, '查看', () => viewAddedLayer(layers[0]));
  }

  /* ==================== 手机 App ==================== */
  // 底部导航只放四个独立入口；冰箱食材是首页分区的下钻页面，不单列 Tab
  const TABS = [
    { key: 'home', icon: navIcon('<path d="M12 2 2 11h3v10h6v-6h2v6h6V11h3L12 2z"/>'), label: '首页' },
    { key: 'recipes', icon: navIcon('<path d="M3 11h18a1 1 0 0 1 1 1c0 4.4-4.5 8-10 8S2 16.4 2 12a1 1 0 0 1 1-1zm5-8h2v7H8V3zm4 0h2v7h-2V3z"/>'), label: '食谱' },
    { key: 'restock', icon: navIcon('<path d="M2 3h2.6l1 3.5h14.1l-2.3 8.5H7.2L6.5 18h11.8v2H5.2a2 2 0 0 1-2-2L2 3zm4.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>'), label: '购物车' },
    { key: 'device', icon: navIcon('<path d="M19.4 13a7.8 7.8 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.4a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.8 7.8 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5L19.4 13zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>'), label: '我的' }
  ];
  const PAGE_TITLES = {
    home: '鲜知', fridge: '我的冰箱', recipes: '今日食谱', recipe: '菜谱详情',
    restock: '购物车', product: '商品详情', cart: '购物车', device: '我的', nfc: '冰箱已连接'
  };
  let lastPage = null;

  /* ==================== 开场动画 / 新手引导 / 每日提醒：状态与配置 ==================== */
  const introRoot = $('#intro-root');
  const tourRoot = $('#tour-root');
  const TOUR_SEEN_KEY = 'freshSense3.tourSeen';
  const DAILY_EXPIRY_KEY = 'freshSense3.expiryPopupDate';
  const safeStore = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* 隐私模式下忽略 */ } }
  };
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const TOUR_STEPS = [
    { title: '欢迎来到全新的鲜知', desc: '这是一个还没有数据的全新冰箱。跟着提示点一遍，完成一次完整探索。', page: 'home', target: '.phone-frame' },
    { title: '添加第一份食材', desc: '点这个入口，之后可以拍照、手动或一句话录入食材。', page: 'home', target: '.tab-add' },
    { title: '先看临期提醒', desc: '这里按紧急程度排序；以后有快到期食材时，越靠前越该先吃掉。', page: 'home', homeModule: 'expiry', target: '.alert-banner', autoScroll: true },
    { title: '按位置找食材', desc: '冰箱分区按真实位置管理，冷藏、冷冻一目了然。', page: 'home', homeModule: 'zones', target: '.fridge-view.appliance', autoScroll: true },
    { title: '匹配你的冰箱', desc: '点这里切换冰箱类型，让分区和你家冰箱一致。', page: 'home', homeModule: 'zones', target: '.mac-primary' },
    { title: '看看今天吃什么', desc: '食谱会优先推荐能用掉临期食材的菜，点这里开始挑菜。', page: 'recipes', target: '.ai-entry' },
    { title: '把缺的加入补货', desc: '缺什么就在这里勾选补货，买完回来再更新冰箱。', page: 'restock', target: '.restock-item' },
    { title: '探索完成', desc: '你已经走完一遍核心流程。现在开始管理你的冰箱吧。', page: 'home', target: '.phone-frame' }
  ];
  let tourActive = false;
  let tourStep = 0;
  let tourDoneCallback = null;
  let tourStepToken = 0;
  let tourSnapshot = null;

  function renderTopbar(page) {
    const urgent = ITEMS.filter(i => i.remainingDays <= 2).length;
    const statusText = urgent ? `${ITEMS.length} 件 · ${urgent} 临期` : `${ITEMS.length} 件`;
    // 菜谱详情/商品详情已在页面内提供返回按钮，顶栏不再重复显示
    const backTarget = { cart: 'restock', nfc: 'device', fridge: 'home' }[page];
    topbarEl.className = 'app-topbar' + (appEl.scrollTop > 8 ? ' scrolled' : '') + (backTarget ? ' has-back' : '');
    const back = backTarget ? `<button class="tb-back" data-go="${backTarget}">‹ 返回</button>` : '';
    topbarEl.innerHTML = `${back}<div class="tb-title">${PAGE_TITLES[page] || '鲜知'}</div>
      <div class="tb-actions">
        <button class="tb-status" data-go="fridge"><span class="tb-dot${urgent ? ' warn' : ''}"></span>${statusText}</button>
      </div>`;
  }

  function renderDock(page) {
    if (!dockRoot) return;
    if (page === 'restock') {
      const selected = STATE.restock.filter(r => STATE.checked.has(r.id));
      dockRoot.innerHTML = `<div class="cart-bar">
        <div class="summary-line"><span>已勾选 <b>${selected.length}</b> 项 · 购物车 ${STATE.cart.length} 件</span><span class="muted">冰箱里还有的会提醒你</span></div>
        <div class="row" style="gap:8px">
          <button class="btn btn-ghost grow" data-go="cart">查看购物车</button>
          <button class="btn btn-primary grow" data-action="restock-add-cart">加入购物车</button>
        </div>
      </div>`;
      return;
    }
    if (page === 'cart') {
      dockRoot.innerHTML = `<div class="cart-bar">
        <button class="btn btn-primary btn-block" data-action="checkout">${STATE.cart.length ? '确认下单 · 食材自动入库' : '去挑点食材吧'}</button>
        <button class="btn btn-ghost btn-block" data-go="restock" style="margin-top:8px">继续逛补货清单</button>
      </div>`;
      return;
    }
    dockRoot.innerHTML = '';
  }

  function updateScrollHint() {
    if (!scrollRail) return;
    const max = Math.max(0, appEl.scrollHeight - appEl.clientHeight);
    const scrollable = max > 72;
    scrollRail.classList.toggle('active', scrollable);
    if (!scrollable) return;
    const thumb = scrollRail.firstElementChild;
    const thumbPct = Math.max(12, Math.min(60, appEl.clientHeight / appEl.scrollHeight * 100));
    thumb.style.height = `${thumbPct}%`;
    thumb.style.top = `${(appEl.scrollTop / max) * (100 - thumbPct)}%`;
  }

  appEl.addEventListener('scroll', () => {
    topbarEl.classList.toggle('scrolled', appEl.scrollTop > 8);
    updateScrollHint();
  });

  function renderApp() {
    const page = STATE.appPage;
    const pageChanged = lastPage !== page;
    let html = '';
    if (page === 'nfc') html = pageNfc();
    else if (page === 'home') html = pageHome();
    else if (page === 'fridge') html = pageFridge();
    else if (page === 'recipes') html = pageRecipes();
    else if (page === 'recipe') html = pageRecipe();
    else if (page === 'restock') html = pageRestock();
    else if (page === 'product') html = pageProduct();
    else if (page === 'cart') html = pageCart();
    else if (page === 'device') html = pageDevice();

    const commit = () => {
      appEl.innerHTML = `<div class="page-wrap${pageChanged ? ' entering' : ''}">${html}</div>`;
      if (pageChanged) { appEl.scrollTop = 0; lastPage = page; }
      renderTopbar(page);
      renderDock(page);
      appEl.classList.toggle('has-dock', page === 'restock' || page === 'cart');
      if (phoneFrame) phoneFrame.classList.toggle('has-dock', page === 'restock' || page === 'cart');
      const active = (page === 'recipe') ? 'recipes'
        : (page === 'product' || page === 'cart') ? 'restock'
        : (page === 'fridge' || page === 'nfc') ? 'home' : page;
      tabEl.innerHTML = TABS.map((t, i) => {
        const btn = `<button class="tab ${active === t.key ? 'active' : ''}" data-tab="${t.key}"><span class="tab-ico">${t.icon}</span>${t.label}</button>`;
        return i === 1 ? btn + `<button class="tab-add" data-action="add-open" aria-label="添加食材"><span class="tab-add-ico">＋</span><span class="tab-add-label">添加</span></button>` : btn;
      }).join('');
      $$('[data-app-route]').forEach(b => b.classList.toggle('active', b.dataset.appRoute === page));
    };
    if (pageChanged && document.startViewTransition) document.startViewTransition(commit);
    else commit();
    requestAnimationFrame(updateScrollHint);

    if (page === 'fridge' && STATE.focusLayer) {
      const layer = STATE.focusLayer;
      STATE.focusLayer = null;
      setTimeout(() => {
        const target = appEl.querySelector(`.fd-layer[data-layer="${CSS.escape(layer)}"]`);
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); toast(`已定位到${layer}`); }
      }, 60);
    }
    if (page === 'restock' && !tourActive) maybeAutoRestock();
  }

  function pageNfc() {
    const pending = STATE.restock.filter(r => r.status === '待补');
    return `<div class="nfc-hero">
        <div class="nfc-success">✓</div>
        <h2>已连接你的冰箱</h2>
        <p>这是冰箱里最新的食材情况</p>
      </div>
      <div class="result-card">
        <div class="result-card-head"><div class="rc-icon">📋</div><div><h4>补货清单</h4><p>${pending.length} 项待补货</p></div></div>
        <div class="result-card-body">
          ${pending.slice(0,3).map(r => `<div class="mini-line"><span>${r.source === '快到期提醒' ? '⏰' : '📝'}</span><span class="ml-name">${foodIcon(r.name)} ${esc(r.name)} ×${r.suggestQty}${esc(r.unit)}</span><span class="muted">${sourceLabel(r.source)}</span></div>`).join('')}
          <button class="btn btn-primary btn-block" data-go="restock" style="margin-top:10px">查看完整清单</button>
        </div>
      </div>
      <div class="result-card">
        <div class="result-card-head"><div class="rc-icon" style="background:var(--yellow-soft)">${dishIcon('🍳')}</div><div><h4>今日食谱推荐</h4><p>先用掉快到期的食材</p></div></div>
        <div class="result-card-body">
          ${RECIPES.slice(0,2).map(r => `<button class="mini-line" data-recipe="${r.id}" style="width:100%;text-align:left"><span>${dishIcon(r.emoji)}</span><span class="ml-name">${esc(r.name)} · ${r.minutes} 分钟</span><span style="color:var(--green-deep);font-size:13px">${r.expiring.length ? '快到期优先' : '查看'}</span></button>`).join('')}
        </div>
      </div>`;
  }

  function fridgeZoneView() {
    const layers = currentLayers();
    const groups = [
      { title: '冷藏区', hint: '2~8℃ · 日常保鲜', layers: layers.filter(l => !l.includes('冷冻')) },
      { title: '冷冻区', hint: '-18℃ · 长期保存', layers: layers.filter(l => l.includes('冷冻')) }
    ];
    return `<div class="model-action-card" id="fridge-model-card">
        <div class="mac-ico">${dishIcon('🧊')}</div>
        <div class="mac-info">
          <div class="mac-title-row"><h4>${esc(currentModel().name)}</h4><span class="mac-sub">${layers.length} 分区</span></div>
          <p>选择和你家一致的冰箱结构，管理更精准</p>
        </div>
        <div class="mac-actions">
          <button class="mac-primary" data-action="fridge-model">切换冰箱类型</button>
          <button class="mac-photo" data-action="fridge-model-photo">拍照识别</button>
        </div>
      </div>
      <div class="fridge-view appliance">${groups.filter(g => g.layers.length).map(g => `
      <div class="fv-group ${g.title === '冷冻区' ? 'cold' : ''}">
        <div class="fv-group-head"><span>${g.title}</span><span>${g.hint}</span></div>
        ${g.layers.map(layer => {
          const its = ITEMS.filter(i => i.layer === layer);
          const urgent = its.filter(i => i.remainingDays <= 2).length;
          const bar = its.length
            ? its.map(i => `<i class="${i.freshness}"></i>`).join('')
            : '<i class="empty"></i>';
          return `<button class="fv-row" data-action="app-open-layer" data-layer="${esc(layer)}">
            <span class="fv-ico">${layerIcon(layer)}</span>
            <span class="fv-name">${esc(layer)}<small>${esc((LAYER_META[layer] || {}).temp || '')}</small></span>
            <span class="fv-bar">${bar}</span>
            <span class="fv-count">${its.length} 件${urgent ? `<em>${urgent} 件即将过期</em>` : ''}</span>
            <span class="fv-arrow">›</span>
          </button>`;
        }).join('')}
      </div>`).join('')}</div>`;
  }

  function expiryWindows() {
    return [
      { d: 0, label: '已过期', test: i => i.remainingDays === 0 },
      { d: 1, label: '1天内', test: i => i.remainingDays === 1 },
      { d: 2, label: '2天内', test: i => i.remainingDays >= 1 && i.remainingDays <= 2 },
      { d: 3, label: '3天内', test: i => i.remainingDays >= 1 && i.remainingDays <= 3 }
    ];
  }
  function expiryItems() {
    const pool = ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 3);
    const win = expiryWindows().find(w => w.d === STATE.expiryDay) || expiryWindows()[3];
    return pool.filter(win.test).sort((a, b) => a.remainingDays - b.remainingDays);
  }
  function priorityTag(item) {
    if (!item) return '';
    if (item.remainingDays === 0) return '<span class="priority-tag expired">⛔ 已过期</span>';
    if (item.remainingDays <= 2) return '<span class="priority-tag">⏰ 优先吃</span>';
    return '';
  }
  function showExpiryModal(items) {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">⏰</div>
          <div class="grow"><h3>快到期食材</h3><p>共 ${items.length} 件，按紧急程度排序</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="al-list">
          ${items.map(i => `<div class="al-row ${i.freshness}">
            <span class="al-emoji">${foodIcon(i.name, i.icon)}</span>
            <div class="al-info">
              <div class="al-name">${esc(i.name)} <span class="pill-tag ${i.freshness}">${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'}</span>${priorityTag(i)}</div>
              <div class="al-meta">保质至 ${esc(i.expiryDate)} · ${i.quantity}${esc(i.unit)}</div>
            </div>
          </div>`).join('')}
        </div>
        <div class="modal-actions" style="margin-top:12px"><button class="btn btn-primary btn-block" data-action="close-app-layer">知道了</button></div>
      </div>
    </div>`;
  }

  function homeExpiryModule() {
    const windows = expiryWindows();
    const soonItems = ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 3);
    const sel = STATE.expiryDay;
    const dayItems = expiryItems();
    const shown = dayItems.slice(0, 4);
    return `<div class="alert-banner">
        <span class="ab-ico">⏰</span>
        <div class="grow"><h4>这些食材快到期了（${soonItems.length} 件）</h4>
          <p>按紧急程度查看，越靠前越该先吃</p>
          <div class="expiry-tabs">
            ${windows.map(w => `<button class="expiry-tab ${sel === w.d ? 'active' : ''}" data-action="expiry-day" data-day="${w.d}">${w.label}<i>${soonItems.filter(w.test).length}件</i></button>`).join('')}
          </div>
          <div class="expiry-list-mini">
            ${shown.length ? shown.map(i => `<div class="expiry-mini-row">
              <span class="em-ico">${foodIcon(i.name, i.icon)}</span><span class="em-name">${esc(i.name)}</span>
              <span class="em-meta">${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'} · ${i.quantity}${esc(i.unit)}</span>${priorityTag(i)}
            </div>`).join('') : '<div class="expiry-none">这个范围内没有快到期的食材</div>'}
            ${dayItems.length > 4 ? `<button class="expiry-more" data-action="expiry-all">查看全部 ${dayItems.length} 件 ›</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  function homeZoneModule() {
    return `<div class="sec-title">冰箱分区 <button class="more" data-go="fridge">查看全部食材 ›</button></div>
      ${fridgeZoneView()}`;
  }

  function homeRecipeModule() {
    return `<div class="sec-title">今日食谱 <button class="more" data-go="recipes">全部食谱 ›</button></div>
      <div class="home-recipe-list">${RECIPES.slice(0, 3).map(r => `<button class="home-recipe" data-recipe="${r.id}">
        <span class="hr-emoji"><img src="${r.image}" alt="" loading="lazy" /></span>
        <span class="grow"><b>${esc(r.name)}</b><small>⏱ ${r.minutes} 分钟 · ${r.ingredients.filter(x => x.have).length}/${r.ingredients.length} 食材已有</small></span>
        <span class="hr-go">›</span>
      </button>`).join('')}</div>`;
  }

  function pageHome() {
    const module = STATE.homeModule || 'expiry';
    const renderModule = { expiry: homeExpiryModule, zones: homeZoneModule, recipes: homeRecipeModule }[module] || homeExpiryModule;
    return `<div class="app-hero">
        <h2>早上好，今天想吃些什么</h2>
        <p>${ITEMS.length} 件食材 · ${currentLayers().length} 个分区</p>
      </div>
      <div class="module-switch">
        <button class="module-tab ${module === 'expiry' ? 'active' : ''}" data-action="home-module" data-module="expiry">⏰ 临期</button>
        <button class="module-tab ${module === 'zones' ? 'active' : ''}" data-action="home-module" data-module="zones">🧊 分区</button>
        <button class="module-tab ${module === 'recipes' ? 'active' : ''}" data-action="home-module" data-module="recipes">🍳 今日食谱</button>
      </div>
      <div class="home-module">${renderModule()}</div>`;
  }

  // 手机端冰箱食材库：下单同步后可直接查看新入库食材
  function pageFridge() {
    const urgent = ITEMS.filter(i => i.remainingDays <= 2).length;
    const freshCount = ITEMS.filter(i => i.freshness === 'green').length;
    const soonCount = ITEMS.filter(i => i.freshness === 'yellow').length;
    const nowCount = ITEMS.filter(i => i.freshness === 'red').length;
    const layers = currentLayers().map((layer) => {
      const its = ITEMS.filter(i => i.layer === layer);
      const meta = LAYER_META[layer];
      return `<div class="fd-layer" data-layer="${esc(layer)}">
        <div class="fd-layer-head"><h4>${layerIcon(layer)} ${esc(layer)}</h4><span class="fd-temp">${meta.temp} · ${its.length} 件</span></div>
        <div class="fd-list">
          ${its.map(i => `<div class="fd-item ${i.freshness}">
            <span class="fd-emoji">${foodIcon(i.name, i.icon)}</span>
            <div class="fd-info">
              <div class="fd-name">${esc(i.name)} <span class="pill-tag ${i.freshness}">${i.remainingDays === 0 ? '已过期' : FRESHNESS[i.freshness].label}</span>${priorityTag(i)}</div>
              <div class="fd-meta">保质至 ${esc(i.expiryDate)} · ${i.quantity}${esc(i.unit)}</div>
            </div>
            <div class="fd-days ${i.freshness}"><b>${i.remainingDays === 0 ? '!' : i.remainingDays}</b><small>${i.remainingDays === 0 ? '过期' : '天'}</small></div>
          </div>`).join('') || '<div class="muted" style="padding:8px">这层还空着</div>'}
        </div>
      </div>`;
    }).join('');
    return `<div class="fridge-hero">
        <h2>我的冰箱</h2>
        <p>${ITEMS.length} 件食材 · ${currentLayers().length} 个分区${urgent ? ` · ${urgent} 件优先吃掉` : ''}</p>
      </div>
      <button class="add-entry" data-action="add-open">＋ 添加食材 <span style="opacity:.75">拍照 / 手动 / 一句话</span></button>
      <div class="status-bar">
        <div class="status-chip"><b>${freshCount}</b><span>新鲜</span></div>
        <div class="status-chip soon"><b>${soonCount}</b><span>2 天内吃</span></div>
        <div class="status-chip now"><b>${nowCount}</b><span>优先吃掉</span></div>
      </div>
      ${layers}
      <div class="al-foot">快到期的食材会用黄色、红色标出来</div>`;
  }

  function pageRecipes() {
    return `<div class="app-hero"><h2>今日食谱</h2><p>优先用掉快到期的食材</p></div>
      <div class="ai-entry" data-action="ai-open">
        <div class="ai-entry-top"><span class="ai-orb">🍳</span><div><h4>今天吃什么</h4><p>想吃什么就输入什么，冰箱食材帮你对照着买</p></div><span class="ai-arrow">›</span></div>
        <div class="ai-entry-chips">${RECIPES.map(r => `<button type="button" data-action="ai-quick" data-q="${esc(r.name)}">${esc(r.name)}</button>`).join('')}</div>
      </div>
      <div class="sec-title">全部食谱 <span class="more">共 ${RECIPES.length} 道</span></div>
      ${RECIPES.map(r => `<button class="result-card" data-recipe="${r.id}" style="width:100%;text-align:left">
        <div style="display:flex;gap:12px;padding:12px;align-items:center">
          <div class="recipe-thumb"><img src="${r.image}" alt="" loading="lazy" /></div>
          <div class="grow"><div style="font-size:13px;font-weight:700">${esc(r.name)}</div>
            <div class="muted" style="margin-top:3px">⏱ ${r.minutes} 分钟 · ${r.ingredients.filter(x=>x.have).length}/${r.ingredients.length} 食材已有</div>
            ${r.expiring.length ? `<span class="pill-tag yellow" style="margin-top:5px;display:inline-block">能用掉快到期食材：${r.expiring.map(esc).join('、')}</span>` : ''}
            ${r.video ? '<span class="video-mini">▶ 视频教程</span>' : ''}
          </div><span style="color:var(--muted)">›</span>
        </div></button>`).join('')}`;
  }

  function pageRecipe() {
    const r = RECIPES.find(x => x.id === STATE.recipeId) || RECIPES[0];
    return `<button class="back-link" data-go="recipes">‹ 返回食谱列表</button>
      <div class="recipe-banner" style="background:${r.thumb}"><img class="rb-photo" src="${r.image}" alt="" /><div class="rb-copy"><h2>${esc(r.name)}</h2><p>⏱ ${r.minutes} 分钟 · 5 星好评</p></div></div>
      ${r.expiring.length ? `<div class="expiring-tip">⏰ <span>用得快到期的食材：<b>${r.expiring.map(esc).join('、')}</b>，今天做正合适</span></div>` : ''}
      <div class="sec-title">所需食材 <span class="more">标注「已有 / 需补充」</span></div>
      <div class="card">${r.ingredients.map(ing => `<div class="ing-item">
          <span class="ing-check ${ing.have ? 'have' : 'miss'}">${ing.have ? '✓' : '+'}</span>
          <span class="ing-name">${esc(ing.name)}</span>
          ${r.expiring.includes(ing.name) ? '<span class="pill-tag yellow">快到期</span>' : ''}
          <span class="ing-flag ${ing.have ? 'have' : 'miss'}">${ing.have ? '已有' : '需补充'}</span>
        </div>`).join('')}</div>
      ${r.ingredients.some(x => !x.have) ? `<button class="btn btn-primary btn-block" data-add-missing="${r.id}" style="margin-top:12px">把缺的食材加入购物车</button>` : ''}
      <div class="sec-title">做法步骤</div>
      <div class="card">${r.steps.map((s, i) => `<div class="step-item"><span class="step-num">${i+1}</span><span>${esc(s)}</span></div>`).join('')}</div>
      ${r.video ? `<div class="sec-title">视频教程 <span class="more">${esc(r.video.author)}</span></div>
      <a class="video-card" href="${esc(r.video.url)}" target="_blank" rel="noopener noreferrer">
        <span class="vc-play">▶</span>
        <span class="grow"><b>${esc(r.video.title)}</b><small>点击观看完整做法</small></span>
        <span class="vc-go">观看 ›</span>
      </a>` : ''}`;
  }

  function pageRestock() {
    const rows = STATE.cart.map((c, idx) => {
      const p = PRODUCTS.find(x => x.sku === c.sku) || {};
      return { c, idx, p, dup: checkDuplicate(c.sku), selected: c.selected !== false };
    });
    const chosen = rows.filter(r => r.selected);
    const allSelected = rows.length > 0 && chosen.length === rows.length;
    const total = chosen.reduce((sum, r) => sum + (r.p.price || 9.9) * r.c.qty, 0);
    const dupCount = rows.filter(r => r.dup && r.dup.hit).length;
    const recommendations = STATE.restock.filter(r => r.status === '待补');
    return `<div class="cart-page">
      <div class="cart-page-title"><h2>购物车 <span>(${rows.length})</span></h2><button class="mini-btn" data-action="cart-manage">管理</button></div>
      <div class="cart-promos"><span>满 99 减 10</span><span>领券中心</span><span>产地直采 · 新鲜直达</span></div>
      ${dupCount ? `<div class="cart-top-alert">🥬 有 <b>${dupCount}</b> 样冰箱里还有，记得先核对</div>` : ''}
      ${rows.length ? `
        <div class="cart-store-head"><span class="r-check ${allSelected ? 'on' : ''}" data-action="cart-select-all">${allSelected ? '✓' : ''}</span><span>全选</span><b>鲜知超市 ›</b></div>
        ${rows.map(r => `<div class="cart-item restock-item">
          <span class="r-check ${r.selected ? 'on' : ''}" data-action="cart-select" data-idx="${r.idx}">${r.selected ? '✓' : ''}</span>
          <span class="cart-thumb">${dishIcon(r.p.emoji || '🥬')}</span>
          <div class="cart-item-main">
            <div class="cart-item-title">${esc(r.p.name || r.c.name)}</div>
            <div class="cart-tags"><span>产地直采</span><span>新鲜直达</span></div>
            ${r.dup && r.dup.hit ? `<div class="cart-inline">冰箱里还有 ${r.dup.item.quantity}${esc(r.dup.item.unit)}</div>` : ''}
            <div class="cart-item-bottom">
              <span class="cart-price">¥${(r.p.price || 9.9).toFixed(2)}</span>
              <div class="qty-ctrl"><button data-action="cart-qty" data-idx="${r.idx}" data-d="-1">−</button><span>${r.c.qty}</span><button data-action="cart-qty" data-idx="${r.idx}" data-d="1">+</button></div>
            </div>
          </div>
        </div>`).join('')}
      ` : `<div class="cart-empty">购物车还是空的，去「今日食谱」看看要补什么</div>`}
      ${recommendations.length ? `<div class="cart-recommend"><h4>推荐补货 <span>点一下加入购物车</span></h4><div class="cart-recommend-list">${recommendations.map(r => `<button class="chip" data-action="restock-to-cart" data-id="${r.id}">${skuByName(r.name) ? '＋' : '·'} ${esc(r.name)}</button>`).join('')}</div></div>` : ''}
      <div class="cart-checkout-bar">
        <span class="r-check ${allSelected ? 'on' : ''}" data-action="cart-select-all">${allSelected ? '✓' : ''}</span><span>全选</span>
        <div class="cart-total"><small>合计</small><b>¥${total.toFixed(2)}</b></div>
        <button class="btn btn-primary" data-action="checkout">结算(${chosen.length})</button>
      </div>
    </div>`;
  }

  function pageProduct() {
    const p = PRODUCTS.find(x => x.sku === STATE.productSku) || PRODUCTS[0];
    const dup = checkDuplicate(p.sku);
    return `<button class="muted" data-go="restock" style="margin-bottom:10px;font-size:13px">‹ 返回</button>
      <div class="product-hero">${p.emoji}</div>
      <div class="product-title">${esc(p.name)}</div>
      <div class="price">¥${p.price.toFixed(2)}</div>
      ${dup && dup.hit ? `<div class="dup-banner">
          <span class="db-ico">${dishIcon('🥬')}</span><div><h4>冰箱里还有这个食材</h4>
          <p>还有 ${dup.item.quantity}${esc(dup.item.unit)}，保质期至 ${esc(dup.item.expiryDate)}，暂时不用买。</p></div>
        </div>` : dup && dup.guideRestock ? `<div class="expiring-tip">⏰ ${esc(dup.name)} 快吃完了，可以补货了</div>` : ''}
      <div class="card" style="margin-bottom:12px">
        <div class="muted" style="line-height:1.7">新鲜直达，源头直采。加入购物车时会提醒你冰箱里有没有，避免重复购买。</div>
      </div>
      <div class="row" style="gap:8px;margin-top:12px">
        <button class="btn btn-ghost grow" data-go="cart">查看购物车</button>
        <button class="btn btn-primary grow" data-action="product-add" data-sku="${p.sku}">加入购物车</button>
      </div>`;
  }

  function pageCart() {
    return pageRestock();
  }

  function pageDevice() {
    const d = STATE.device;
    return `<div class="app-hero"><h2>我的冰箱</h2><p>连接状态 · 使用设置</p></div>
      <div class="device-card">
        <h3>${esc(d.name)}</h3><p>${esc(d.model)} · 已连接</p>
        <div class="device-status">
          <div class="ds-item">在线状态<b>${d.online ? '● 在线' : '○ 离线'}</b></div>
          <div class="ds-item">电量<b>${d.battery}%</b></div>
          <div class="ds-item">上次更新<b>${esc(d.lastSync)}</b></div>
        </div>
      </div>
      <div class="setting-row"><span class="sr-ico">📶</span><div><div class="sr-title">Wi-Fi 连接</div><div class="sr-sub">${esc(d.wifi)} · 已配网</div></div><button class="mini-btn" data-action="go-pairing">重新配网</button></div>
      <div class="setting-row"><span class="sr-ico">📡</span><div><div class="sr-title">碰一碰</div><div class="sr-sub">${d.nfcBound ? '已开启 · 手机靠近冰箱感应区即可查看' : '未开启 · 请靠近冰箱感应区'}</div></div><div class="switch ${d.nfcBound ? 'on' : ''}" data-action="toggle-nfc"></div></div>
      <div class="setting-row"><span class="sr-ico">⚙️</span><div><div class="sr-title">系统版本</div><div class="sr-sub">${esc(d.firmware)} · ${d.firmwareLatest ? '已是最新版本' : '有可用更新'}</div></div></div>
      <div class="setting-row"><span class="sr-ico">🧊</span><div><div class="sr-title">冰箱型号</div><div class="sr-sub">${esc(currentModel().name)} · ${currentLayers().length} 个分区</div></div><button class="mini-btn" data-action="fridge-model">更换</button></div>`;
  }

  function emojiFor(name) {
    const prod = PRODUCTS.find(p => p.name === name);
    return foodIcon(name, prod && prod.emoji);
  }
  function sourceLabel(s) {
    return ({ '临期自动': '快到期提醒', '手动录入': '手动添加', '手动': '手动添加',
      'App 下单': '刚买的', 'AI 录入': '快速录入', 'NFC 碰一碰': '碰一碰' })[s] || s;
  }
  function skuByName(name) {
    const n = String(name || '').trim();
    const exact = Object.keys(PRODUCT_MAPPING).find(sku => PRODUCT_MAPPING[sku] === n);
    if (exact) return exact;
    return Object.keys(PRODUCT_MAPPING).find(sku => {
      const mapped = PRODUCT_MAPPING[sku] || '';
      const prod = PRODUCTS.find(p => p.sku === sku);
      return mapped.includes(n) || n.includes(mapped) || (prod && (prod.name.includes(n) || n.includes(prod.name)));
    });
  }

  /* ==================== 重复购买提醒弹窗 ==================== */
  let dupQueue = [];
  let pendingGoCart = false;
  function showDuplicateModal(sku, fromRestockId) {
    const dup = checkDuplicate(sku);
    if (!dup || !dup.hit) return false;
    const i = dup.item;
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${dishIcon('🥬')}</div>
          <div><h3>冰箱里还有这个食材</h3><p>先看看再决定，不用着急买</p></div>
        </div>
        <div class="dup-detail">
          「<b>${esc(dup.name)}</b>」冰箱里还有 <b>${i.quantity}${esc(i.unit)}</b>，
          保质期至 <b>${esc(i.expiryDate)}</b>，还是新鲜的。
          <div class="dd-row" style="margin-top:8px;border-top:1px dashed #D9E2DC;padding-top:8px">
            <span>还能放</span><span><b style="color:var(--green-deep)">${i.remainingDays} 天</b>，暂时不用补</span>
          </div>
        </div>
        ${dupQueue.length >= 1 ? `<div class="muted" style="margin-bottom:10px;font-size:13px">还有 ${dupQueue.length} 项待确认</div>` : ''}
        <div class="modal-actions">
          <button class="btn btn-ghost" data-action="dup-skip" data-sku="${sku}" data-rid="${fromRestockId || ''}">先不买了</button>
          <button class="btn btn-primary" data-action="dup-buy" data-sku="${sku}" data-rid="${fromRestockId || ''}">仍然购买</button>
        </div>
      </div></div>`;
    return true;
  }
  function closeModal() { stopVoice(); modalRoot.innerHTML = ''; }

  /* ============ 分区详情：只显示当前分区 ============ */
  function showAppLayerModal(layer) {
    const items = ITEMS.filter(i => i.layer === layer);
    const meta = LAYER_META[layer] || { temp: '' };
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${layerIcon(layer)}</div>
          <div class="grow"><h3>${esc(layer)}</h3><p>${esc(meta.temp)} · 共 ${items.length} 件</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="al-list">
          ${items.map(i => `<div class="al-row ${i.freshness}">
            <span class="al-emoji">${foodIcon(i.name, i.icon)}</span>
            <div class="al-info">
              <div class="al-name">${esc(i.name)} <span class="pill-tag ${i.freshness}">${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'}</span>${priorityTag(i)}</div>
              <div class="al-meta">保质至 ${esc(i.expiryDate)} · ${i.quantity}${esc(i.unit)}</div>
              <div class="al-bar"><span style="width:${i.freshPct}%;background:${FRESHNESS[i.freshness].color}"></span></div>
            </div>
            <div class="al-days ${i.freshness}"><b>${i.remainingDays === 0 ? '!' : i.remainingDays}</b><small>${i.remainingDays === 0 ? '过期' : '天'}</small></div>
          </div>`).join('') || '<div class="muted" style="padding:20px;text-align:center">这层还空着，点底部 ＋ 添加食材</div>'}
        </div>
        <div class="modal-actions" style="margin-top:12px">
          <button class="btn btn-ghost" data-action="close-app-layer">关闭</button>
          <button class="btn btn-primary" data-action="layer-view-all">查看全部食材</button>
        </div>
      </div>
    </div>`;
  }

  function showFridgeModelModal() {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card model-modal" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${dishIcon('🧊')}</div>
          <div class="grow"><h3>我的冰箱型号</h3><p>分区按你家冰箱来，不再搞混冷藏和冷冻</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        ${FRIDGE_MODELS.map(m => `<button class="model-option ${m.key === STATE.fridgeModel ? 'active' : ''}" data-action="choose-model" data-model="${m.key}">
          <span class="mo-name">${m.name}</span><span class="mo-layers">${m.layers.join(' / ')}</span>
        </button>`).join('')}
        <label class="model-photo" for="model-photo">${dishIcon('📷')} 拍照识别冰箱分区</label>
        <input type="file" id="model-photo" accept="image/*" capture="environment" />
        <div class="ai-footnote" style="margin-top:8px">拍照后会自动匹配最接近的分区结构</div>
      </div>
    </div>`;
    const file = $('#model-photo');
    if (file) file.addEventListener('change', () => {
      closeModal(); applyFridgeModel('multi'); toast('已识别：多门冰箱，冷冻区分成上 / 中 / 下三层');
    });
  }

  function applyFridgeModel(key) {
    const model = FRIDGE_MODELS.find(m => m.key === key);
    if (!model) return;
    if (STATE.fridgeModel !== key) {
      const target = model.layers;
      ITEMS.forEach(i => {
        if (!target.includes(i.layer)) {
          if (i.layer.includes('冷冻')) i.layer = target.find(l => l.includes('冷冻')) || i.layer;
          else if (i.layer.startsWith('冷藏')) i.layer = target.includes('冷藏室') ? '冷藏室' : (target.find(l => l.startsWith('冷藏')) || '冷藏室中层');
          else i.layer = target[0];
        }
      });
    }
    STATE.fridgeModel = key;
    closeModal(); renderApp();
    toast('已切换为' + model.name);
  }

  function showAutoRestockModal(pending) {
    const names = pending.map(r => r.name).join('、');
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${dishIcon('🛒')}</div>
          <div class="grow"><h3>要顺手补货吗？</h3><p>这几样常买的可能快用完了</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="dup-detail">检测到 <b>${esc(names)}</b> 在补货清单里。<br/>要我现在加进购物车，还是你自己来？</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-action="auto-restock-manual">我自己补</button>
          <button class="btn btn-primary" data-action="auto-restock-order">自动加购</button>
        </div>
      </div>
    </div>`;
  }
  function maybeAutoRestock() {
    if (STATE.autoRestockAsked) return;
    const pending = STATE.restock.filter(r => r.status === '待补' && skuByName(r.name));
    if (!pending.length) return;
    STATE.autoRestockAsked = true;
    showAutoRestockModal(pending.slice(0, 3));
  }

  /* ============ 下单 → 自动同步到冰箱食材库 ============ */
  function doCheckout() {
    const chosen = STATE.cart.filter(c => c.selected !== false);
    if (!chosen.length) { toast('请先勾选要结算的商品'); return; }
    const synced = [];
    const filled = [];
    chosen.forEach(c => {
      const newItem = purchaseToItem(c.sku);
      if (!newItem) return;
      const existing = ITEMS.find(i => i.name === newItem.name);
      if (existing) {
        existing.quantity += newItem.quantity;
        existing.purchaseDate = newItem.purchaseDate;
        existing.expiryDate = newItem.expiryDate;
        existing.remainingDays = newItem.remainingDays;
        existing.freshness = 'green';
        existing.freshPct = 100;
        existing.source = 'App 下单';
      } else {
        ITEMS.push(newItem);
      }
      synced.push(newItem);
      // 货已补齐：从补货清单移除对应项，不再显示
      STATE.restock = STATE.restock.filter(r => {
        if (r.name !== newItem.name) return true;
        STATE.checked.delete(r.id);
        if (!filled.includes(r.name)) filled.push(r.name);
        return false;
      });
    });
    STATE.cart = STATE.cart.filter(c => !chosen.includes(c));
    renderApp();
    showCheckoutModal(synced, filled);
  }

  function showCheckoutModal(synced, filled) {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card checkout-modal" data-stop="1">
        <div class="ck-head">
          <div class="ck-ok">✓</div>
          <div class="grow"><h3>下单成功</h3><p>买好的食材已经放进冰箱清单</p></div>
          <button class="al-close" data-action="close-checkout" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="ck-list">
          ${synced.map(i => `<div class="ck-row">
            <span class="ck-emoji">${foodIcon(i.name, i.icon)}</span>
            <div class="grow"><div class="ck-name">${esc(i.name)} <span class="pill-tag green">已入库</span></div>
              <div class="ck-meta">${esc(i.layer)} · ${i.quantity}${esc(i.unit)} · 保质至 ${esc(i.expiryDate)}</div>
            </div>
            <span class="ck-days">${i.remainingDays}天</span>
          </div>`).join('')}
        </div>
        <div class="ck-tip">到期前会在首页提醒你，也可以随时在「食材」里查看</div>
        ${filled && filled.length ? `<div class="ck-tip ck-tip-done">补货清单里已划掉 ${filled.length} 项：${filled.map(n => esc(n)).join('、')}</div>` : ''}
        <div class="ck-actions">
          <button class="btn btn-primary grow" data-action="view-fridge">查看我的冰箱</button>
          <button class="btn btn-ghost grow" data-action="close-checkout">继续购物</button>
        </div>
      </div>
    </div>`;
  }

  /* ============ 配菜助手（食谱区） ============ */
  // 按冰箱食材判断已有/需补；快到期食材优先推荐
  function aiAnalyzeRecipe(recipe) {
    const have = [], need = [];
    recipe.ingredients.forEach(ing => {
      const name = typeof ing === 'string' ? ing : ing.name;
      const item = ITEMS.find(i => i.name === name) || ITEMS.find(i => name.includes(i.name) || i.name.includes(name));
      if (item) have.push(item); else need.push(name);
    });
    const expiringInRecipe = recipe.ingredients
      .map(ing => typeof ing === 'string' ? ing : ing.name)
      .filter(name => ITEMS.some(i => (i.name === name || name.includes(i.name) || i.name.includes(name)) && i.remainingDays <= 2));
    return { recipe, have, need, expiringInRecipe };
  }

  // 用户说什么菜就做什么菜；菜库只是帮忙认食材，不替用户换菜
  const INGREDIENT_HINTS = [
    ['鲜鸡蛋', ['鸡蛋', '蛋']], ['番茄', ['番茄', '西红柿']], ['土豆', ['土豆', '马铃薯']],
    ['鸡翅', ['鸡翅']], ['鸡胸肉', ['鸡胸', '鸡肉', '鸡']], ['三文鱼', ['三文鱼', '鱼']],
    ['牛肉', ['牛肉', '牛腩']], ['虾', ['虾']], ['豆腐', ['豆腐']], ['西兰花', ['西兰花', '花椰菜']],
    ['胡萝卜', ['胡萝卜']], ['青椒', ['青椒', '辣椒']], ['洋葱', ['洋葱']], ['蘑菇', ['蘑菇', '菌菇']],
    ['生菜', ['生菜', '青菜', '时蔬', '蔬菜']], ['面条', ['面条', '米线', '拉面']],
    ['吐司面包', ['吐司', '面包', '三明治']], ['全脂牛奶', ['牛奶', '奶昔', '奶茶']],
    ['原味酸奶', ['酸奶']], ['可乐', ['可乐']], ['柠檬', ['柠檬']], ['香肠', ['香肠']],
    ['红苹果', ['苹果']], ['蓝莓', ['蓝莓']]
  ];

  function guessDishMeta(q) {
    if (/汤|炖|煮|煲|火锅/.test(q)) return { emoji: '🍲', minutes: 25 };
    if (/面|米线|粉/.test(q)) return { emoji: '🍜', minutes: 15 };
    if (/奶昔|饮品|果汁|奶茶/.test(q)) return { emoji: '🥤', minutes: 5 };
    if (/蒸|烤/.test(q)) return { emoji: '🍱', minutes: 25 };
    if (/鱼|虾|海鲜/.test(q)) return { emoji: '🐟', minutes: 20 };
    if (/鸡|鸭/.test(q)) return { emoji: '🍗', minutes: 20 };
    if (/肉|排骨|牛/.test(q)) return { emoji: '🍖', minutes: 25 };
    if (/蛋/.test(q)) return { emoji: '🍳', minutes: 12 };
    if (/蔬|菜|西兰花|蘑菇/.test(q)) return { emoji: '🥬', minutes: 12 };
    return { emoji: '🍽️', minutes: 15 };
  }

  function guessDishSteps(q) {
    if (/汤|炖|煮|煲|火锅/.test(q)) return ['食材洗净切好，肉类先焯水去腥。', '冷水下锅，煮开后转小火慢炖入味。', '加盐调味，撒点葱花就能上桌。'];
    if (/奶昔|饮品|果汁|奶茶/.test(q)) return ['水果或食材切成小块。', '全部放进搅拌机，加适量冰水或牛奶。', '打匀倒出，马上喝最香。'];
    if (/蒸|烤/.test(q)) return ['食材处理干净，提前腌制入味。', '上锅蒸或放进烤箱，加热至熟透。', '取出稍放凉即可享用。'];
    if (/炒|煎|炸|爆|拌/.test(q)) return ['食材洗净沥干，切成合适大小。', '热锅下油，先炒主料再放配菜。', '按口味调味，炒匀出锅。'];
    return ['食材洗净，按需要切配。', '按家常做法加热调味。', '装盘即可享用。'];
  }

  function customDishFromQuery(q) {
    const meta = guessDishMeta(q);
    const ingredients = INGREDIENT_HINTS
      .filter(entry => entry[1].some(word => q.includes(word)))
      .map(entry => entry[0]);
    return { id: 'custom-' + Date.now(), name: q, emoji: meta.emoji, minutes: meta.minutes,
      tags: [], ingredients, steps: guessDishSteps(q), custom: true };
  }

  // 联网菜谱 API：TheMealDB（公开免费、支持跨域），把中文口语转成英文检索词
  const API_BASE = 'https://www.themealdb.com/api/json/v1/1/search.php';
  const API_TERM_RULES = [
    [/番茄.{0,3}蛋|西红柿.{0,3}蛋|番茄炒蛋/, 'tomato egg'],
    [/番茄|西红柿/, 'tomato'],
    [/奶油蘑菇汤|蘑菇汤/, 'mushroom soup'],
    [/可乐鸡翅|鸡翅/, 'chicken wings'],
    [/鸡胸/, 'chicken breast'], [/三文鱼|鲑鱼/, 'salmon'],
    [/牛肉|牛腩/, 'beef'], [/虾|海鲜/, 'shrimp'], [/豆腐/, 'tofu'],
    [/蘑菇|菌菇/, 'mushroom'], [/土豆|马铃薯/, 'potato'],
    [/西兰花|花椰菜/, 'broccoli'], [/胡萝卜/, 'carrot'],
    [/减脂|沙拉|轻食/, 'salad'], [/面条|拉面|米线/, 'noodle'],
    [/汤|炖|煲/, 'soup'], [/酸奶/, 'yogurt'], [/牛奶/, 'milk'],
    [/吐司|面包/, 'bread'], [/苹果/, 'apple'], [/鸡蛋|蛋/, 'egg'],
    [/鸡/, 'chicken'], [/鱼/, 'fish'], [/蔬菜|青菜|时蔬/, 'vegetable']
  ];
  const API_ING_CN = {
    'egg': '鲜鸡蛋', 'eggs': '鲜鸡蛋', 'egg yolk': '蛋黄', 'egg whites': '蛋白',
    'tomato': '番茄', 'tomatoes': '番茄', 'cherry tomatoes': '小番茄', 'tomato paste': '番茄酱',
    'salmon': '三文鱼', 'chicken breast': '鸡胸肉', 'chicken breasts': '鸡胸肉', 'chicken': '鸡肉',
    'chicken wings': '鸡翅', 'chicken stock': '高汤', 'stock cube': '高汤块', 'beef': '牛肉',
    'beef mince': '牛肉馅', 'pork': '猪肉', 'bacon': '培根', 'sausage': '香肠',
    'tofu': '豆腐', 'broccoli': '西兰花', 'carrot': '胡萝卜', 'carrots': '胡萝卜',
    'onion': '洋葱', 'onions': '洋葱', 'spring onion': '葱', 'spring onions': '葱',
    'mushroom': '蘑菇', 'mushrooms': '蘑菇', 'shiitake mushrooms': '香菇', 'oyster mushrooms': '平菇',
    'potato': '土豆', 'potatoes': '土豆', 'noodles': '面条', 'rice noodles': '面条',
    'spaghetti': '意大利面', 'rice': '大米', 'flour': '面粉', 'breadcrumbs': '面包糠',
    'milk': '全脂牛奶', 'coconut milk': '椰奶', 'cream': '淡奶油', 'yogurt': '原味酸奶',
    'greek yogurt': '希腊酸奶', 'butter': '黄油', 'cheese': '奶酪', 'cheddar': '切达奶酪',
    'cheddar cheese': '切达奶酪', 'mozzarella': '马苏里拉奶酪', 'parmesan': '帕玛森奶酪',
    'feta': '羊奶酪', 'bread': '吐司面包', 'toast': '吐司面包',
    'apple': '红苹果', 'apples': '红苹果', 'banana': '香蕉', 'mango': '芒果',
    'strawberries': '草莓', 'blueberries': '蓝莓', 'orange': '橙子', 'peach': '桃子',
    'pineapple': '菠萝', 'lemon': '柠檬', 'limes': '青柠', 'lime': '青柠',
    'lemon juice': '柠檬汁', 'lime juice': '青柠汁', 'shrimp': '虾', 'prawns': '虾',
    'garlic': '大蒜', 'ginger': '姜', 'soy sauce': '生抽', 'fish sauce': '鱼露',
    'oyster sauce': '蚝油', 'sesame oil': '香油', 'olive oil': '橄榄油',
    'vegetable oil': '食用油', 'sunflower oil': '食用油', 'vinegar': '醋',
    'balsamic vinegar': '香醋', 'honey': '蜂蜜', 'maple syrup': '枫糖浆',
    'brown sugar': '红糖', 'sugar': '糖', 'salt': '盐', 'black pepper': '黑胡椒',
    'pepper': '胡椒', 'chili powder': '辣椒粉', 'paprika': '甜椒粉', 'cumin seeds': '孜然',
    'ground cumin': '孜然粉', 'turmeric': '姜黄', 'cinnamon': '肉桂', 'cardamom': '小豆蔻',
    'nutmeg': '肉豆蔻', 'cloves': '丁香', 'bay leaves': '香叶', 'rosemary': '迷迭香',
    'thyme': '百里香', 'oregano': '牛至', 'basil': '罗勒', 'parsley': '欧芹',
    'chives': '香葱', 'coriander': '香菜', 'curry powder': '咖喱粉',
    'thai red curry paste': '泰式红咖喱酱', 'mustard': '芥末', 'ketchup': '番茄酱',
    'mayonnaise': '沙拉酱', 'hot sauce': '辣椒酱', 'worcestershire sauce': '伍斯特酱',
    'spinach': '菠菜', 'kale': '羽衣甘蓝', 'cabbage': '卷心菜', 'lettuce': '生菜',
    'cucumber': '黄瓜', 'zucchini': '西葫芦', 'bell pepper': '彩椒',
    'green pepper': '青椒', 'red pepper': '红椒', 'roasted peppers': '烤彩椒',
    'sweetcorn': '甜玉米', 'corn': '玉米', 'peas': '豌豆', 'green beans': '四季豆',
    'cashews': '腰果', 'peanuts': '花生', 'almonds': '杏仁', 'walnuts': '核桃',
    'raisins': '葡萄干', 'sultanas': '葡萄干', 'jam': '果酱', 'water': '清水'
  };

  const API_ING_FALLBACK = [
    [/chicken/i, '鸡肉'], [/beef/i, '牛肉'], [/pork/i, '猪肉'], [/salmon|fish/i, '鱼'],
    [/shrimp|prawn/i, '虾'], [/tomato/i, '番茄'], [/potato/i, '土豆'], [/mushroom/i, '蘑菇'],
    [/pepper/i, '彩椒'], [/onion/i, '洋葱'], [/cheese/i, '奶酪'], [/milk/i, '牛奶'],
    [/sugar/i, '糖'], [/oil/i, '食用油'], [/sauce/i, '调味酱'],
    [/leaf|leaves|herb|parsley|basil|thyme|rosemary|oregano/i, '香草'],
    [/seed/i, '种子'], [/rice/i, '米'], [/bread/i, '面包'], [/egg/i, '蛋'],
    [/berry|apple|orange|lemon|lime|fruit/i, '水果'],
    [/vegetable|greens|spinach|kale|cabbage|lettuce/i, '蔬菜']
  ];

  function cnIngredient(name) {
    const key = String(name || '').toLowerCase().trim();
    if (API_ING_CN[key]) return API_ING_CN[key];
    const hit = API_ING_FALLBACK.find(([re]) => re.test(key));
    return hit ? hit[1] : '食材';
  }

  function queryToApiTerm(q) {
    const s = String(q || '').trim().replace(/^(我想吃|我想要|我想|想吃|来一份|来个|我要|帮我做|帮我|做|吃)/, '').trim();
    if (/^[a-zA-Z\s]+$/.test(s)) return s;
    const picked = [];
    API_TERM_RULES.forEach(([re, term]) => {
      if (re.test(s) && !picked.some(p => p.includes(term) || term.includes(p))) picked.push(term);
    });
    return picked.slice(0, 3).join(' ');
  }

  function mealToRecipe(m, query) {
    const meta = guessDishMeta(query);
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const raw = m['strIngredient' + i];
      if (!raw || !String(raw).trim()) continue;
      const name = String(raw).trim();
      ingredients.push(cnIngredient(name));
    }
    const steps = String(m.strInstructions || '').split(/\r?\n|\n/).map(s => s.trim()).filter(Boolean).slice(0, 6);
    if (!steps.length) steps = ['准备好全部食材。', '按照菜谱说明烹饪调味。', '装盘即可享用。'];
    const origin = m.strMeal || query;
    return {
      id: 'api-' + (m.idMeal || Date.now()),
      name: String(query || origin).trim(),
      apiName: origin,
      emoji: meta.emoji, minutes: meta.minutes,
      ingredients, expiring: [], steps,
      image: m.strMealThumb || '',
      video: { url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(origin + ' 做法')}`, title: origin + ' 做法教程', author: '哔哩哔哩' },
      api: true
    };
  }

  async function fetchApiRecipe(query) {
    const term = queryToApiTerm(query);
    if (!term) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const search = async (word) => {
        const res = await fetch(`${API_BASE}?s=${encodeURIComponent(word)}`, { signal: ctrl.signal });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.meals) ? data.meals : [];
      };
      const meals = await search(term);
      if (!meals.length) return null;
      return mealToRecipe(meals.find(x => x.strYoutube && x.strMealThumb) || meals[0], query);
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function showAiLoading(query) {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card ai-modal" data-stop="1">
        <div class="ai-modal-head"><span class="ai-orb">🍳</span><div class="grow"><h3>正在找做法</h3><p>「${esc(query)}」· 联网匹配菜谱和教学视频</p></div></div>
        <div class="ai-loading"><span class="ai-spinner"></span><span>正在对照冰箱里的食材…</span></div>
      </div>
    </div>`;
  }

  const GENERIC_HINT_WORDS = new Set(['鸡', '鱼', '肉', '虾', '蛋', '奶', '蔬菜', '青菜', '时蔬', '海鲜']);
  function queryIngredientHints(q) {
    return INGREDIENT_HINTS
      .filter(e => e[1].some(w => q.includes(w) && !GENERIC_HINT_WORDS.has(w)))
      .map(e => e[0]);
  }

  function aiResolveRecipe(query) {
    // 去掉口语前缀，避免「我想吃鱼」被「我想/吃」干扰而匹配错菜
    const q = String(query || '').trim().replace(/^(我想吃|我想要|我想|想吃|来一份|来个|我要|吃|做)/, '').trim();
    const all = RECIPES.map(r => ({ ...r, ingredients: r.ingredients.map(x => x.name) }))
      .concat(AI_DISHES.map(d => ({ id: 'ai-' + d.name, name: d.name, emoji: d.emoji, minutes: d.minutes, tags: d.tags, ingredients: d.ingredients, steps: ['准备好所需食材。', '按家常做法烹饪调味。', '装盘即可享用。'] })));

    if (!q) return { recipe: null, mode: 'empty' };

    let hit = null, mode = 'exact';
    // 1) 菜名整体相等或互相包含（只在 2 字以上时判断包含，避免单字误命中）
    hit = all.find(d => d.name === q);
    if (!hit && q.length >= 2) hit = all.find(d => d.name.includes(q) || q.includes(d.name));
    // 2) 标签匹配：用户点名的具体食材必须都被这道菜覆盖，绝不拿别的菜顶替
    if (!hit) {
      const hints = queryIngredientHints(q);
      let best = 0;
      all.forEach(d => {
        const names = (d.ingredients || []).map(x => typeof x === 'string' ? x : x.name);
        const tags = d.tags || [];
        if (hints.length && !hints.every(h => tags.some(t => t === h || t.includes(h) || h.includes(t)) || names.some(n => n === h || n.includes(h) || h.includes(n)))) return;
        let score = 0;
        tags.forEach(t => {
          if (t.length >= 2 && q.includes(t)) score += t.length * 2;
          else if (t.includes(q)) score += q.length;
        });
        if (score > best) { best = score; hit = d; }
      });
      if (hit) mode = 'keyword';
    }
    // 3) 没匹配到就用用户输入的菜名建一道菜，绝不替用户换成别的菜
    if (!hit) return { recipe: customDishFromQuery(q), mode: 'custom' };
    return { recipe: hit, mode };
  }

  function showAiModal() {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card ai-modal" data-stop="1">
        <div class="ai-modal-head">
          <span class="ai-orb">🍳</span>
          <div class="grow"><h3>今天吃什么</h3><p>先说想吃什么，再帮你对照冰箱</p></div>
          <button class="al-close" data-action="close-ai" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="ai-input-row">
          <input id="ai-input" class="ai-input" placeholder="任意菜名都可以，比如：麻辣香锅、奶油蘑菇汤…" />
          <button class="btn btn-primary" data-action="ai-submit">看看怎么做</button>
        </div>
        <div class="ai-chips">
          ${RECIPES.map(r => `<button class="ai-chip" data-action="ai-quick" data-q="${esc(r.name)}">${dishIcon(r.emoji)} ${esc(r.name)}</button>`).join('')}
          <button class="ai-chip" data-action="ai-quick" data-q="可乐鸡翅">🍗 可乐鸡翅</button>
          <button class="ai-chip" data-action="ai-quick" data-q="麻辣香锅">🌶️ 麻辣香锅</button>
          <button class="ai-chip" data-action="ai-quick" data-q="减脂餐">🥗 减脂餐</button>
        </div>
        <div class="ai-footnote">联网识别你想做的菜，自动找做法和教学视频，再对照冰箱算要买的食材</div>
      </div>
    </div>`;
    setTimeout(() => { const el = $('#ai-input'); if (el) el.focus(); }, 50);
  }

  let aiResultSeq = 0;
  async function renderAiResult(query) {
    const q = String(query || '').trim();
    if (!q) { toast('先说说想吃什么菜'); const el = $('#ai-input'); if (el) el.focus(); return; }
    const seq = ++aiResultSeq;
    const normalized = q.replace(/\s+/g, '');
    const exactRecipe = RECIPES.find(r => r.name.replace(/\s+/g, '') === normalized);
    let result;
    if (exactRecipe) {
      result = { recipe: exactRecipe, mode: 'exact' };
    } else if (AI_DISHES.some(d => d.name.replace(/\s+/g, '') === normalized)) {
      result = aiResolveRecipe(q);
    } else {
      showAiLoading(q);
      const apiRecipe = await fetchApiRecipe(q);
      if (seq !== aiResultSeq || !modalRoot.querySelector('.ai-modal')) return;
      result = apiRecipe ? { recipe: apiRecipe, mode: 'api' } : aiResolveRecipe(q);
    }
    const { recipe, mode } = result;
    STATE.aiDish = recipe;
    const { have, need, expiringInRecipe } = aiAnalyzeRecipe(recipe);
    need.forEach(n => { const sku = skuByName(n); if (sku) addToCart(sku, null); });
    const chipHtml = have.length
      ? have.map(i => `<span class="ai-have-chip ${i.freshness}">${foodIcon(i.name, i.icon)} ${esc(i.name)} · 剩${i.remainingDays}天</span>`).join('')
      : '<span class="ai-none">冰箱里没找到这道菜的明确用料</span>';
    const needHtml = need.length
      ? need.map(n => `<span class="ai-need-chip">＋ ${esc(n)}</span>`).join('')
      : '<span class="ai-none">暂时不用补货 🎉</span>';
    const expiringTip = expiringInRecipe.length
      ? `<div class="ai-tip">⏰ 正好能用掉快到期的：<b>${expiringInRecipe.map(esc).join('、')}</b>，今天做正合适</div>` : '';
    const customTip = mode === 'custom'
      ? '<div class="ai-tip">联网没找到这道菜的现成做法，先按你说的菜名整理了步骤和用料；要买什么可以随手加到补货清单。</div>' : '';
    const modeText = mode === 'api' ? '联网找到做法，已对照你的冰箱'
      : mode === 'custom' ? '按你想的菜整理好了，再看看冰箱里有什么'
      : mode === 'keyword' ? '按你说的口味找到这道菜' : '按菜名对照了冰箱里的食材';
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card ai-modal ai-result" data-stop="1">
        <div class="ai-modal-head">
          <span class="ai-orb">🍳</span>
          <div class="grow"><h3>按你想的来做</h3><p>${modeText}</p></div>
          <button class="al-close" data-action="close-ai" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="ai-dish"><span class="ai-dish-emoji">${dishIcon(recipe.emoji)}</span><div><h4>${esc(recipe.name)}</h4><p>⏱ ${recipe.minutes} 分钟 · ${recipe.steps.length} 步完成</p></div></div>
        ${expiringTip}${customTip}
        <div class="ai-sec"><h5>✅ 冰箱里能用上（${have.length}）</h5><div class="ai-chips-static">${chipHtml}</div></div>
        <div class="ai-sec"><h5>🛒 建议补货（${need.length}）</h5><div class="ai-chips-static">${needHtml}</div></div>
        <div class="ai-summary">已有 ${have.length} 样 · 需补 ${need.length} 样${expiringInRecipe.length ? ' · 用掉快到期食材 ' + expiringInRecipe.length + ' 样' : ''}</div>
        <div class="ai-actions">
          ${need.length ? `<button class="btn btn-primary grow" data-action="go-cart">已加入购物车 · 去结算</button>` : ''}
          <button class="btn btn-ghost grow" data-action="ai-view-steps">看详细做法</button>
        </div>
        ${recipe.video ? `<a class="btn btn-ghost btn-block" href="${esc(recipe.video.url)}" target="_blank" rel="noopener noreferrer" style="margin-top:8px">▶ 看教学视频 · ${esc(recipe.video.author)}</a>` : ''}
        <button class="ai-change" data-action="ai-change">换个菜名</button>
      </div>
    </div>`;
  }

  function showPairGuide() {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">📶</div>
          <div class="grow"><h3>重新配网指引</h3><p>按以下步骤完成设备联网</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="pair-guide">
          <div class="pg-step"><span class="pg-num">1</span><span>长按冰箱屏幕电源键 3 秒，屏幕亮起后进入配网。</span></div>
          <div class="pg-step"><span class="pg-num">2</span><span>用手机扫描屏幕二维码，连接「鲜知」配网热点，输入家庭 Wi-Fi 密码。</span></div>
          <div class="pg-step"><span class="pg-num">3</span><span>用手机背部靠近冰箱右下角 NFC 感应区，完成设备绑定。</span></div>
          <div class="pg-step"><span class="pg-num">4</span><span>五个区域都准备好了：上层 / 中层 / 下层 / 果蔬抽屉 / 冷冻室。</span></div>
        </div>
        <div class="modal-actions"><button class="btn btn-primary btn-block" data-action="close-app-layer">知道了</button></div>
      </div>
    </div>`;
  }

  // 配菜推荐菜品的详细做法（可能不在固定食谱库里，从 STATE.aiDish 读取）
  function showAiSteps() {
    const r = STATE.aiDish;
    if (!r) { toast('请先选一道菜'); return; }
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${dishIcon(r.emoji)}</div>
          <div class="grow"><h3>${esc(r.name)}</h3><p>⏱ ${r.minutes} 分钟 · 家常做法</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="pair-guide">
          ${r.steps.map((s, i) => `<div class="pg-step"><span class="pg-num">${i+1}</span><span>${esc(s)}</span></div>`).join('')}
        </div>
        ${r.video ? `<a class="video-card" href="${esc(r.video.url)}" target="_blank" rel="noopener noreferrer" style="margin-top:12px">
          <span class="vc-play">▶</span><span class="grow"><b>${esc(r.video.title)}</b><small>点击观看完整做法</small></span><span class="vc-go">观看 ›</span>
        </a>` : ''}
        <div class="modal-actions"><button class="btn btn-primary btn-block" data-action="close-app-layer">知道了</button></div>
      </div>
    </div>`;
  }

  // 朴朴超市采购窗口：列出待补项，跳转朴朴，回来后可标记已补齐并实时从清单移除
  function showPupuModal() {
    const pending = STATE.restock.filter(r => r.status === '待补');
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon" style="background:linear-gradient(135deg,#3DBE6B,#0E7C3A);color:#fff">朴</div>
          <div class="grow"><h3>去朴朴超市采购</h3><p>清单已同步 · 共 ${pending.length} 项待补</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="pupu-tip">打开朴朴超市，买完回来点「标记已补齐」，食材会自动入库并从清单里划掉。</div>
        ${pending.length ? `<div class="ck-list">${pending.map(r => `<div class="ck-row">
          <span class="ck-emoji">${emojiFor(r.name)}</span>
          <div class="grow"><div class="ck-name">${esc(r.name)}</div><div class="ck-meta">建议 ${r.suggestQty}${esc(r.unit)} · ${esc(r.source)}</div></div>
        </div>`).join('')}</div>` : '<div class="muted" style="margin-bottom:12px">当前没有待补货商品 🎉</div>'}
        <div class="modal-actions">
          <button class="btn btn-ghost grow" data-action="pupu-mark" ${pending.length ? '' : 'disabled style="opacity:.5"'}>标记已补齐</button>
          <button class="btn btn-primary grow" data-action="pupu-open-app">打开朴朴 App</button>
        </div>
      </div>
    </div>`;
  }

  // 打开朴朴：跳转官方 deeplink（唤起 App / 引导下载）
  function openPupuApp() {
    const url = 'https://ma.pupumall.com/deeplink';
    toast('正在打开朴朴…');
    try { window.location.href = url; }
    catch (e) { window.open(url, '_blank'); }
  }

  // 标记朴朴已补齐：待补项全部入库并从清单移除（去重，只显示一次）
  function pupuMarkAll() {
    const pending = STATE.restock.filter(r => r.status === '待补');
    if (!pending.length) { toast('没有待补货商品'); return; }
    const today = TODAY;
    pending.forEach(r => {
      const sku = skuByName(r.name);
      const preset = sku ? PURCHASE_PRESETS[sku] : null;
      const existing = ITEMS.find(i => i.name === r.name);
      if (existing) {
        existing.quantity += (preset ? preset.qty : r.suggestQty);
        existing.freshness = 'green'; existing.freshPct = 100;
        existing.remainingDays = preset ? preset.shelfDays : 7;
        existing.purchaseDate = today;
        existing.source = '朴朴采购';
      } else {
        const shelf = preset ? preset.shelfDays : 7;
        const exp = new Date(today); exp.setDate(exp.getDate() + shelf);
        const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        ITEMS.push({
          id: 'it-' + Date.now() + '-' + r.id, name: r.name, icon: iconForFood(r.name),
          layer: preset ? preset.layer : defaultLayerForFood(r.name),
          purchaseDate: today, expiryDate: iso(exp), remainingDays: shelf,
          freshness: 'green', freshPct: 100, quantity: preset ? preset.qty : r.suggestQty,
          unit: r.unit, source: '朴朴采购'
        });
      }
    });
    STATE.restock = STATE.restock.filter(r => r.status !== '待补');
    STATE.checked.clear();
    closeModal(); renderApp();
    toast(`已补齐 ${pending.length} 项并同步冰箱食材库`);
  }

  // ============ 一句话录入食材：按常见说法解析成食材清单 ============
  // 词库：常见食材 → 默认单位 / 保质天数（供解析与入库使用）
  const FOOD_DICT = [
    { name: '鲜鸡蛋', unit: '枚', days: 10, alias: ['鸡蛋', '蛋', '土鸡蛋'] },
    { name: '全脂牛奶', unit: '盒', days: 8, alias: ['牛奶', '纯牛奶'] },
    { name: '原味酸奶', unit: '杯', days: 7, alias: ['酸奶'] },
    { name: '吐司面包', unit: '袋', days: 7, alias: ['吐司', '面包'] },
    { name: '切片奶酪', unit: '盒', days: 15, alias: ['奶酪', '芝士'] },
    { name: '橙汁', unit: '瓶', days: 10, alias: ['橙汁', '果汁'] },
    { name: '三文鱼', unit: '块', days: 4, alias: ['三文鱼', '鱼'] },
    { name: '豆腐', unit: '盒', days: 5, alias: ['豆腐'] },
    { name: '鸡胸肉', unit: '块', days: 3, alias: ['鸡胸肉', '鸡胸', '鸡肉'] },
    { name: '香肠', unit: '根', days: 7, alias: ['香肠', '火腿肠'] },
    { name: '西兰花', unit: '颗', days: 6, alias: ['西兰花', '花椰菜'] },
    { name: '番茄', unit: '个', days: 5, alias: ['番茄', '西红柿'] },
    { name: '红苹果', unit: '个', days: 12, alias: ['苹果', '红苹果'] },
    { name: '胡萝卜', unit: '根', days: 10, alias: ['胡萝卜'] },
    { name: '生菜', unit: '颗', days: 4, alias: ['生菜', '青菜'] },
    { name: '蓝莓', unit: '盒', days: 6, alias: ['蓝莓'] },
    { name: '柠檬', unit: '个', days: 12, alias: ['柠檬'] },
    { name: '速冻水饺', unit: '袋', days: 90, alias: ['水饺', '速冻水饺', '饺子'] },
    { name: '冰淇淋', unit: '盒', days: 90, alias: ['冰淇淋', '雪糕'] }
  ];
  // 解析「买了6个鸡蛋和2盒牛奶，放冷藏」这类句子
  function parseFoodText(text) {
    const s = String(text || '');
    const found = [];
    FOOD_DICT.forEach(f => {
      const alias = f.alias.find(a => s.includes(a));
      if (!alias) return;
      // 就近找数量：中文习惯「6个鸡蛋」（数量在别名前），其次「鸡蛋 2 盒」（数量在后）
      let qty = 1, unit = f.unit;
      const pos = s.indexOf(alias);
      const before = s.slice(Math.max(0, pos - 4), pos);        // 别名前最多 4 字
      const after = s.slice(pos + alias.length, pos + alias.length + 4); // 别名后最多 4 字
      // 优先取紧挨别名前的「数字+单位」（如 6个|_鸡蛋）
      const mBefore = before.match(/(\d+)\s*([个盒枚袋瓶根颗块份只])?\s*$/);
      // 其次取紧挨别名后的「数字+单位」（如 鸡蛋|2盒）
      const mAfter = after.match(/^\s*(\d+)\s*([个盒枚袋瓶根颗块份只])?/);
      if (mBefore && mBefore[1]) { qty = Math.max(1, Math.min(99, parseInt(mBefore[1], 10))); if (mBefore[2]) unit = mBefore[2]; }
      else if (mAfter && mAfter[1]) { qty = Math.max(1, Math.min(99, parseInt(mAfter[1], 10))); if (mAfter[2]) unit = mAfter[2]; }
      let layer = defaultLayerForFood(f.name);
      if (/冷冻|冻层/.test(s) || /冻/.test(f.name)) layer = '冷冻室';
      else if (/果蔬|蔬菜层/.test(s)) layer = '果蔬抽屉';
      else if (/上层/.test(s)) layer = '冷藏室上层';
      else if (/下层/.test(s)) layer = '冷藏室下层';
      else if (/中层/.test(s)) layer = '冷藏室中层';
      found.push({ name: f.name, qty, unit, layer, days: f.days });
    });
    return found;
  }

  // 一句话录入面板：作为「添加食材」弹窗里的一种方式
  function textAddPanel() {
    return `<div class="text-add">
        <div class="ai-input-row">
          <input id="ai-food-input" class="ai-input" placeholder="例如：买了6个鸡蛋和2盒牛奶放冷藏" />
          <button class="mic-btn" data-action="voice-text" aria-label="语音输入">${dishIcon('🎤')}</button>
          <button class="btn btn-primary" data-action="entry-parse">识别</button>
        </div>
        <div class="ai-chips">
          <button class="ai-chip" data-action="entry-fill" data-q="买了6个鸡蛋和2盒牛奶，放冷藏中层">6个鸡蛋+2盒牛奶</button>
          <button class="ai-chip" data-action="entry-fill" data-q="冷冻室加了1袋速冻水饺和2盒冰淇淋">冷冻水饺+冰淇淋</button>
          <button class="ai-chip" data-action="entry-fill" data-q="买了3个番茄、1颗西兰花和5个鸡蛋">番茄西兰花鸡蛋</button>
        </div>
        <div id="entry-result"></div>
      </div>`;
  }

  // 批量录入：一行一样，先预览再一起入库
  function batchPanel() {
    return `<div class="batch-entry">
        <p>每行写一样食材，例如：<b>鸡蛋 6个</b>，也可以写「6个鸡蛋放冷藏」。</p>
        <textarea id="batch-input" rows="6" placeholder="鲜鸡蛋 6枚&#10;全脂牛奶 2盒&#10;番茄 4个&#10;冷冻水饺 1袋"></textarea>
        <div class="batch-actions">
          <button class="ai-chip" data-action="batch-fill">填入示例</button>
          <button class="btn btn-primary" data-action="batch-parse">识别清单</button>
        </div>
        <div id="batch-result"></div>
      </div>`;
  }
  function parseBatchLine(line) {
    const s = String(line || '').trim();
    if (!s) return null;
    const bySentence = parseFoodText(s);
    if (bySentence.length) return bySentence[0];
    const m = s.match(/^(.+?)\s*(\d+(?:\.\d+)?)\s*([个只枚盒袋瓶份杯根颗块斤两包]?)\s*$/);
    if (m && m[1].trim()) {
      const name = m[1].trim();
      return { name, qty: +m[2], unit: m[3] || '份', layer: defaultLayerForFood(name), days: 7 };
    }
    return { name: s, qty: 1, unit: '份', layer: defaultLayerForFood(s), days: 7 };
  }
  function batchParse(text) {
    const list = String(text || '').split(/\n+/).map(parseBatchLine).filter(Boolean);
    const box = $('#batch-result');
    if (!box) return;
    if (!list.length) { box.innerHTML = '<div class="ai-tip" style="margin:0">每行写一样食材，比如「鸡蛋 6个」。</div>'; return; }
    box.innerHTML = `<div class="ai-sec" style="margin-top:12px"><h5>识别到 ${list.length} 样，确认后一起入库</h5>
      <div class="ck-list" style="max-height:30vh">
        ${list.map(p => `<div class="ck-row">
          <span class="ck-emoji">${iconForFood(p.name)}</span>
          <div class="grow"><div class="ck-name">${esc(p.name)}</div><div class="ck-meta">${esc(p.layer)} · 保质 ${p.days} 天</div></div>
          <span class="ck-days">${p.qty}${esc(p.unit)}</span>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary btn-block" data-action="batch-confirm">✓ 全部入库</button>
    </div>`;
    box.dataset.batch = JSON.stringify(list);
  }
  function batchConfirm() {
    const box = $('#batch-result');
    if (!box || !box.dataset.batch) return;
    const list = JSON.parse(box.dataset.batch);
    const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const added = [];
    list.forEach(p => {
      const existing = ITEMS.find(i => i.name === p.name);
      if (existing) {
        existing.quantity += p.qty; existing.source = '批量录入';
        added.push({ name: p.name, layer: existing.layer });
        return;
      }
      const exp = new Date(TODAY); exp.setDate(exp.getDate() + p.days);
      ITEMS.push({
        id: 'it-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: p.name, icon: iconForFood(p.name), layer: p.layer,
        purchaseDate: TODAY, expiryDate: iso(exp), remainingDays: p.days,
        freshness: p.days <= 1 ? 'red' : p.days === 2 ? 'yellow' : 'green',
        freshPct: p.days <= 1 ? 15 : p.days === 2 ? 40 : 90,
        quantity: p.qty, unit: p.unit, source: '批量录入'
      });
      added.push({ name: p.name, layer: p.layer });
    });
    closeModal(); renderApp(); announceAdded(added);
  }
  function entryParse(text) {
    const parsed = parseFoodText(text);
    const box = $('#entry-result');
    if (!box) return;
    if (!parsed.length) {
      box.innerHTML = '<div class="ai-tip" style="margin:0">没找到这个食材，试试「6个鸡蛋」「2盒牛奶」这样的说法，或者切到「手动」添加。</div>';
      return;
    }
    box.innerHTML = `<div class="ai-sec" style="margin-top:12px"><h5>找到 ${parsed.length} 样食材，确认后入库</h5>
      <div class="ck-list" style="max-height:34vh">
        ${parsed.map((p) => `<div class="ck-row">
          <span class="ck-emoji">${iconForFood(p.name)}</span>
          <div class="grow"><div class="ck-name">${esc(p.name)}</div><div class="ck-meta">${esc(p.layer)} · 保质 ${p.days} 天</div></div>
          <span class="ck-days">${p.qty}${esc(p.unit)}</span>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary btn-block" data-action="entry-confirm">✓ 入库这 ${parsed.length} 样</button>
    </div>`;
    box.dataset.parsed = JSON.stringify(parsed);
  }
  function entryConfirm() {
    const box = $('#entry-result');
    if (!box || !box.dataset.parsed) return;
    const parsed = JSON.parse(box.dataset.parsed);
    const added = [];
    parsed.forEach(p => {
      const existing = ITEMS.find(i => i.name === p.name);
      if (existing) {
        existing.quantity += p.qty; existing.source = '快速录入';
        added.push({ name: p.name, layer: existing.layer });
      } else {
        const exp = new Date(TODAY); exp.setDate(exp.getDate() + p.days);
        const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        ITEMS.push({
          id: 'it-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          name: p.name, icon: iconForFood(p.name), layer: p.layer,
          purchaseDate: TODAY, expiryDate: iso(exp), remainingDays: p.days,
          freshness: 'green', freshPct: 95, quantity: p.qty, unit: p.unit, source: '快速录入'
        });
        added.push({ name: p.name, layer: p.layer });
      }
    });
    closeModal(); renderApp(); announceAdded(added);
  }

  // 添加食材弹窗：拍照固定批量，手动可选单件/批量，一句话不做单批量切换
  let addMode = 'manual';
  let addBatch = false;
  let voiceRecognition = null;
  function stopVoice() {
    if (voiceRecognition) { try { voiceRecognition.stop(); } catch (e) {} voiceRecognition = null; }
    $$('.mic-btn').forEach(b => b.classList.remove('listening'));
  }
  function startVoice(type) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('当前浏览器不支持语音识别，请用 Chrome 或 Edge 打开'); return; }
    stopVoice();
    const rec = new SR();
    rec.lang = 'zh-CN'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => { $$('.mic-btn').forEach(b => b.classList.add('listening')); toast('正在听，请说出食材'); };
    rec.onresult = (e) => {
      const text = (e.results[0][0].transcript || '').trim();
      if (!text) return;
      if (type === 'text') {
        const inp = $('#ai-food-input'); if (inp) inp.value = text;
        entryParse(text); toast('已识别：' + text);
      } else {
        const parsed = parseFoodText(text);
        if (parsed.length) {
          const p = parsed[0];
          const set = (id, val) => { const el = $('#' + id); if (el) el.value = val; };
          set('af-name', p.name); set('af-qty', p.qty); set('af-unit', p.unit); set('af-days', p.days);
          const layers = currentLayers();
          const layerBox = $('#af-layer');
          const picked = layers.includes(p.layer) ? p.layer : layers[0];
          if (layerBox) {
            layerBox.dataset.layer = picked;
            $$('.layer-chip', layerBox).forEach(b => b.classList.toggle('active', b.dataset.layer === picked));
          }
          toast('已识别：' + parsed.map(x => x.name).join('、'));
        } else {
          const el = $('#af-name'); if (el) el.value = text;
          toast('已识别：' + text);
        }
      }
    };
    rec.onerror = (ev) => { toast(ev.error === 'not-allowed' ? '请允许麦克风权限' : '语音识别失败，请重试'); };
    rec.onend = () => { $$('.mic-btn').forEach(b => b.classList.remove('listening')); voiceRecognition = null; };
    voiceRecognition = rec;
    try { rec.start(); } catch (e) { toast('语音识别启动失败'); }
  }

  function addPanelHtml() {
    if (addMode === 'photo') {
      return `<div class="add-camera">
          <label for="af-photos"><span class="ac-orb">${dishIcon('📷')}</span><p>上传 1 张或多张食材照片，都能识别入库</p></label>
          <input type="file" id="af-photos" accept="image/*" capture="environment" multiple />
        </div>
        <div class="add-preview" id="ap-preview"></div>`;
    }
    if (addMode === 'manual' && addBatch) return batchPanel();
    if (addMode === 'manual') {
      const layers = currentLayers();
      const defaultLayer = layers[0];
      return `<div class="add-quick">
          <button class="aq-btn" data-action="add-tab" data-mode="photo">${dishIcon('📷')} 拍照识别</button>
          <button class="aq-btn" data-action="add-tab" data-mode="text">${dishIcon('💬')} 一句话录入</button>
        </div>
        <div class="add-field"><label>食材名称</label>
          <div class="input-with-mic"><input id="af-name" placeholder="如：鸡蛋、牛奶、西兰花" /><button class="mic-btn" data-action="voice-manual" aria-label="语音输入">${dishIcon('🎤')}</button></div>
        </div>
        <div class="add-field"><label>所在层</label>
          <div class="layer-picker" id="af-layer" data-layer="${esc(defaultLayer)}">
            ${layers.map(l => `<button type="button" class="layer-chip ${l === defaultLayer ? 'active' : ''}" data-action="pick-layer" data-layer="${esc(l)}">${esc(l)}</button>`).join('')}
          </div>
        </div>
        <div class="add-row">
          <div class="add-field"><label>数量</label><input id="af-qty" type="number" min="1" value="1" /></div>
          <div class="add-field"><label>单位</label><input id="af-unit" value="份" /></div>
        </div>
        <div class="add-field"><label>保质期（天）</label><input id="af-days" type="number" min="0" value="7" /></div>`;
    }
    if (addMode === 'text') return textAddPanel();
    return batchPanel();
  }
  function addSubtitle() {
    if (addMode === 'photo') return '上传 1 张或多张照片，自动识别入库';
    if (addMode === 'manual' && addBatch) return '一次记多件，确认后一起入库';
    if (addMode === 'manual') return '手动填写，也可以点话筒说出来';
    return '说一句或写一句，自动拆成食材';
  }
  function addPrimaryLabel() {
    if (addMode === 'photo') return '识别并入库';
    return (addMode === 'text' || (addMode === 'manual' && addBatch)) ? '识别食材' : '确认添加';
  }
  function bindAddPanel() {
    if (addMode === 'photo') {
      const files = $('#af-photos');
      if (files) files.addEventListener('change', () => {
        const pv = $('#ap-preview'); pv.style.display = 'block';
        pv.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:6px">🔍 照片识别到 3 样食材：</div>' +
          [['鲜鸡蛋','6 枚','冷藏室中层'],['全脂牛奶','1 盒','冷藏室上层'],['番茄','4 个','果蔬抽屉']].map(x => `<div class="ap-row"><span>🥗</span><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
        pv.dataset.photoBatch = '1';
      });
    }
  }
  function renderAddPanel() {
    stopVoice();
    const panel = $('#add-panel');
    if (!panel) return;
    panel.innerHTML = addPanelHtml();
    const sub = $('#add-subtitle'); if (sub) sub.textContent = addSubtitle();
    const save = $('[data-action="add-save"]'); if (save) save.textContent = addPrimaryLabel();
    $$('.add-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === addMode));
    $$('.batch-seg').forEach(b => b.classList.toggle('active', (b.dataset.batch === 'batch') === addBatch));
    bindAddPanel();
  }
  function showAddModal(mode) {
    stopVoice();
    addMode = mode || 'manual';
    addBatch = false;
    renderAddModal();
    if (addMode === 'text') setTimeout(() => { const el = $('#ai-food-input'); if (el) el.focus(); }, 50);
  }
  function renderAddModal() {
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">${dishIcon('🧺')}</div>
          <div class="grow"><h3>添加食材</h3><p id="add-subtitle">${addSubtitle()}</p></div>
          <button class="al-close" data-action="close-app-layer" aria-label="关闭">${ICON.x}</button>
        </div>
        <div class="add-tabs">
          <button class="add-tab ${addMode==='manual'?'active':''}" data-action="add-tab" data-mode="manual">${dishIcon('✍️')} 手动<i>推荐</i></button>
          <button class="add-tab ${addMode==='photo'?'active':''}" data-action="add-tab" data-mode="photo">${dishIcon('📷')} 拍照</button>
          <button class="add-tab ${addMode==='text'?'active':''}" data-action="add-tab" data-mode="text">${dishIcon('💬')} 一句话</button>
        </div>
        ${addMode === 'manual' ? `<div class="batch-toggle">
          <button class="batch-seg ${!addBatch?'active':''}" data-action="add-batch" data-batch="single">单件</button>
          <button class="batch-seg ${addBatch?'active':''}" data-action="add-batch" data-batch="batch">批量</button>
        </div>` : ''}
        <div id="add-panel"></div>
        <div class="modal-actions" style="margin-top:14px">
          <button class="btn btn-ghost grow" data-action="close-app-layer">取消</button>
          <button class="btn btn-primary grow" data-action="add-save">${addPrimaryLabel()}</button>
        </div>
      </div>
    </div>`;
    renderAddPanel();
  }
  function addNewItem(name, qty, unit, layer, days, silent) {
    name = String(name || '').trim();
    if (!name) { toast('请输入食材名称'); return false; }
    const exp = new Date(TODAY); exp.setDate(exp.getDate() + days);
    const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const existing = ITEMS.find(i => i.name === name);
    const targetLayer = existing ? existing.layer : (layer || defaultLayerForFood(name));
    if (existing) {
      existing.quantity += qty;
    } else {
      ITEMS.push({
        id: 'it-' + Date.now(), name, icon: iconForFood(name), layer: targetLayer,
        purchaseDate: TODAY, expiryDate: iso(exp), remainingDays: days,
        freshness: days <= 1 ? 'red' : days === 2 ? 'yellow' : 'green',
        freshPct: days <= 1 ? 15 : days === 2 ? 40 : 90,
        quantity: qty, unit: unit || '份', source: '手动添加'
      });
    }
    renderApp();
    if (!silent) announceAdded([{ name, layer: targetLayer }]);
    return { name, layer: targetLayer };
  }
  function addSave() {
    if (addMode === 'photo') {
      const pv = $('#ap-preview');
      if (!pv || !pv.dataset.photoBatch) { toast('请先上传食材照片'); return; }
      const added = [
        addNewItem('鲜鸡蛋', 6, '枚', '冷藏室中层', 8, true),
        addNewItem('全脂牛奶', 1, '盒', '冷藏室上层', 8, true),
        addNewItem('番茄', 4, '个', '果蔬抽屉', 7, true)
      ];
      closeModal(); announceAdded(added);
      return;
    }
    if (addMode === 'text') {
      entryParse(($('#ai-food-input') && $('#ai-food-input').value) || '');
      return;
    }
    if (addMode === 'manual' && addBatch) {
      batchParse(($('#batch-input') && $('#batch-input').value) || '');
      return;
    }
    if (addMode === 'manual') {
      const name = $('#af-name') && $('#af-name').value;
      const qty = +($('#af-qty') && $('#af-qty').value || 1);
      const unit = ($('#af-unit') && $('#af-unit').value) || '份';
      const layer = ($('#af-layer') && $('#af-layer').dataset.layer) || '冷藏室上层';
      const days = +($('#af-days') && $('#af-days').value || 7);
      if (addNewItem(name, qty, unit, layer, days)) closeModal();
    }
  }

  function addToCart(sku, rid) {
    const p = PRODUCTS.find(x => x.sku === sku);
    if (!p) return;
    const exist = STATE.cart.find(c => c.sku === sku);
    if (exist) exist.qty += 1;
    else STATE.cart.push({ sku, name: p.name, qty: 1, fromRestockId: rid || null });
    if (rid) {
      const r = STATE.restock.find(x => x.id === rid);
      if (r) r.status = '已加购';
    }
  }
  function processDupQueue() {
    if (!dupQueue.length) {
      const goCart = pendingGoCart;
      pendingGoCart = false;
      if (goCart) STATE.appPage = 'cart';
      renderApp(); toast('已加入购物车'); return;
    }
    const next = dupQueue.shift();
    if (!showDuplicateModal(next.sku, next.rid)) processDupQueue();
  }

  /* ==================== 品牌开场动画 ==================== */
  function startIntro(onDone) {
    if (!introRoot) { if (onDone) onDone(); return; }
    let finished = false;
    introRoot.className = 'intro-root active';
    introRoot.innerHTML = `
      <div class="intro-mask"></div>
      <button class="intro-skip" type="button">跳过</button>
      <div class="intro-center">
        <div class="brand-fridge">
          <div class="bf-foods">
            <span class="bf-food bf-food-1">🥛</span>
            <span class="bf-food bf-food-2">🥬</span>
            <span class="bf-food bf-food-3">🐟</span>
            <span class="bf-food bf-food-4">🍗</span>
          </div>
          <div class="bf-door bf-door-left"></div>
          <div class="bf-door bf-door-right"></div>
          <span class="bf-handle bf-handle-left"></span>
          <span class="bf-handle bf-handle-right"></span>
        </div>
        <div class="intro-brand">
          <h1>鲜知</h1>
          <p>管好冰箱，减少浪费</p>
        </div>
      </div>`;
    const finish = () => {
      if (finished) return;
      finished = true;
      introRoot.onclick = null;
      introRoot.classList.add('closing');
      setTimeout(() => {
        introRoot.className = 'intro-root';
        introRoot.innerHTML = '';
        if (onDone) onDone();
      }, 320);
    };
    introRoot.onclick = () => finish();
    requestAnimationFrame(() => {
      introRoot.classList.add('open');
      setTimeout(() => introRoot.classList.add('brand-in'), 700);
      setTimeout(finish, 2000);
    });
  }

  /* ==================== 新手引导教程 ==================== */
  function beginTourDemo() {
    if (tourSnapshot) return;
    tourSnapshot = {
      items: ITEMS.map(x => ({ ...x })),
      restock: STATE.restock.map(x => ({ ...x })),
      cart: STATE.cart.map(x => ({ ...x })),
      checked: new Set(STATE.checked),
      appPage: STATE.appPage,
      homeModule: STATE.homeModule
    };
    ITEMS.splice(0, ITEMS.length);
    STATE.restock = [];
    STATE.cart = [];
    STATE.checked.clear();
    STATE.appPage = 'home';
    STATE.homeModule = 'expiry';
  }

  function restoreTourDemo() {
    if (!tourSnapshot) return;
    ITEMS.splice(0, ITEMS.length, ...tourSnapshot.items.map(x => ({ ...x })));
    STATE.restock = tourSnapshot.restock.map(x => ({ ...x }));
    STATE.cart = tourSnapshot.cart.map(x => ({ ...x }));
    STATE.checked = new Set(tourSnapshot.checked);
    STATE.appPage = tourSnapshot.appPage;
    STATE.homeModule = tourSnapshot.homeModule || 'expiry';
    tourSnapshot = null;
    renderApp();
  }

  function startTour(onDone) {
    if (tourActive || !tourRoot) return;
    tourActive = true;
    tourStep = 0;
    tourDoneCallback = onDone || null;
    tourStepToken += 1;
    closeModal();
    toastRoot.innerHTML = '';
    document.body.classList.add('tour-active');
    beginTourDemo();
    appEl.scrollTop = 0;
    renderApp();
    tourRoot.className = 'tour-root';
    tourRoot.innerHTML = `
      <div class="tour-spotlight"></div>
      <div class="tour-card" role="dialog" aria-live="polite">
        <button class="tour-skip" type="button" data-tour-action="skip">跳过</button>
        <div class="tour-kicker">实操引导 · <span class="tour-count-current">1</span>/${TOUR_STEPS.length}</div>
        <h3 class="tour-title"></h3>
        <p class="tour-desc"></p>
        <div class="tour-hint">👆 点高亮区域即可实操继续</div>
        <div class="tour-dots"></div>
        <div class="tour-actions">
          <button class="tour-prev" type="button" data-tour-action="prev">上一步</button>
          <button class="tour-next" type="button" data-tour-action="next">下一步</button>
        </div>
      </div>`;
    const spotlight = tourRoot.querySelector('.tour-spotlight');
    spotlight.addEventListener('click', handleTourSpotlightClick);
    renderTourStep();
    requestAnimationFrame(syncTourSpotlight);
  }

  function showTourStepCard() {
    const root = tourRoot;
    if (!root || !tourActive) return;
    const card = root.querySelector('.tour-card');
    const spotlight = root.querySelector('.tour-spotlight');
    card.classList.remove('waiting');
    spotlight.style.opacity = '1';
    spotlight.style.pointerEvents = 'auto';
    card.classList.remove('step-in');
    void card.offsetWidth;
    card.classList.add('step-in');
    requestAnimationFrame(updateTourPosition);
  }

  function scrollTourTargetIntoView(selector, done) {
    const target = selector ? $(selector) : null;
    if (!target) { setTimeout(done, 120); return; }
    const appRect = appEl.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const targetTop = rect.top - appRect.top + appEl.scrollTop;
    const viewH = appEl.clientHeight;
    const overflow = Math.max(0, rect.height - (viewH - 96));
    const top = Math.max(0, targetTop - 68 + overflow);
    appEl.scrollTo({ top, behavior: 'smooth' });
    setTimeout(done, 520);
  }

  function renderTourStep() {
    const root = tourRoot;
    if (!root || !tourActive) return;
    const token = ++tourStepToken;
    const step = TOUR_STEPS[tourStep];
    if (step.homeModule) STATE.homeModule = step.homeModule;
    if (step.page && STATE.appPage !== step.page) STATE.appPage = step.page;
    renderApp();
    root.querySelector('.tour-count-current').textContent = String(tourStep + 1);
    root.querySelector('.tour-title').textContent = step.title;
    root.querySelector('.tour-desc').textContent = step.desc;
    root.querySelector('.tour-hint').textContent = step.target === '.phone-frame'
      ? '👆 点屏幕任意位置继续' : '👆 点高亮区域即可实操继续';
    root.querySelector('.tour-dots').innerHTML = TOUR_STEPS.map((_, i) => `<i class="${i === tourStep ? 'active' : ''}"></i>`).join('');
    const prev = root.querySelector('.tour-prev');
    prev.style.visibility = tourStep === 0 ? 'hidden' : 'visible';
    root.querySelector('.tour-next').textContent = tourStep === TOUR_STEPS.length - 1 ? '开始探索' : '下一步';
    const card = root.querySelector('.tour-card');
    const spotlight = root.querySelector('.tour-spotlight');
    if (step.autoScroll) {
      card.classList.add('waiting');
      spotlight.style.opacity = '0';
      spotlight.style.pointerEvents = 'none';
      scrollTourTargetIntoView(step.target, () => {
        if (!tourActive || token !== tourStepToken) return;
        showTourStepCard();
      });
      return;
    }
    card.classList.remove('waiting');
    spotlight.style.opacity = '1';
    spotlight.style.pointerEvents = 'auto';
    card.classList.remove('step-in');
    void card.offsetWidth;
    card.classList.add('step-in');
    requestAnimationFrame(updateTourPosition);
  }

  function handleTourSpotlightClick() {
    if (!tourActive) return;
    const step = TOUR_STEPS[tourStep];
    const target = (step.target && $(step.target)) || $('.phone-frame');
    if (target) {
      target.classList.remove('tour-pressed');
      void target.offsetWidth;
      target.classList.add('tour-pressed');
      setTimeout(() => target.classList.remove('tour-pressed'), 240);
    }
    if (tourStep < TOUR_STEPS.length - 1) { tourStep += 1; renderTourStep(); }
    else finishTour();
  }

  function syncTourSpotlight() {
    if (!tourActive) return;
    updateTourPosition();
    requestAnimationFrame(syncTourSpotlight);
  }

  function updateTourPosition() {
    const root = tourRoot;
    if (!root || !tourActive) return;
    const step = TOUR_STEPS[tourStep];
    const spotlight = root.querySelector('.tour-spotlight');
    const card = root.querySelector('.tour-card');
    const target = step.target ? $(step.target) : $('.phone-frame');
    if (!target) {
      spotlight.style.opacity = '0';
      return;
    }
    const rect = target.getBoundingClientRect();
    const pad = step.target === '.tab-add' ? 6 : 8;
    if (!card.classList.contains('waiting')) spotlight.style.opacity = '1';
    spotlight.style.left = `${rect.left - pad}px`;
    spotlight.style.top = `${rect.top - pad}px`;
    spotlight.style.width = `${rect.width + pad * 2}px`;
    spotlight.style.height = `${rect.height + pad * 2}px`;
    spotlight.style.borderRadius = step.target === '.phone-frame' ? '44px'
      : step.target === '.tab-add' ? '20px' : '20px';

    const cardW = Math.min(320, window.innerWidth - 32);
    card.style.width = `${cardW}px`;
    const left = Math.max(16, Math.min(window.innerWidth - cardW - 16, window.innerWidth / 2 - cardW / 2));
    card.style.left = `${left}px`;
    card.style.top = 'auto';
    card.style.bottom = 'auto';
    if (step.target === '.tab-add' || rect.bottom > window.innerHeight - 180) {
      card.style.top = '68px';
    } else {
      card.style.bottom = window.innerWidth <= 520 ? '86px' : '84px';
    }
  }

  function finishTour() {
    if (!tourActive || !tourRoot) return;
    const callback = tourDoneCallback;
    tourActive = false;
    tourDoneCallback = null;
    safeStore.set(TOUR_SEEN_KEY, '1');
    restoreTourDemo();
    document.body.classList.remove('tour-active');
    tourRoot.classList.add('closing');
    setTimeout(() => {
      tourRoot.className = 'tour-root';
      tourRoot.innerHTML = '';
    }, 260);
    if (callback) setTimeout(callback, 280);
  }

  /* ==================== 临期食材每日提醒 ==================== */
  function dailyExpiryTop() {
    return ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 3)
      .sort((a, b) => a.remainingDays - b.remainingDays)
      .slice(0, 3);
  }
  function remainingText(item) {
    return item.remainingDays === 0 ? '已过期' : `还剩 ${item.remainingDays} 天`;
  }
  function showDailyExpiryPopup() {
    const items = dailyExpiryTop();
    if (!items.length) return;
    safeStore.set(DAILY_EXPIRY_KEY, todayKey());
    modalRoot.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card daily-expiry-card" data-stop="1">
        <div class="modal-head">
          <div class="modal-icon">⏰</div>
          <div class="grow"><h3>今日临期提醒</h3><p>以下食材即将过期，建议优先食用</p></div>
        </div>
        <div class="daily-expiry-list">
          ${items.map(i => {
            const urgent = i.remainingDays <= 1;
            return `<div class="daily-expiry-row ${urgent ? 'urgent' : ''}">
              <span class="de-emoji">${foodIcon(i.name, i.icon)}</span>
              <div class="de-info">
                <div class="de-name">${esc(i.name)}</div>
                <div class="de-meta">${esc(i.quantity)}${esc(i.unit)} · ${remainingText(i)} ${priorityTag(i)}</div>
              </div>
              <span class="de-days">${remainingText(i)}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="modal-actions daily-expiry-actions">
          <button class="btn btn-ghost" data-action="daily-expiry-known">知道了</button>
          <button class="btn btn-primary" data-action="daily-expiry-view-all">查看全部</button>
        </div>
      </div>
    </div>`;
  }
  function maybeDailyExpiryPopup() {
    if (safeStore.get(DAILY_EXPIRY_KEY) === todayKey()) return;
    showDailyExpiryPopup();
  }
  function scrollToFullFoodList() {
    setTimeout(() => {
      const target = appEl.querySelector('.fridge-hero');
      if (!target) return;
      const top = target.getBoundingClientRect().top - appEl.getBoundingClientRect().top + appEl.scrollTop - 64;
      appEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 40);
  }

  function initExperienceSequence() {
    startIntro(() => {
      // 每次刷新重播新手引导；引导结束后不再自动弹临期提醒
      startTour();
    });
  }

  window.addEventListener('resize', () => { if (tourActive) updateTourPosition(); updateScrollHint(); });
  appEl.addEventListener('scroll', () => { if (tourActive) updateTourPosition(); });

  /* ==================== 事件绑定 ==================== */
  document.addEventListener('click', (e) => {
    const tourBtn = e.target.closest('[data-tour-action]');
    if (tourBtn) {
      const t = tourBtn.dataset.tourAction;
      if (t === 'skip') finishTour();
      else if (t === 'prev' && tourStep > 0) { tourStep -= 1; renderTourStep(); }
      else if (t === 'next') {
        if (tourStep < TOUR_STEPS.length - 1) { tourStep += 1; renderTourStep(); }
        else finishTour();
      }
      return;
    }
    const actionEl = e.target.closest('[data-action]');

    if (actionEl) {
      const a = actionEl.dataset.action;
      if (a === 'close-modal') {
        if (e.target.closest('[data-stop]')) return;
        closeModal(); return;
      }
      if (a === 'close-app-layer' || a === 'close-ai' || a === 'close-checkout') { aiResultSeq++; closeModal(); return; }
      if (a === 'app-open-layer') { showAppLayerModal(actionEl.dataset.layer); return; }
      if (a === 'layer-view-all') { closeModal(); STATE.appPage = 'fridge'; renderApp(); return; }
      if (a === 'fridge-model') { showFridgeModelModal(); return; }
      if (a === 'fridge-model-photo') {
        showFridgeModelModal();
        const file = $('#model-photo');
        if (file) file.click();
        return;
      }
      if (a === 'tour-restart') { closeModal(); setTimeout(() => startTour(), 120); return; }
      if (a === 'daily-expiry-known') { closeModal(); return; }
      if (a === 'daily-expiry-view-all') {
        closeModal();
        if (STATE.appPage !== 'fridge') { STATE.appPage = 'fridge'; renderApp(); }
        scrollToFullFoodList();
        return;
      }
      if (a === 'choose-model') { applyFridgeModel(actionEl.dataset.model); return; }
      if (a === 'voice-manual') { startVoice('manual'); return; }
      if (a === 'voice-text') { startVoice('text'); return; }
      if (a === 'auto-restock-manual') { closeModal(); toast('已留在补货清单，按你的节奏买'); return; }
      if (a === 'auto-restock-order') {
        const pending = STATE.restock.filter(r => r.status === '待补' && skuByName(r.name)).slice(0, 3);
        pending.forEach(r => addToCart(skuByName(r.name), r.id));
        closeModal(); renderApp();
        toast(pending.length ? `已把 ${pending.length} 样加进购物车` : '清单里暂时没有可自动购买的商品');
        return;
      }
      if (a === 'home-module') { STATE.homeModule = actionEl.dataset.module; renderApp(); return; }
      if (a === 'expiry-day') { STATE.expiryDay = +actionEl.dataset.day; renderApp(); return; }
      if (a === 'expiry-all') { showExpiryModal(expiryItems()); return; }
      if (a === 'pupu-open') { showPupuModal(); return; }
      if (a === 'pupu-open-app') { openPupuApp(); return; }
      if (a === 'pupu-mark') { pupuMarkAll(); return; }
      if (a === 'add-open') { showAddModal(actionEl.dataset.mode); return; }
      if (a === 'entry-parse') { entryParse(($('#ai-food-input') && $('#ai-food-input').value) || ''); return; }
      if (a === 'entry-fill') { const inp = $('#ai-food-input'); if (inp) { inp.value = actionEl.dataset.q; entryParse(inp.value); } return; }
      if (a === 'entry-confirm') { entryConfirm(); return; }
      if (a === 'batch-parse') { batchParse(($('#batch-input') && $('#batch-input').value) || ''); return; }
      if (a === 'batch-fill') {
        const ta = $('#batch-input');
        if (ta) { ta.value = '鲜鸡蛋 6枚\n全脂牛奶 2盒\n番茄 4个\n冷冻水饺 1袋'; batchParse(ta.value); }
        return;
      }
      if (a === 'batch-confirm') { batchConfirm(); return; }
      if (a === 'add-tab') { addMode = actionEl.dataset.mode; addBatch = false; renderAddPanel(); return; }
      if (a === 'pick-layer') {
        const box = actionEl.closest('#af-layer');
        if (box) {
          box.dataset.layer = actionEl.dataset.layer;
          $$('.layer-chip', box).forEach(b => b.classList.toggle('active', b === actionEl));
        }
        return;
      }
      if (a === 'add-batch') { addBatch = actionEl.dataset.batch === 'batch'; renderAddPanel(); return; }
      if (a === 'add-save') { addSave(); return; }
      if (a === 'ai-view-steps') { showAiSteps(); return; }
      if (a === 'checkout') { doCheckout(); return; }
      if (a === 'view-fridge') { closeModal(); STATE.appPage = 'fridge'; renderApp(); toast('已打开你的冰箱，新食材已入库'); return; }
      if (a === 'ai-open' || a === 'ai-change') { showAiModal(); return; }
      if (a === 'ai-quick') { renderAiResult(actionEl.dataset.q); return; }
      if (a === 'ai-submit') {
        const input = $('#ai-input');
        const q = (input && input.value) || '';
        if (!q.trim()) { toast('先说说想吃什么菜'); if (input) input.focus(); return; }
        renderAiResult(q); return;
      }
      if (a === 'ai-add-restock') {
        const r = STATE.aiDish || RECIPES.find(x => x.id === actionEl.dataset.recipe);
        const { need } = aiAnalyzeRecipe(r);
        let added = 0;
        need.forEach(n => {
          const sku = skuByName(n);
          if (sku) addToCart(sku, null);
          else if (!STATE.restock.some(rs => rs.name === n)) {
            STATE.restock.push({ id: 'rs-' + Date.now() + '-' + (added++), name: n, suggestQty: 1, unit: '份', source: '食谱缺料', status: '待补' });
          }
        });
        closeModal(); STATE.appPage = 'cart'; renderApp();
        toast('所需食材已加入购物车');
        return;
      }
      if (a === 'simulate-nfc') {
        STATE.appPage = 'nfc'; renderApp();
        toast('已连接你的冰箱'); return;
      }
      if (a === 'go-pairing') { showPairGuide(); return; }
      if (a === 'toggle-nfc') { STATE.device.nfcBound = !STATE.device.nfcBound; renderApp(); toast(STATE.device.nfcBound ? '碰一碰已开启' : '碰一碰已关闭'); return; }
      if (a === 'toggle-check') {
        const id = actionEl.dataset.id;
        if (STATE.checked.has(id)) STATE.checked.delete(id); else STATE.checked.add(id);
        renderApp(); return;
      }
      if (a === 'restock-add-cart') {
        const checkedIds = Array.from(STATE.checked);
        if (!checkedIds.length) { toast('请先勾选补货项'); return; }
        pendingGoCart = true;
        dupQueue = [];
        checkedIds.forEach(id => {
          const r = STATE.restock.find(x => x.id === id);
          if (!r || r.status === '暂不补货') return;
          const sku = skuByName(r.name);
          if (!sku) return;
          const dup = checkDuplicate(sku);
          if (dup && dup.hit) dupQueue.push({ sku, rid: r.id });
          else { addToCart(sku, r.id); STATE.checked.delete(id); }
        });
        processDupQueue(); return;
      }
      if (a === 'product-add') {
        const sku = actionEl.dataset.sku;
        const dup = checkDuplicate(sku);
        if (dup && dup.hit) { dupQueue = [{ sku, rid: null }]; processDupQueue(); }
        else { addToCart(sku, null); renderApp(); toast('已加入购物车'); }
        return;
      }
      if (a === 'dup-skip' || a === 'dup-buy') {
        const { sku, rid } = actionEl.dataset;
        if (rid) STATE.checked.delete(rid);
        if (a === 'dup-buy') addToCart(sku, rid || null);
        else {
          const ci = STATE.cart.findIndex(c => c.sku === sku);
          if (ci >= 0) STATE.cart.splice(ci, 1);
          if (rid) { const r = STATE.restock.find(x => x.id === rid); if (r) r.status = '暂不补货'; }
        }
        closeModal();
        if (dupQueue.length) processDupQueue();
        else {
          const goCart = pendingGoCart && a === 'dup-buy';
          pendingGoCart = false;
          if (goCart) STATE.appPage = 'cart';
          renderApp(); toast(a === 'dup-buy' ? '已加入购物车' : '已移出购物车，标记暂不补货');
        }
        return;
      }
      if (a === 'cart-qty') {
        const idx = +actionEl.dataset.idx;
        STATE.cart[idx].qty += +actionEl.dataset.d;
        if (STATE.cart[idx].qty <= 0) STATE.cart.splice(idx, 1);
        renderApp(); return;
      }
      if (a === 'cart-select') {
        const c = STATE.cart[+actionEl.dataset.idx];
        if (c) c.selected = c.selected === false;
        renderApp(); return;
      }
      if (a === 'cart-select-all') {
        const allOn = STATE.cart.length > 0 && STATE.cart.every(c => c.selected !== false);
        STATE.cart.forEach(c => { c.selected = !allOn; });
        renderApp(); return;
      }
      if (a === 'restock-to-cart') {
        const r = STATE.restock.find(x => x.id === actionEl.dataset.id);
        const sku = r && skuByName(r.name);
        if (!sku) { toast('这款暂时没有同款商品'); return; }
        addToCart(sku, r.id); renderApp(); toast('已加入购物车'); return;
      }
      if (a === 'go-cart') { closeModal(); STATE.appPage = 'cart'; renderApp(); return; }
      if (a === 'cart-manage') { toast('点商品左侧圆圈勾选，右下角结算'); return; }
    }

    const appRouteBtn = e.target.closest('[data-app-route]');
    if (appRouteBtn) { STATE.appPage = appRouteBtn.dataset.appRoute; STATE.focusLayer = null; renderApp(); return; }
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { STATE.appPage = tabBtn.dataset.tab; STATE.focusLayer = null; renderApp(); return; }
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { STATE.appPage = goBtn.dataset.go; STATE.focusLayer = null; renderApp(); return; }
    const layerGoBtn = e.target.closest('[data-action="go-layer"]');
    if (layerGoBtn) { STATE.appPage = 'fridge'; STATE.focusLayer = layerGoBtn.dataset.layer; renderApp(); return; }
    const recipeBtn = e.target.closest('[data-recipe]');
    if (recipeBtn) { closeModal(); STATE.recipeId = recipeBtn.dataset.recipe; STATE.appPage = 'recipe'; renderApp(); return; }
    const addMissingBtn = e.target.closest('[data-add-missing]');
    if (addMissingBtn) {
      const r = RECIPES.find(x => x.id === addMissingBtn.dataset.addMissing);
      let n = 0;
      r.ingredients.filter(x => !x.have).forEach(ing => {
        const sku = skuByName(ing.name);
        if (sku) addToCart(sku, null);
        else if (!STATE.restock.some(rs => rs.name === ing.name)) {
          STATE.restock.push({ id: 'rs-' + Date.now() + '-' + (n++), name: ing.name, suggestQty: 1, unit: '份', source: '食谱缺料', status: '待补' });
        }
      });
      STATE.appPage = 'cart'; renderApp(); toast('缺失食材已加入购物车'); return;
    }
    const productLine = e.target.closest('[data-product]');
    if (productLine) { STATE.productSku = productLine.dataset.product; STATE.appPage = 'product'; renderApp(); return; }
  });

  $('#btn-reset').addEventListener('click', () => {
    ITEMS.length = 0; ITEMS_INITIAL.forEach(x => ITEMS.push({ ...x }));
    STATE.restock = RESTOCK_ITEMS.map(x => ({ ...x }));
    STATE.cart = []; STATE.checked = new Set(); STATE.device = { ...DEVICE };
    STATE.appPage = 'home'; STATE.expiryDay = 3; STATE.aiDish = null;
    STATE.fridgeModel = 'standard'; STATE.autoRestockAsked = false; STATE.focusLayer = null;
    STATE.restock.filter(r => r.status === '待补').forEach(r => {
      const sku = skuByName(r.name);
      if (sku) addToCart(sku, r.id);
    });
    renderApp(); toast('已恢复初始数据');
  });

  if (!STATE.cart.length) {
    STATE.restock.filter(r => r.status === '待补').forEach(r => {
      const sku = skuByName(r.name);
      if (sku) addToCart(sku, r.id);
    });
  }
  renderApp();
  // 页面加载时序：开场动画 → 新手教程 → 临期食材提醒（每次刷新都重播）
  initExperienceSequence();
})();
