// ============================================================
// 0. DATA INGESTION — Загрузка данных из JSON
// ============================================================

/** Глобальное состояние данных */
var appState = {
    competitors: [],
    lastUpdated: null,
    dataSource: 'базовый датасет',
    dataVersion: '2.4',
    isLive: false
};

/**
 * fetchCompetitorData() — загружает данные из competitors_live.json
 * через fetch (работает при открытии index.html через Live Server
 * или если файлы лежат на HTTP-сервере).
 *
 * Если fetch недоступен (file:// protocol), использует статический
 * резервный датасет, встроенный в код.
 */
function fetchCompetitorData() {
    return fetch('competitors_live.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            if (!data.competitors || !Array.isArray(data.competitors)) {
                throw new Error('Неверная структура JSON');
            }
            appState.umayshop = data.umayshop || null;
            appState.competitors = data.competitors;
            appState.lastUpdated = data._meta && data._meta.last_updated
                ? data._meta.last_updated
                : new Date().toISOString();
            appState.dataSource = (data._meta && data._meta.data_source) || 'внешний JSON';
            appState.dataVersion = (data._meta && data._meta.data_version) || '2.4';
            appState.isLive = true;
            updateDataStatusUI();
            return data;
        })
        .catch(function(err) {
            console.warn('⚠ fetchCompetitorData() — ошибка загрузки JSON:', err.message);
            console.log('↻ Использую встроенный резервный датасет.');
            loadFallbackData();
            return null;
        });
}

/**
 * Резервный датасет (встроенный в код) — используется,
 * если fetch не сработал (file:// protocol или JSON недоступен).
 */
function loadFallbackData() {
    appState.umayshop = {
        id: 'umayshop', name: 'Umayshop',
        market_analysis: { gmv_billion_usd: 0.85, market_growth_pct: 67, average_order_value_usd: 28, purchase_frequency_per_month: 2.8 },
        operational_maturity: { logistic_points_count: 1200, user_retention_rate_pct: 55, merchant_base_count: 28000 },
        product_features: { seller_commission_pct: 4.5, has_fintech_installment: true, cart_recovery_efficiency_pct: 52, gamification_level_score: 8 },
        user_analytics: {
            mau_millions: 1.2,
            top_reasons: ['Низкая комиссия для селлеров', 'Геймификация и бонусы', 'Финтех-рассрочка', 'Удобный интерфейс'],
            cart_abandonment_rate_pct: 48,
            return_rate_pct: 3.2,
            avg_items_per_order: 2.1,
            conversion_rate_pct: 4.8
        }
    };
    appState.competitors = [
        {
            id: 'kaspi', name: 'Kaspi Магазин',
            market_analysis: { gmv_billion_usd: 12.5, market_growth_pct: 35, average_order_value_usd: 40, purchase_frequency_per_month: 5.5 },
            operational_maturity: { logistic_points_count: 8500, user_retention_rate_pct: 88, merchant_base_count: 950000 },
            product_features: { seller_commission_pct: 9.5, has_fintech_installment: true, cart_recovery_efficiency_pct: 45, gamification_level_score: 4 },
            user_analytics: {
                mau_millions: 18.5,
                top_reasons: ['Удобство оплаты и рассрочка', 'Широкая сеть ПВЗ', 'Доверие к бренду', 'Быстрая доставка'],
                cart_abandonment_rate_pct: 55,
                return_rate_pct: 4.8,
                avg_items_per_order: 3.5,
                conversion_rate_pct: 6.2
            }
        },
        {
            id: 'temu', name: 'Temu',
            market_analysis: { gmv_billion_usd: 18.0, market_growth_pct: 60, average_order_value_usd: 18, purchase_frequency_per_month: 3.2 },
            operational_maturity: { logistic_points_count: 1200, user_retention_rate_pct: 28, merchant_base_count: 150000 },
            product_features: { seller_commission_pct: 3.0, has_fintech_installment: false, cart_recovery_efficiency_pct: 75, gamification_level_score: 10 },
            user_analytics: {
                mau_millions: 42.0,
                top_reasons: ['Сверхнизкие цены', 'Геймификация и мини-игры', 'Акции и купоны', 'Бесплатная доставка'],
                cart_abandonment_rate_pct: 25,
                return_rate_pct: 8.5,
                avg_items_per_order: 4.2,
                conversion_rate_pct: 8.5
            }
        },
        {
            id: 'uzum', name: 'Uzum Market',
            market_analysis: { gmv_billion_usd: 1.2, market_growth_pct: 75, average_order_value_usd: 22, purchase_frequency_per_month: 4.1 },
            operational_maturity: { logistic_points_count: 600, user_retention_rate_pct: 62, merchant_base_count: 55000 },
            product_features: { seller_commission_pct: 7.0, has_fintech_installment: true, cart_recovery_efficiency_pct: 50, gamification_level_score: 5 },
            user_analytics: {
                mau_millions: 3.8,
                top_reasons: ['Локальный маркетплейс', 'Рассрочка от Uzum', 'Быстрая доставка по Узбекистану', 'Растущий ассортимент'],
                cart_abandonment_rate_pct: 50,
                return_rate_pct: 3.5,
                avg_items_per_order: 2.5,
                conversion_rate_pct: 3.9
            }
        },
        {
            id: 'wildberries', name: 'Wildberries',
            market_analysis: { gmv_billion_usd: 38.0, market_growth_pct: 45, average_order_value_usd: 25, purchase_frequency_per_month: 4.8 },
            operational_maturity: { logistic_points_count: 45000, user_retention_rate_pct: 76, merchant_base_count: 1200000 },
            product_features: { seller_commission_pct: 14.0, has_fintech_installment: true, cart_recovery_efficiency_pct: 55, gamification_level_score: 3 },
            user_analytics: {
                mau_millions: 65.0,
                top_reasons: ['Огромный ассортимент', 'Примерка перед покупкой', 'Низкие цены', 'Пункты выдачи рядом с домом'],
                cart_abandonment_rate_pct: 45,
                return_rate_pct: 12.0,
                avg_items_per_order: 3.8,
                conversion_rate_pct: 5.5
            }
        },
        {
            id: 'ozon', name: 'Ozon',
            market_analysis: { gmv_billion_usd: 28.5, market_growth_pct: 65, average_order_value_usd: 32, purchase_frequency_per_month: 5.2 },
            operational_maturity: { logistic_points_count: 50000, user_retention_rate_pct: 82, merchant_base_count: 550000 },
            product_features: { seller_commission_pct: 12.0, has_fintech_installment: true, cart_recovery_efficiency_pct: 60, gamification_level_score: 6 },
            user_analytics: {
                mau_millions: 38.0,
                top_reasons: ['Широкий ассортимент', 'Ozon Карта с кешбэком', 'Быстрая доставка', 'Надёжность и доверие'],
                cart_abandonment_rate_pct: 40,
                return_rate_pct: 6.5,
                avg_items_per_order: 3.2,
                conversion_rate_pct: 5.8
            }
        }
    ];
    appState.lastUpdated = new Date().toISOString();
    appState.dataSource = 'встроенный резервный датасет (fallback)';
    appState.dataVersion = '2.4';
    appState.isLive = false;
    updateDataStatusUI();
}

/**
 * Обновляет UI-индикаторы статуса данных
 */
function updateDataStatusUI() {
    var statusText = document.getElementById('dataStatusText');
    var statusDot = document.getElementById('statusDot');
    var statusLabel = document.getElementById('statusLabel');
    var timestampEl = document.getElementById('dataTimestamp');
    var headerBadge = document.getElementById('headerBadge');

    if (!statusText) return;

    var ts = appState.lastUpdated ? new Date(appState.lastUpdated) : new Date();
    var formattedDate = ts.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    if (appState.isLive) {
        statusText.textContent = 'AI-модель v' + appState.dataVersion + ' · Данные актуальны (Live)';
        if (statusDot) {
            statusDot.className = 'status-dot live';
        }
        if (statusLabel) {
            statusLabel.innerHTML = 'Статус данных: <strong style="color:var(--success);">Данные актуальны (Live)</strong>';
        }
        if (headerBadge) {
            headerBadge.style.borderColor = 'rgba(34,197,94,0.3)';
            headerBadge.style.background = 'rgba(34,197,94,0.1)';
        }
    } else {
        statusText.textContent = 'AI-модель v' + appState.dataVersion + ' · Резервные данные';
        if (statusDot) {
            statusDot.className = 'status-dot stale';
        }
        if (statusLabel) {
            statusLabel.innerHTML = 'Статус данных: <strong style="color:var(--warning);">Резервные (не удалось загрузить JSON)</strong>';
        }
        if (headerBadge) {
            headerBadge.style.borderColor = 'rgba(245,158,11,0.3)';
            headerBadge.style.background = 'rgba(245,158,11,0.1)';
        }
    }

    if (timestampEl) {
        timestampEl.textContent = formattedDate + ' · ' + appState.dataSource;
    }
}

// ============================================================
// 1. AI MODEL WEIGHTS
// ============================================================
var modelWeights = {
    market_analysis: {
        weight: 0.35,
        label: 'Анализ e-commerce сегмента',
        sub: {
            gmv_billion_usd: { weight: 0.30, label: 'GMV (млрд $)', max: 30 },
            market_growth_pct: { weight: 0.25, label: 'Рост рынка (%)', max: 150 },
            average_order_value_usd: { weight: 0.20, label: 'Средний чек AOV ($)', max: 50 },
            purchase_frequency_per_month: { weight: 0.25, label: 'Частота покупок (в мес.)', max: 8 }
        }
    },
    operational_maturity: {
        weight: 0.35,
        label: 'Операционная зрелость конкурента',
        sub: {
            logistic_points_count: { weight: 0.35, label: 'Логистика / ПВЗ', max: 30000 },
            user_retention_rate_pct: { weight: 0.40, label: 'Retention Rate (%)', max: 100 },
            merchant_base_count: { weight: 0.25, label: 'База мерчантов', max: 250000 }
        }
    },
    product_features: {
        weight: 0.30,
        label: 'Продуктовые фичи',
        sub: {
            seller_commission_pct: { weight: 0.25, label: 'Комиссия селлера (%)', max: 15, invert: true },
            has_fintech_installment: { weight: 0.25, label: 'Финтех / Рассрочка', max: 1 },
            cart_recovery_efficiency_pct: { weight: 0.25, label: 'Удержание корзины (%)', max: 100 },
            gamification_level_score: { weight: 0.25, label: 'Геймификация (1-10)', max: 10 }
        }
    }
};

// ============================================================
// 2. SCORE CALCULATION
// ============================================================
function normalize(value, max, invert) {
    var raw = Math.min(value, max) / max;
    return invert ? (1 - raw) : raw;
}

function calculateCompetitorScore(comp) {
    var totalScore = 0;
    var categories = Object.keys(modelWeights);

    for (var ci = 0; ci < categories.length; ci++) {
        var category = categories[ci];
        var catData = modelWeights[category];
        var catScore = 0;
        var subKeys = Object.keys(catData.sub);

        for (var si = 0; si < subKeys.length; si++) {
            var key = subKeys[si];
            var sub = catData.sub[key];
            var rawVal = comp[category][key];
            var norm = normalize(rawVal, sub.max, sub.invert || false);
            catScore += norm * sub.weight;
        }
        totalScore += catScore * catData.weight;
    }

    return Math.round(totalScore * 100);
}

function calculateAllScores() {
    var result = [];
    for (var i = 0; i < appState.competitors.length; i++) {
        var c = appState.competitors[i];
        result.push({
            id: c.id,
            name: c.name,
            market_analysis: c.market_analysis,
            operational_maturity: c.operational_maturity,
            product_features: c.product_features,
            score: calculateCompetitorScore(c)
        });
    }
    return result;
}

// ============================================================
// 2.5. UMAYSHOP SCORE
// ============================================================
function calculateUmayshopScore() {
    if (!appState.umayshop) return null;
    var score = calculateCompetitorScore(appState.umayshop);
    return {
        id: appState.umayshop.id,
        name: appState.umayshop.name,
        market_analysis: appState.umayshop.market_analysis,
        operational_maturity: appState.umayshop.operational_maturity,
        product_features: appState.umayshop.product_features,
        score: score
    };
}

// ============================================================
// 3. GLOBALS & HELPERS
// ============================================================
var scoredData = [];
var umayshopScored = null;
var radarChartInstance = null;
var barChartInstance = null;

function getRankLabel(score) {
    if (score >= 75) return { label: 'Лидер рынка', cls: 'badge-leader' };
    if (score >= 55) return { label: 'Претендент', cls: 'badge-contender' };
    if (score >= 35) return { label: 'Догоняющий', cls: 'badge-challenger' };
    return { label: 'Новичок', cls: 'badge-follower' };
}

function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}

function showToast(msg, type) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + (type || '') + ' show';
    setTimeout(function() { t.classList.remove('show'); }, 3000);
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ============================================================
// 4. RENDER: Umayshop Hero Card
// ============================================================
function renderUmayshopCard() {
    var container = document.getElementById('umayshopCard');
    if (!container) return;
    if (!umayshopScored) {
        container.innerHTML = '<div class="umayshop-empty">Данные Umayshop не загружены</div>';
        return;
    }

    var c = umayshopScored;
    var rank = getRankLabel(c.score);
    var ma = c.market_analysis;
    var om = c.operational_maturity;
    var pf = c.product_features;
    var catScores = getCategoryScores(c);

    // Find closest competitor
    var closest = null;
    var closestDiff = Infinity;
    for (var i = 0; i < scoredData.length; i++) {
        var diff = Math.abs(scoredData[i].score - c.score);
        if (diff < closestDiff) {
            closestDiff = diff;
            closest = scoredData[i];
        }
    }

    var html = '';
    html += '<div class="umayshop-hero animate-in">';
    html += '  <div class="umayshop-hero-left">';
    html += '    <div class="umayshop-brand">';
    html += '      <div class="umayshop-logo">U</div>';
    html += '      <div class="umayshop-info">';
    html += '        <h2 class="umayshop-name">Umayshop</h2>';
    html += '        <span class="badge ' + rank.cls + '" style="font-size:13px;">' + rank.label + '</span>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="umayshop-metrics">';
    html += '      <div class="umayshop-metric">';
    html += '        <div class="umetric-label">Индекс конкурентоспособности</div>';
    html += '        <div class="umetric-value"><span class="umetric-number">' + c.score + '</span><span class="umetric-unit">/100</span></div>';
    html += '        <div class="score-bar-container" style="margin-top:6px;">';
    html += '          <div class="score-bar-bg"><div class="score-bar-fill umayshop-fill" style="width:' + c.score + '%;"></div></div>';
    html += '        </div>';
    html += '      </div>';
    html += '      <div class="umayshop-cat-scores">';
    html += '        <div class="ucat-item"><div class="ucat-label">E-Commerce</div><div class="ucat-val">' + catScores.market_analysis + '</div></div>';
    html += '        <div class="ucat-item"><div class="ucat-label">Операции</div><div class="ucat-val">' + catScores.operational_maturity + '</div></div>';
    html += '        <div class="ucat-item"><div class="ucat-label">Продукт</div><div class="ucat-val">' + catScores.product_features + '</div></div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="umayshop-hero-right">';
    html += '    <div class="umayshop-stats-grid">';
    html += '      <div class="ustat"><div class="ustat-icon">📦</div><div class="ustat-info"><div class="ustat-val">$' + ma.gmv_billion_usd + ' млрд</div><div class="ustat-lbl">GMV</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">📈</div><div class="ustat-info"><div class="ustat-val good">+' + ma.market_growth_pct + '%</div><div class="ustat-lbl">Рост рынка</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">🛒</div><div class="ustat-info"><div class="ustat-val">$' + ma.average_order_value_usd + '</div><div class="ustat-lbl">AOV</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">🔄</div><div class="ustat-info"><div class="ustat-val">' + ma.purchase_frequency_per_month + '×</div><div class="ustat-lbl">Покупок/мес</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">🏪</div><div class="ustat-info"><div class="ustat-val">' + formatNum(om.logistic_points_count) + '</div><div class="ustat-lbl">ПВЗ</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">❤️</div><div class="ustat-info"><div class="ustat-val ' + (om.user_retention_rate_pct >= 60 ? 'good' : 'warn') + '">' + om.user_retention_rate_pct + '%</div><div class="ustat-lbl">Retention</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">👥</div><div class="ustat-info"><div class="ustat-val">' + formatNum(om.merchant_base_count) + '</div><div class="ustat-lbl">Мерчанты</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">💰</div><div class="ustat-info"><div class="ustat-val good">' + pf.seller_commission_pct + '%</div><div class="ustat-lbl">Комиссия</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">🏦</div><div class="ustat-info"><div class="ustat-val">' + (pf.has_fintech_installment ? '✅ Да' : '❌ Нет') + '</div><div class="ustat-lbl">Рассрочка</div></div></div>';
    html += '      <div class="ustat"><div class="ustat-icon">🎮</div><div class="ustat-info"><div class="ustat-val">' + pf.gamification_level_score + '/10</div><div class="ustat-lbl">Геймификация</div></div></div>';
    html += '    </div>';

    if (closest) {
        html += '    <div class="umayshop-vs">';
        html += '      <span class="vs-label">⚔️ Ближайший конкурент:</span>';
        html += '      <span class="vs-name">' + closest.name + '</span>';
        html += '      <span class="vs-score">(Индекс: ' + closest.score + ') </span>';
        html += '      <span class="vs-gap">Разрыв: ' + Math.abs(closest.score - c.score) + ' pts</span>';
        html += '    </div>';
    }

    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;
}

// ============================================================
// 5. RENDER: Stats Overview
// ============================================================
function renderStats() {
    var container = document.getElementById('statsOverview');
    var sum = 0;
    for (var i = 0; i < scoredData.length; i++) sum += scoredData[i].score;
    var avgScore = scoredData.length > 0 ? Math.round(sum / scoredData.length) : 0;

    var maxScore = 0;
    var leader = null;
    for (var i = 0; i < scoredData.length; i++) {
        if (scoredData[i].score > maxScore) {
            maxScore = scoredData[i].score;
            leader = scoredData[i];
        }
    }

    var totalGMV = 0;
    for (var i = 0; i < scoredData.length; i++) totalGMV += scoredData[i].market_analysis.gmv_billion_usd;

    var html = '';
    html += '<div class="stat-card animate-in">';
    html += '<div class="label">Средний индекс</div>';
    html += '<div class="value"><span class="accent">' + avgScore + '</span></div>';
    html += '<div class="sub">из 100</div></div>';

    html += '<div class="stat-card animate-in">';
    html += '<div class="label">Лидер рынка</div>';
    html += '<div class="value" style="font-size:20px;">' + (leader ? leader.name : '—') + '</div>';
    html += '<div class="sub">Индекс: ' + (leader ? leader.score : '—') + '</div></div>';

    html += '<div class="stat-card animate-in">';
    html += '<div class="label">Суммарный GMV</div>';
    html += '<div class="value"><span class="accent">$' + totalGMV.toFixed(1) + ' млрд</span></div>';
    html += '<div class="sub">Общий объём рынка</div></div>';

    html += '<div class="stat-card animate-in">';
    html += '<div class="label">Кол-во конкурентов</div>';
    html += '<div class="value"><span class="accent">' + scoredData.length + '</span></div>';
    html += '<div class="sub">площадок в анализе</div></div>';

    container.innerHTML = html;
}

// ============================================================
// 5. RENDER: Competitor Cards
// ============================================================
function renderCards() {
    var container = document.getElementById('competitorGrid');
    var html = '';

    for (var i = 0; i < scoredData.length; i++) {
        var c = scoredData[i];
        var rank = getRankLabel(c.score);
        var ma = c.market_analysis;
        var om = c.operational_maturity;
        var pf = c.product_features;

        html += '<div class="competitor-card animate-in">';
        html += '<div class="card-header">';
        html += '<span class="card-name">' + c.name + '</span>';
        html += '<div class="card-score">';
        html += '<span class="score-value">' + c.score + '</span>';
        html += '<span class="score-label">/100</span>';
        html += '</div></div>';

        html += '<div class="score-bar-container">';
        html += '<div class="score-bar-bg"><div class="score-bar-fill" style="width:' + c.score + '%;"></div></div>';
        html += '</div>';

        html += '<div class="card-stats">';
        html += '<div class="card-stat"><div class="stat-label">GMV</div><div class="stat-value">$' + ma.gmv_billion_usd + ' млрд</div></div>';
        html += '<div class="card-stat"><div class="stat-label">Рост рынка</div><div class="stat-value good">+' + ma.market_growth_pct + '%</div></div>';
        html += '<div class="card-stat"><div class="stat-label">AOV</div><div class="stat-value">$' + ma.average_order_value_usd + '</div></div>';
        html += '<div class="card-stat"><div class="stat-label">Retention</div><div class="stat-value ' + (om.user_retention_rate_pct >= 60 ? 'good' : 'warn') + '">' + om.user_retention_rate_pct + '%</div></div>';
        html += '<div class="card-stat"><div class="stat-label">Комиссия</div><div class="stat-value ' + (pf.seller_commission_pct <= 8 ? 'good' : 'warn') + '">' + pf.seller_commission_pct + '%</div></div>';
        html += '<div class="card-stat"><div class="stat-label">Геймификация</div><div class="stat-value">' + pf.gamification_level_score + '/10</div></div>';
        html += '</div>';

        html += '<div class="card-footer">';
        html += '<span class="badge ' + rank.cls + '">' + rank.label + '</span>';
        html += '<span style="font-size:12px;color:var(--text-muted);">ПВЗ: ' + formatNum(om.logistic_points_count) + '</span>';
        html += '</div></div>';
    }

    container.innerHTML = html;
}

// ============================================================
// 6. RENDER: Radar Chart
// ============================================================
function renderRadarChart() {
    var select = document.getElementById('radarSelect');
    var selectedId = select ? select.value : 'all';

    var labels = ['Анализ e-commerce', 'Операционная зрелость', 'Продуктовые фичи'];
    var datasets = [];
    var colors = [
        'rgba(99,102,241,0.7)', 'rgba(239,68,68,0.7)', 'rgba(34,197,94,0.7)',
        'rgba(245,158,11,0.7)', 'rgba(167,139,250,0.7)'
    ];
    var borderColors = [
        'rgba(99,102,241,1)', 'rgba(239,68,68,1)', 'rgba(34,197,94,1)',
        'rgba(245,158,11,1)', 'rgba(167,139,250,1)'
    ];

    var itemsToShow = [];
    if (selectedId === 'all') {
        itemsToShow = scoredData;
    } else {
        for (var i = 0; i < scoredData.length; i++) {
            if (scoredData[i].id === selectedId) {
                itemsToShow = [scoredData[i]];
                break;
            }
        }
    }

    for (var di = 0; di < itemsToShow.length; di++) {
        var c = itemsToShow[di];
        var catScores = getCategoryScores(c);
        datasets.push({
            label: c.name,
            data: [catScores.market_analysis, catScores.operational_maturity, catScores.product_features],
            backgroundColor: colors[di % colors.length].replace('0.7', '0.15'),
            borderColor: borderColors[di % borderColors.length],
            borderWidth: 2,
            pointBackgroundColor: borderColors[di % borderColors.length],
            pointRadius: 4
        });
    }

    var ctx = document.getElementById('radarChart').getContext('2d');

    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
                }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.06)' },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                    ticks: {
                        backdropColor: 'transparent',
                        color: '#64748b',
                        stepSize: 20,
                        max: 100
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function getCategoryScores(comp) {
    var result = {};
    var categories = Object.keys(modelWeights);

    for (var ci = 0; ci < categories.length; ci++) {
        var category = categories[ci];
        var catData = modelWeights[category];
        var catScore = 0;
        var subKeys = Object.keys(catData.sub);

        for (var si = 0; si < subKeys.length; si++) {
            var key = subKeys[si];
            var sub = catData.sub[key];
            var rawVal = comp[category][key];
            var norm = normalize(rawVal, sub.max, sub.invert || false);
            catScore += norm * sub.weight;
        }
        result[category] = Math.round(catScore * 100);
    }
    return result;
}

// ============================================================
// 7. RENDER: Bar Chart
// ============================================================
function renderBarChart() {
    var ctx = document.getElementById('barChart').getContext('2d');
    var labels = [];
    var data = [];
    var bgColors = [];

    // Sort by score descending
    var sorted = scoredData.slice().sort(function(a, b) { return b.score - a.score; });

    for (var i = 0; i < sorted.length; i++) {
        labels.push(sorted[i].name);
        data.push(sorted[i].score);
        var alpha = 0.5 + (i / sorted.length) * 0.5;
        bgColors.push('rgba(99,102,241,' + alpha.toFixed(2) + ')');
    }

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Индекс конкурентоспособности',
                data: data,
                backgroundColor: bgColors,
                borderColor: 'rgba(99,102,241,1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, max: 100 }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
                }
            }
        }
    });
}

// ============================================================
// 8. RENDER: Weights Table
// ============================================================
function renderWeights() {
    var container = document.getElementById('weightsSection');
    var html = '';
    html += '<table class="weights-table">';
    html += '<thead><tr><th>Категория</th><th>Метрика</th><th>Вес в категории</th><th>Вес в модели</th></tr></thead><tbody>';

    var categories = Object.keys(modelWeights);
    for (var ci = 0; ci < categories.length; ci++) {
        var cat = categories[ci];
        var catData = modelWeights[cat];
        var subKeys = Object.keys(catData.sub);
        var rowspan = subKeys.length;

        for (var si = 0; si < subKeys.length; si++) {
            var key = subKeys[si];
            var sub = catData.sub[key];
            html += '<tr>';
            if (si === 0) {
                html += '<td rowspan="' + rowspan + '"><strong>' + catData.label + '</strong><br><span style="font-size:12px;color:var(--text-muted);">Вес: ' + (catData.weight * 100) + '%</span></td>';
            }
            html += '<td>' + sub.label + '</td>';
            html += '<td><span class="weight-bar" style="width:' + (sub.weight * 60) + 'px;"></span>' + (sub.weight * 100) + '%</td>';
            html += '<td>' + (catData.weight * sub.weight * 100).toFixed(1) + '%</td>';
            html += '</tr>';
        }
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================================
// 9. RENDER: Comparison Table
// ============================================================
function renderComparison() {
    var container = document.getElementById('comparisonSection');
    var html = '<div class="comparison-table-wrap"><table class="comparison-table">';
    html += '<thead><tr><th>Показатель</th>';

    for (var i = 0; i < scoredData.length; i++) {
        html += '<th>' + scoredData[i].name + '</th>';
    }
    html += '</tr></thead><tbody>';

    // Find max for each metric to highlight
    var metrics = [
        { key: 'score', label: 'Индекс конкурентоспособности', fmt: function(v) { return v; } },
        { key: 'gmv', label: 'GMV (млрд $)', fmt: function(v) { return '$' + v; } },
        { key: 'growth', label: 'Рост рынка (%)', fmt: function(v) { return '+' + v + '%'; } },
        { key: 'aov', label: 'Средний чек AOV ($)', fmt: function(v) { return '$' + v; } },
        { key: 'freq', label: 'Частота покупок (в мес.)', fmt: function(v) { return v; } },
        { key: 'logistic', label: 'Логистика / ПВЗ', fmt: function(v) { return formatNum(v); } },
        { key: 'retention', label: 'Retention Rate (%)', fmt: function(v) { return v + '%'; } },
        { key: 'merchants', label: 'База мерчантов', fmt: function(v) { return formatNum(v); } },
        { key: 'commission', label: 'Комиссия селлера (%)', fmt: function(v) { return v + '%'; } },
        { key: 'fintech', label: 'Финтех / Рассрочка', fmt: function(v) { return v ? '✅ Да' : '❌ Нет'; } },
        { key: 'cart', label: 'Удержание корзины (%)', fmt: function(v) { return v + '%'; } },
        { key: 'gamification', label: 'Геймификация (1-10)', fmt: function(v) { return v + '/10'; } }
    ];

    for (var mi = 0; mi < metrics.length; mi++) {
        var m = metrics[mi];
        var values = [];
        for (var i = 0; i < scoredData.length; i++) {
            var c = scoredData[i];
            var val;
            switch (m.key) {
                case 'score': val = c.score; break;
                case 'gmv': val = c.market_analysis.gmv_billion_usd; break;
                case 'growth': val = c.market_analysis.market_growth_pct; break;
                case 'aov': val = c.market_analysis.average_order_value_usd; break;
                case 'freq': val = c.market_analysis.purchase_frequency_per_month; break;
                case 'logistic': val = c.operational_maturity.logistic_points_count; break;
                case 'retention': val = c.operational_maturity.user_retention_rate_pct; break;
                case 'merchants': val = c.operational_maturity.merchant_base_count; break;
                case 'commission': val = c.product_features.seller_commission_pct; break;
                case 'fintech': val = c.product_features.has_fintech_installment; break;
                case 'cart': val = c.product_features.cart_recovery_efficiency_pct; break;
                case 'gamification': val = c.product_features.gamification_level_score; break;
            }
            values.push(val);
        }

        // Find max (or min for commission/inverted)
        var isInverted = (m.key === 'commission');
        var bestIdx = 0;
        for (var i = 1; i < values.length; i++) {
            if (isInverted) {
                if (values[i] < values[bestIdx]) bestIdx = i;
            } else {
                if (values[i] > values[bestIdx]) bestIdx = i;
            }
        }

        html += '<tr>';
        html += '<td>' + m.label + '</td>';
        for (var i = 0; i < values.length; i++) {
            var val = values[i];
            var formatted = m.fmt(val);
            var isBest = (i === bestIdx);
            html += '<td' + (isBest ? ' style="color:var(--success);font-weight:700;"' : '') + '>' + formatted + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ============================================================
// 10. Populate Radar Select
// ============================================================
function populateRadarSelect() {
    var select = document.getElementById('radarSelect');
    // Clear existing options (keep "Все конкуренты")
    while (select.options.length > 1) {
        select.remove(1);
    }
    for (var i = 0; i < scoredData.length; i++) {
        var opt = document.createElement('option');
        opt.value = scoredData[i].id;
        opt.textContent = scoredData[i].name;
        select.appendChild(opt);
    }
}

// ============================================================
// 11. Recalculate
// ============================================================
function recalculateAll() {
    scoredData = calculateAllScores();
    renderAll();
    showToast('✅ Индексы пересчитаны', 'success');
}

// ============================================================
// 12. CSV Download (с датой парсинга)
// ============================================================
function downloadCSV() {
    var rows = [];
    var parseDate = appState.lastUpdated
        ? new Date(appState.lastUpdated).toLocaleString('ru-RU')
        : new Date().toLocaleString('ru-RU');

    // Header
    var header = [
        'Конкурент',
        'Индекс конкурентоспособности',
        'GMV (млрд $)',
        'Рост рынка (%)',
        'Средний чек AOV ($)',
        'Частота покупок (в мес.)',
        'Логистика / ПВЗ',
        'Retention Rate (%)',
        'База мерчантов',
        'Комиссия селлера (%)',
        'Финтех / Рассрочка',
        'Удержание корзины (%)',
        'Геймификация (1-10)',
        'Дата парсинга данных',
        'Источник данных'
    ];
    rows.push(header.join(','));

    for (var i = 0; i < scoredData.length; i++) {
        var c = scoredData[i];
        var row = [
            '"' + c.name + '"',
            c.score,
            c.market_analysis.gmv_billion_usd,
            c.market_analysis.market_growth_pct,
            c.market_analysis.average_order_value_usd,
            c.market_analysis.purchase_frequency_per_month,
            c.operational_maturity.logistic_points_count,
            c.operational_maturity.user_retention_rate_pct,
            c.operational_maturity.merchant_base_count,
            c.product_features.seller_commission_pct,
            c.product_features.has_fintech_installment ? 'Да' : 'Нет',
            c.product_features.cart_recovery_efficiency_pct,
            c.product_features.gamification_level_score,
            '"' + parseDate + '"',
            '"' + appState.dataSource + '"'
        ];
        rows.push(row.join(','));
    }

    var csvContent = rows.join('\n');
    var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'umayshop_competitor_analysis_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast('📥 Отчёт CSV скачан (с меткой даты парсинга)', 'success');
}

// ============================================================
// 13. AI-апдейт: Интеграция актуальных данных
// ============================================================

/**
 * triggerAIAnalysis() — вызывается по кнопке "Интегрировать актуальный ИИ-апдейт".
 *
 * Функция показывает модальное окно с системным промптом,
 * который пользователь может скопировать и отправить Cline.
 *
 * После того как Cline обновит competitors_live.json через parse.js,
 * пользователь нажимает "Загрузить обновлённые данные" и данные
 * подтягиваются в UI.
 */
function triggerAIAnalysis() {
    // Создаём модальное окно
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'aiModalOverlay';
    overlay.onclick = function(e) {
        if (e.target === overlay) closeModal();
    };

    var modal = document.createElement('div');
    modal.className = 'modal';

    var now = new Date().toISOString();

    // Генерируем промпт на основе текущих данных
    var promptText = generateAIPrompt(now);

    modal.innerHTML =
        '<div class="modal-header">' +
        '   <h3>🤖 Интеграция актуального ИИ-апдейта</h3>' +
        '   <button class="modal-close" onclick="closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '   <p style="margin-bottom:12px;color:var(--text-secondary);font-size:14px;">' +
        '       Скопируйте промпт ниже и отправьте его Cline (или другому ИИ-ассистенту),' +
        '       чтобы обновить данные конкурентов. После обновления JSON нажмите "Загрузить обновлённые данные".' +
        '   </p>' +
        '   <div class="prompt-box">' +
        '       <textarea class="prompt-textarea" id="promptTextarea" readonly rows="18">' + escapeHtml(promptText) + '</textarea>' +
        '   </div>' +
        '   <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">' +
        '       <button class="btn btn-secondary" onclick="copyPrompt()">📋 Копировать промпт</button>' +
        '       <button class="btn btn-primary" onclick="reloadData()">🔄 Загрузить обновлённые данные</button>' +
        '   </div>' +
        '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

/**
 * Генерирует системный промпт для Cline на основе текущих данных
 */
function generateAIPrompt(timestamp) {
    var competitorsJSON = JSON.stringify(appState.competitors, null, 2);
    var weightsJSON = JSON.stringify(modelWeights, null, 2);

    return [
        '## 🤖 Umayshop AI — Системный промпт для обновления данных конкурентов',
        '',
        '**Контекст:** Ты — ИИ-аналитик Umayshop. Обнови данные конкурентов e-commerce.',
        '',
        '### Текущие данные (для справки):',
        '```json',
        competitorsJSON,
        '```',
        '',
        '### Текущие веса AI-модели:',
        '```json',
        weightsJSON,
        '```',
        '',
        '### Инструкция:',
        '1. Найди в интернете актуальные данные по каждой платформе (Kaspi, Temu, Uzum, Wildberries, Ozon).',
        '2. Обнови competitors_data.json с новыми значениями (сохрани ту же структуру JSON).',
        '3. Если данные не найдены — оставь прежние значения.',
        '',
        '### Формат JSON (строго соблюдай схему):',
        '```json',
        '{',
        '  "_meta": {',
        '    "last_updated": "' + timestamp.slice(0, 7) + '",',
        '    "data_source": "Cline AI — поиск в интернете",',
        '    "data_version": "3.1",',
        '    "notes": "Обновление по запросу пользователя"',
        '  },',
        '  "competitors": [',
        '    {',
        '      "id": "kaspi",',
        '      "name": "Kaspi Магазин",',
        '      "market_analysis": {',
        '        "gmv_billion_usd": 18.5,',
        '        "market_growth_pct": 32,',
        '        "average_order_value_usd": 45,',
        '        "purchase_frequency_per_month": 4.2',
        '      },',
        '      "operational_maturity": {',
        '        "logistic_points_count": 12500,',
        '        "user_retention_rate_pct": 78,',
        '        "merchant_base_count": 185000',
        '      },',
        '      "product_features": {',
        '        "seller_commission_pct": 8.5,',
        '        "has_fintech_installment": true,',
        '        "cart_recovery_efficiency_pct": 62,',
        '        "gamification_level_score": 7',
        '      }',
        '    }',
        '  ]',
        '}',
        '```',
        '',
        'После обновления JSON пользователь нажмёт "Загрузить обновлённые данные" в UI.'
    ].join('\n');
}

/**
 * Копирует промпт в буфер обмена
 */
function copyPrompt() {
    var textarea = document.getElementById('promptTextarea');
    if (!textarea) return;
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('📋 Промпт скопирован в буфер обмена', 'success');
    } catch (err) {
        showToast('❌ Не удалось скопировать', 'error');
    }
}

/**
 * reloadData() — перезагружает данные из JSON и обновляет UI
 */
function reloadData() {
    closeModal();
    showToast('🔄 Загружаю обновлённые данные...', '');
    fetchCompetitorData().then(function() {
        scoredData = calculateAllScores();
        renderAll();
        showToast('✅ Данные обновлены из JSON', 'success');
    });
}

/**
 * closeModal() — закрывает модальное окно
 */
function closeModal() {
    var overlay = document.getElementById('aiModalOverlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// ============================================================
// 14. SWOT ANALYSIS GENERATOR
// ============================================================

/**
 * generateSWOT() — генерирует SWOT-анализ на основе выбранного
 * конкурента из селекта comparisonRadarSelect.
 * Сравнивает метрики Umayshop с метриками конкурента и формирует
 * текстовые пункты для каждой из 4 категорий (S-W-O-T).
 */
function generateSWOT() {
    var select = document.getElementById('comparisonRadarSelect');
    var selectedId = select ? select.value : '';
    var container = document.getElementById('swotContainer');

    if (!selectedId || !umayshopScored) {
        if (container) {
            container.style.display = 'block';
            container.innerHTML = '<div class="swot-empty">👆 Сначала выберите конкурента в селекте "Сравнение Umayshop vs Конкурент"</div>';
        }
        showToast('⚠ Выберите конкурента для SWOT-анализа', 'error');
        return;
    }

    // Находим выбранного конкурента
    var competitor = null;
    for (var i = 0; i < scoredData.length; i++) {
        if (scoredData[i].id === selectedId) {
            competitor = scoredData[i];
            break;
        }
    }
    if (!competitor) {
        showToast('❌ Конкурент не найден', 'error');
        return;
    }

    var u = umayshopScored;
    var c = competitor;

    // Вспомогательные функции
    function pctDiff(umayVal, compVal) {
        if (compVal === 0) return 0;
        return Math.round(((umayVal - compVal) / compVal) * 100);
    }

    function absDiff(umayVal, compVal) {
        return Math.abs(Math.round((umayVal - compVal) * 10) / 10);
    }

    // ===== STRENGTHS (S) =====
    var strengths = [];

    // Комиссия селлера — если у Umayshop меньше, это преимущество
    if (u.product_features.seller_commission_pct < c.product_features.seller_commission_pct) {
        var diff = (c.product_features.seller_commission_pct - u.product_features.seller_commission_pct).toFixed(1);
        strengths.push('Критическое преимущество: Комиссия для селлеров ниже на ' + diff + '% (Umayshop: ' + u.product_features.seller_commission_pct + '% vs ' + c.name + ': ' + c.product_features.seller_commission_pct + '%)');
    }

    // Удержание корзины — если у Umayshop выше
    if (u.product_features.cart_recovery_efficiency_pct > c.product_features.cart_recovery_efficiency_pct) {
        var diff = (u.product_features.cart_recovery_efficiency_pct - c.product_features.cart_recovery_efficiency_pct).toFixed(1);
        strengths.push('Технологическое превосходство: ИИ-возврат корзин эффективнее на ' + diff + '% (Umayshop: ' + u.product_features.cart_recovery_efficiency_pct + '% vs ' + c.name + ': ' + c.product_features.cart_recovery_efficiency_pct + '%)');
    }

    // Геймификация — если у Umayshop выше
    if (u.product_features.gamification_level_score > c.product_features.gamification_level_score) {
        var diff = u.product_features.gamification_level_score - c.product_features.gamification_level_score;
        strengths.push('Геймификационное превосходство: Уровень геймификации выше на ' + diff + ' баллов (Umayshop: ' + u.product_features.gamification_level_score + '/10 vs ' + c.name + ': ' + c.product_features.gamification_level_score + '/10)');
    }

    // Рост рынка — если у Umayshop выше
    if (u.market_analysis.market_growth_pct > c.market_analysis.market_growth_pct) {
        var diff = (u.market_analysis.market_growth_pct - c.market_analysis.market_growth_pct).toFixed(1);
        strengths.push('Темпы роста: Umayshop растёт на ' + diff + '% быстрее конкурента (' + u.market_analysis.market_growth_pct + '% vs ' + c.market_analysis.market_growth_pct + '%)');
    }

    // Финтех/рассрочка — если есть у Umayshop, но нет у конкурента
    if (u.product_features.has_fintech_installment && !c.product_features.has_fintech_installment) {
        strengths.push('Финансовое преимущество: Наличие финтех-рассрочки при отсутствии у ' + c.name);
    }

    // Если ничего не найдено
    if (strengths.length === 0) {
        strengths.push('Анализ не выявил явных сильных сторон Umayshop над ' + c.name + ' в текущих метриках');
    }

    // ===== WEAKNESSES (W) =====
    var weaknesses = [];

    // Логистика/ПВЗ — если у конкурента сильно больше
    if (c.operational_maturity.logistic_points_count > u.operational_maturity.logistic_points_count) {
        var ratio = Math.round(c.operational_maturity.logistic_points_count / u.operational_maturity.logistic_points_count);
        weaknesses.push('Отставание в физическом присутствии: ПВЗ меньше в ' + ratio + '× (Umayshop: ' + u.operational_maturity.logistic_points_count + ' vs ' + c.name + ': ' + c.operational_maturity.logistic_points_count + ')');
    }

    // Retention — если у конкурента выше
    if (c.operational_maturity.user_retention_rate_pct > u.operational_maturity.user_retention_rate_pct) {
        var diff = (c.operational_maturity.user_retention_rate_pct - u.operational_maturity.user_retention_rate_pct).toFixed(1);
        weaknesses.push('Удержание пользователей: Retention Rate ниже на ' + diff + '% (Umayshop: ' + u.operational_maturity.user_retention_rate_pct + '% vs ' + c.name + ': ' + c.operational_maturity.user_retention_rate_pct + '%)');
    }

    // GMV — если у конкурента больше
    if (c.market_analysis.gmv_billion_usd > u.market_analysis.gmv_billion_usd) {
        var ratio = (c.market_analysis.gmv_billion_usd / u.market_analysis.gmv_billion_usd).toFixed(1);
        weaknesses.push('Масштаб рынка: GMV конкурента больше в ' + ratio + '× ($' + c.market_analysis.gmv_billion_usd + ' млрд vs $' + u.market_analysis.gmv_billion_usd + ' млрд)');
    }

    // База мерчантов — если у конкурента больше
    if (c.operational_maturity.merchant_base_count > u.operational_maturity.merchant_base_count) {
        var ratio = Math.round(c.operational_maturity.merchant_base_count / u.operational_maturity.merchant_base_count);
        weaknesses.push('Экосистема продавцов: База мерчантов меньше в ' + ratio + '× (' + formatNum(u.operational_maturity.merchant_base_count) + ' vs ' + formatNum(c.operational_maturity.merchant_base_count) + ')');
    }

    // Частота покупок — если у конкурента выше
    if (c.market_analysis.purchase_frequency_per_month > u.market_analysis.purchase_frequency_per_month) {
        var diff = (c.market_analysis.purchase_frequency_per_month - u.market_analysis.purchase_frequency_per_month).toFixed(1);
        weaknesses.push('Частота покупок: Конкурент опережает на ' + diff + ' покупок/мес (' + c.name + ': ' + c.market_analysis.purchase_frequency_per_month + '× vs Umayshop: ' + u.market_analysis.purchase_frequency_per_month + '×)');
    }

    if (weaknesses.length === 0) {
        weaknesses.push('По анализируемым метрикам Umayshop не уступает ' + c.name);
    }

    // ===== OPPORTUNITIES (O) =====
    var opportunities = [];

    // Если у конкурента высокая комиссия — возможность переманить селлеров
    if (c.product_features.seller_commission_pct > 8) {
        opportunities.push('Перехват базы лояльных селлеров за счёт демпинга комиссий (комиссия ' + c.name + ': ' + c.product_features.seller_commission_pct + '% vs Umayshop: ' + u.product_features.seller_commission_pct + '%)');
    }

    // Если у конкурента низкая геймификация — возможность
    if (c.product_features.gamification_level_score < 6) {
        var diff = u.product_features.gamification_level_score - c.product_features.gamification_level_score;
        opportunities.push('Захват ниши за счёт более гибкой геймификации (Umayshop выше на ' + diff + ' баллов) — привлечение молодой аудитории');
    }

    // Если у конкурента низкое удержание корзины
    if (c.product_features.cart_recovery_efficiency_pct < 60) {
        opportunities.push('Улучшение конверсии за счёт превосходства в удержании корзины (Umayshop: ' + u.product_features.cart_recovery_efficiency_pct + '% vs ' + c.name + ': ' + c.product_features.cart_recovery_efficiency_pct + '%)');
    }

    // Если у конкурента нет рассрочки
    if (!c.product_features.has_fintech_installment) {
        opportunities.push('Внедрение финтех-рассрочки как ключевого дифференциатора — ' + c.name + ' не предоставляет такую опцию');
    }

    // Если у конкурента низкий рост
    if (c.market_analysis.market_growth_pct < 50) {
        opportunities.push('Агрессивный захват доли рынка за счёт более высоких темпов роста (Umayshop: +' + u.market_analysis.market_growth_pct + '% vs ' + c.name + ': +' + c.market_analysis.market_growth_pct + '%)');
    }

    // Если у конкурента низкий Retention
    if (c.operational_maturity.user_retention_rate_pct < 60) {
        opportunities.push('Формирование лояльного комьюнити через программы лояльности — Retention ' + c.name + ' (' + c.operational_maturity.user_retention_rate_pct + '%) ниже порога в 60%');
    }

    if (opportunities.length === 0) {
        opportunities.push('Рынок насыщен — требуется поиск нишевых сегментов для дифференциации');
    }

    // ===== THREATS (T) =====
    var threats = [];

    // Масштаб GMV — угроза поглощения трафика
    if (c.market_analysis.gmv_billion_usd > 10) {
        threats.push('Риск поглощения рекламного трафика за счёт колоссального объёма рынка конкурента (GMV $' + c.market_analysis.gmv_billion_usd + ' млрд)');
    }

    // Высокий Retention — угроза "lock-in" эффекта
    if (c.operational_maturity.user_retention_rate_pct > 75) {
        threats.push('Эффект "lock-in": Высокий Retention (' + c.operational_maturity.user_retention_rate_pct + '%) создаёт высокий барьер для переключения пользователей');
    }

    // Огромная база мерчантов
    if (c.operational_maturity.merchant_base_count > 500000) {
        threats.push('Сетевой эффект: Огромная база мерчантов (' + formatNum(c.operational_maturity.merchant_base_count) + ') создаёт непреодолимый барьер входа');
    }

    // Высокая частота покупок
    if (c.market_analysis.purchase_frequency_per_month > 4) {
        threats.push('Привычка пользователей: Высокая частота покупок (' + c.market_analysis.purchase_frequency_per_month + '×/мес) формирует устойчивое потребительское поведение');
    }

    // Низкая комиссия у конкурента — угроза ценовой войны
    if (c.product_features.seller_commission_pct <= 5) {
        threats.push('Ценовая война: ' + c.name + ' устанавливает рекордно низкую комиссию (' + c.product_features.seller_commission_pct + '%), что может спровоцировать демпинг на рынке');
    }

    // Высокая геймификация у конкурента
    if (c.product_features.gamification_level_score >= 8) {
        threats.push('Геймификационный разрыв: ' + c.name + ' задаёт стандарт вовлечения (геймификация ' + c.product_features.gamification_level_score + '/10), что усложняет привлечение молодёжи');
    }

    if (threats.length === 0) {
        threats.push('Текущие метрики не указывают на критические угрозы со стороны ' + c.name);
    }

    // ===== СБОРКА HTML =====
    var html = '';
    html += '<div class="section-title" style="margin-top:8px;">';
    html += '  <div class="icon">🧠</div>';
    html += '  <h2>SWOT-стратегия: Umayshop vs ' + c.name + '</h2>';
    html += '</div>';

    html += '<div class="swot-grid">';

    // S — Strengths
    html += '<div class="swot-card swot-strengths">';
    html += '  <div class="swot-header">';
    html += '    <div class="swot-icon s">⚔️</div>';
    html += '    <div class="swot-title s">Strengths (Сильные стороны)</div>';
    html += '  </div>';
    html += '  <ul class="swot-list">';
    for (var si = 0; si < strengths.length; si++) {
        html += '    <li' + (si === 0 ? ' class="swot-highlight"' : '') + '><span class="swot-num">S' + (si + 1) + '</span>' + strengths[si] + '</li>';
    }
    html += '  </ul>';
    html += '</div>';

    // W — Weaknesses
    html += '<div class="swot-card swot-weaknesses">';
    html += '  <div class="swot-header">';
    html += '    <div class="swot-icon w">🛡️</div>';
    html += '    <div class="swot-title w">Weaknesses (Слабые стороны)</div>';
    html += '  </div>';
    html += '  <ul class="swot-list">';
    for (var wi = 0; wi < weaknesses.length; wi++) {
        html += '    <li' + (wi === 0 ? ' class="swot-highlight"' : '') + '><span class="swot-num">W' + (wi + 1) + '</span>' + weaknesses[wi] + '</li>';
    }
    html += '  </ul>';
    html += '</div>';

    // O — Opportunities
    html += '<div class="swot-card swot-opportunities">';
    html += '  <div class="swot-header">';
    html += '    <div class="swot-icon o">🚀</div>';
    html += '    <div class="swot-title o">Opportunities (Возможности)</div>';
    html += '  </div>';
    html += '  <ul class="swot-list">';
    for (var oi = 0; oi < opportunities.length; oi++) {
        html += '    <li' + (oi === 0 ? ' class="swot-highlight"' : '') + '><span class="swot-num">O' + (oi + 1) + '</span>' + opportunities[oi] + '</li>';
    }
    html += '  </ul>';
    html += '</div>';

    // T — Threats
    html += '<div class="swot-card swot-threats">';
    html += '  <div class="swot-header">';
    html += '    <div class="swot-icon t">⚠️</div>';
    html += '    <div class="swot-title t">Threats (Угрозы)</div>';
    html += '  </div>';
    html += '  <ul class="swot-list">';
    for (var ti = 0; ti < threats.length; ti++) {
        html += '    <li' + (ti === 0 ? ' class="swot-highlight"' : '') + '><span class="swot-num">T' + (ti + 1) + '</span>' + threats[ti] + '</li>';
    }
    html += '  </ul>';
    html += '</div>';

    html += '</div>'; // .swot-grid

    container.innerHTML = html;
    container.style.display = 'block';

    // Плавный скролл к SWOT
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showToast('🧠 SWOT-стратегия сгенерирована для ' + c.name, 'success');
}

// ============================================================
// 15. COMPARISON RADAR (Spider-Chart): Umayshop vs Competitor
// ============================================================

var comparisonRadarInstance = null;

/**
 * Нормализует сырой показатель в 100-балльную шкалу для радара.
 * Для инвертированных метрик (комиссия) — чем меньше, тем лучше.
 */
function normalizeRadar(value, max, invert) {
    var raw = Math.min(value, max) / max;
    var result = invert ? (1 - raw) : raw;
    return Math.round(result * 100);
}

/**
 * Возвращает массив из 6 нормализованных значений для радара.
 * Для объекта данных (Umayshop или конкурент).
 */
function getRadarAxes(data) {
    var ma = data.market_analysis;
    var om = data.operational_maturity;
    var pf = data.product_features;

    return [
        normalizeRadar(ma.gmv_billion_usd, 30, false),           // Масштаб (GMV)
        normalizeRadar(om.user_retention_rate_pct, 100, false),   // Удержание (Retention)
        normalizeRadar(om.logistic_points_count, 30000, false),   // Логистика
        normalizeRadar(pf.gamification_level_score, 10, false),   // Геймификация
        normalizeRadar(pf.seller_commission_pct, 15, true),       // Выгода селлера (инверт.)
        normalizeRadar(pf.cart_recovery_efficiency_pct, 100, false) // Удержание корзины
    ];
}

/**
 * renderComparisonRadar() — рисует Spider-Chart с двумя наборами:
 * Umayshop (циан/фиолетовый) vs выбранный конкурент (красный/оранжевый).
 */
function renderComparisonRadar() {
    var select = document.getElementById('comparisonRadarSelect');
    var selectedId = select ? select.value : '';
    var legendEl = document.getElementById('comparisonRadarLegend');

    if (!selectedId || !umayshopScored) {
        // Показываем пустое состояние
        if (legendEl) {
            legendEl.innerHTML = '<div class="comparison-radar-empty">👆 Выберите конкурента для сравнения</div>';
        }
        if (comparisonRadarInstance) {
            comparisonRadarInstance.destroy();
            comparisonRadarInstance = null;
        }
        return;
    }

    // Находим выбранного конкурента
    var competitor = null;
    for (var i = 0; i < scoredData.length; i++) {
        if (scoredData[i].id === selectedId) {
            competitor = scoredData[i];
            break;
        }
    }
    if (!competitor) return;

    // Нормализованные данные для осей
    var umayAxes = getRadarAxes(umayshopScored);
    var compAxes = getRadarAxes(competitor);

    var labels = [
        'Масштаб (GMV)',
        'Удержание (Retention)',
        'Логистика',
        'Геймификация',
        'Выгода для селлера',
        'Удержание корзины'
    ];

    var ctx = document.getElementById('comparisonRadarChart').getContext('2d');

    if (comparisonRadarInstance) {
        comparisonRadarInstance.destroy();
    }

    comparisonRadarInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Umayshop',
                    data: umayAxes,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',  // циан полупрозрачный
                    borderColor: 'rgba(6, 182, 212, 1)',         // циан
                    borderWidth: 2.5,
                    pointBackgroundColor: 'rgba(6, 182, 212, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1.5,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: competitor.name,
                    data: compAxes,
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',  // красный полупрозрачный
                    borderColor: 'rgba(239, 68, 68, 1)',         // красный
                    borderWidth: 2.5,
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1.5,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false // скрываем встроенную легенду, используем свою
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '/100';
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    pointLabels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter',
                            size: 11,
                            weight: '600'
                        }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: '#64748b',
                        font: {
                            family: 'Inter',
                            size: 10
                        },
                        stepSize: 20,
                        max: 100
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });

    // Обновляем кастомную легенду
    if (legendEl) {
        legendEl.innerHTML =
            '<div class="legend-item">' +
            '  <span class="legend-dot" style="background:rgba(6,182,212,1);"></span>' +
            '  Umayshop' +
            '</div>' +
            '<div class="legend-item">' +
            '  <span class="legend-dot" style="background:rgba(239,68,68,1);"></span>' +
            '  ' + competitor.name +
            '</div>';
    }
}

/**
 * Заполняет селект выбора конкурента для сравнения
 */
function populateComparisonRadarSelect() {
    var select = document.getElementById('comparisonRadarSelect');
    if (!select) return;
    // Очищаем, оставляя первый option
    while (select.options.length > 1) {
        select.remove(1);
    }
    for (var i = 0; i < scoredData.length; i++) {
        var opt = document.createElement('option');
        opt.value = scoredData[i].id;
        opt.textContent = scoredData[i].name;
        select.appendChild(opt);
    }
}

/**
 * Заполняет селект выбора конкурента для Cart Recovery
 */
function populateCartRecoverySelect() {
    var select = document.getElementById('cartRecoverySelect');
    if (!select) return;
    while (select.options.length > 1) {
        select.remove(1);
    }
    for (var i = 0; i < scoredData.length; i++) {
        var opt = document.createElement('option');
        opt.value = scoredData[i].id;
        opt.textContent = scoredData[i].name;
        select.appendChild(opt);
    }
}

/**
 * updateCartRecovery() — обновляет блок сравнения Cart Recovery
 * при выборе конкурента из селекта cartRecoverySelect.
 * Базовый сценарий: 1000 брошенных корзин × $50 AOV = $50 000 потенциал
 */
function updateCartRecovery() {
    var select = document.getElementById('cartRecoverySelect');
    var selectedId = select ? select.value : '';

    // Находим конкурента
    var competitor = null;
    for (var i = 0; i < scoredData.length; i++) {
        if (scoredData[i].id === selectedId) {
            competitor = scoredData[i];
            break;
        }
    }

    // Если конкурент не выбран — показываем пустое состояние
    if (!selectedId || !competitor) {
        var summary = document.getElementById('cartRecoverySummary');
        if (summary) {
            summary.innerHTML = '<div class="cr-summary-empty">👆 Выберите конкурента для сравнения эффективности возврата корзин</div>';
        }
        // Сбрасываем бары
        document.getElementById('crUmayshopFill').style.width = '0%';
        document.getElementById('crUmayshopInnerLabel').textContent = '0%';
        document.getElementById('crUmayshopStats').textContent = 'Возвращено: $0 (0%)';
        document.getElementById('crUmayshopRecovered').textContent = '💚 ИИ-возврат: $0';
        document.getElementById('crUmayshopProfit').textContent = '📈 Доп. прибыль: +$0';
        document.getElementById('crCompFill').style.width = '0%';
        document.getElementById('crCompInnerLabel').textContent = '0%';
        document.getElementById('crCompStats').textContent = 'Возвращено: $0 (0%)';
        document.getElementById('crCompRecovered').textContent = '🔴 Возвращено: $0';
        document.getElementById('crCompLost').textContent = '💸 Упущенная выгода: $0';
        document.getElementById('crCompTitle').textContent = '🏪 Конкурент — Стандартный возврат';
        return;
    }

    // Базовый сценарий
    var BASKETS = 1000;
    var AOV = 50;
    var totalPotential = BASKETS * AOV; // $50 000

    // Umayshop — Conversational Cart Recovery (ИИ)
    var umayRecoveryPct = umayshopScored.product_features.cart_recovery_efficiency_pct / 100;
    var umayRecovered = totalPotential * umayRecoveryPct;
    var umayProfit = umayRecovered * 0.045; // комиссия Umayshop 4.5%

    // Конкурент — стандартный возврат
    var compRecoveryPct = competitor.product_features.cart_recovery_efficiency_pct / 100;
    var compRecovered = totalPotential * compRecoveryPct;
    var compLost = totalPotential - compRecovered;

    // Обновляем заголовок конкурента
    document.getElementById('crCompTitle').textContent = '🏪 ' + competitor.name + ' — Стандартный возврат';

    // Umayshop bar
    var umayPct = Math.round(umayRecoveryPct * 100);
    document.getElementById('crUmayshopFill').style.width = umayPct + '%';
    document.getElementById('crUmayshopInnerLabel').textContent = umayPct + '%';
    document.getElementById('crUmayshopStats').textContent = 'Возвращено: $' + umayRecovered.toLocaleString() + ' (' + umayPct + '%)';
    document.getElementById('crUmayshopRecovered').textContent = '💚 ИИ-возврат: $' + umayRecovered.toLocaleString();
    document.getElementById('crUmayshopProfit').textContent = '📈 Доп. прибыль: +$' + umayProfit.toLocaleString();

    // Competitor bar
    var compPct = Math.round(compRecoveryPct * 100);
    document.getElementById('crCompFill').style.width = compPct + '%';
    document.getElementById('crCompInnerLabel').textContent = compPct + '%';
    document.getElementById('crCompStats').textContent = 'Возвращено: $' + compRecovered.toLocaleString() + ' (' + compPct + '%)';
    document.getElementById('crCompRecovered').textContent = '🔴 Возвращено: $' + compRecovered.toLocaleString();
    document.getElementById('crCompLost').textContent = '💸 Упущенная выгода: $' + compLost.toLocaleString();

    // Summary
    var advantage = umayRecovered - compRecovered;
    var summary = document.getElementById('cartRecoverySummary');
    summary.innerHTML =
        '<div class="cr-summary-result">' +
        '  <div class="cr-summary-item">' +
        '    <span class="cr-summary-label">🤖 Umayshop возвращает</span>' +
        '    <span class="cr-summary-value good">$' + umayRecovered.toLocaleString() + '</span>' +
        '  </div>' +
        '  <div class="cr-summary-divider"></div>' +
        '  <div class="cr-summary-item">' +
        '    <span class="cr-summary-label">🏪 ' + competitor.name + ' возвращает</span>' +
        '    <span class="cr-summary-value bad">$' + compRecovered.toLocaleString() + '</span>' +
        '  </div>' +
        '  <div class="cr-summary-divider"></div>' +
        '  <div class="cr-summary-item">' +
        '    <span class="cr-summary-label">📊 Преимущество Umayshop</span>' +
        '    <span class="cr-summary-value ' + (advantage >= 0 ? 'good' : 'bad') + '">' +
        (advantage >= 0 ? '+' : '') + '$' + advantage.toLocaleString() +
        '    </span>' +
        '  </div>' +
        '</div>';
}

// ============================================================
// 15. MARKET SIPHON CALCULATOR
// ============================================================

/**
 * formatSiphonDollar() — форматирует число в долларовый формат
 * с суффиксами: млн, млрд, трлн.
 */
function formatSiphonDollar(num) {
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + ' трлн';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + ' млрд';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + ' млн';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + ' тыс';
    return '$' + num.toFixed(2);
}

/**
 * updateSiphon() — обновляет калькулятор Market Siphon на основе
 * выбранного конкурента из селекта comparisonRadarSelect.
 * Срабатывает при движении ползунка.
 */
function updateSiphon() {
    var select = document.getElementById('comparisonRadarSelect');
    var selectedId = select ? select.value : '';
    var slider = document.getElementById('siphonSlider');
    var pct = parseFloat(slider ? slider.value : 0.5);

    // Обновляем отображение процента
    var pctDisplay = document.getElementById('siphonPctDisplay');
    if (pctDisplay) pctDisplay.textContent = pct + '%';

    // Если конкурент не выбран — показываем заглушку
    if (!selectedId || !scoredData || scoredData.length === 0) {
        var nameEl = document.getElementById('siphonTargetName');
        var gmvEl = document.getElementById('siphonTargetGmv');
        var gmvRes = document.getElementById('siphonGmvResult');
        var revRes = document.getElementById('siphonRevenueResult');
        if (nameEl) nameEl.textContent = '— выберите конкурента —';
        if (gmvEl) gmvEl.textContent = '$ —';
        if (gmvRes) gmvRes.textContent = '$0';
        if (revRes) revRes.textContent = '$0';
        return;
    }

    // Находим выбранного конкурента
    var competitor = null;
    for (var i = 0; i < scoredData.length; i++) {
        if (scoredData[i].id === selectedId) {
            competitor = scoredData[i];
            break;
        }
    }
    if (!competitor) return;

    var gmv = competitor.market_analysis.gmv_billion_usd; // в млрд $
    var gmvAbsolute = gmv * 1e9; // переводим в доллары

    // Расчёт
    var siphonedGmv = gmvAbsolute * (pct / 100);
    var revenue = siphonedGmv * 0.045; // комиссия Umayshop 4.5%

    // Обновляем заголовки
    var nameEl = document.getElementById('siphonTargetName');
    var gmvEl = document.getElementById('siphonTargetGmv');
    if (nameEl) nameEl.textContent = competitor.name;
    if (gmvEl) gmvEl.textContent = '$' + gmv + ' млрд';

    // Обновляем результаты
    var gmvRes = document.getElementById('siphonGmvResult');
    var revRes = document.getElementById('siphonRevenueResult');
    if (gmvRes) gmvRes.textContent = formatSiphonDollar(siphonedGmv);
    if (revRes) revRes.textContent = formatSiphonDollar(revenue);
}

/**
 * initSiphon() — инициализирует калькулятор при загрузке страницы.
 * Привязывается к изменению селекта конкурента.
 */
function initSiphon() {
    var select = document.getElementById('comparisonRadarSelect');
    if (select) {
        select.addEventListener('change', function() {
            updateSiphon();
        });
    }
    // Первичный вызов
    setTimeout(updateSiphon, 500);
}

// ============================================================
// 16. PITCH DECK MODE (Режим презентации)
// ============================================================

/**
 * togglePitchDeck() — переключает режим презентации.
 * Добавляет/убирает класс .pitch-deck-mode на body.
 * Показывает/скрывает кнопку выхода.
 */
function togglePitchDeck() {
    var body = document.body;
    var panel = document.getElementById('pitchDeckPanel');
    var isActive = body.classList.contains('pitch-deck-mode');

    if (isActive) {
        // Выход из режима презентации
        body.classList.remove('pitch-deck-mode');
        if (panel) {
            var btn = panel.querySelector('button');
            if (btn) btn.textContent = '✕ Выйти из презентации';
        }
        showToast('📊 Режим презентации выключен', 'success');
    } else {
        // Вход в режим презентации
        body.classList.add('pitch-deck-mode');
        if (panel) {
            var btn = panel.querySelector('button');
            if (btn) btn.textContent = '✕ Выйти из презентации';
        }
        showToast('🎬 Режим презентации активирован', 'success');

        // Перерисовываем графики для подстройки размеров
        setTimeout(function() {
            if (typeof renderRadarChart === 'function') renderRadarChart();
            if (typeof renderBarChart === 'function') renderBarChart();
            if (typeof renderComparisonRadar === 'function') renderComparisonRadar();
            // Перерисовываем SWOT, если он был сгенерирован
            var swotContainer = document.getElementById('swotContainer');
            if (swotContainer && swotContainer.style.display !== 'none' && swotContainer.innerHTML.trim() !== '') {
                if (typeof generateSWOT === 'function') generateSWOT();
            }
        }, 300);
    }
}

/**
 * addPitchDeckButton() — добавляет кнопку "Режим презентации"
 * в header-badge или в btn-group.
 */
function addPitchDeckButton() {
    // Добавляем кнопку в btn-group
    var btnGroup = document.querySelector('.btn-group');
    if (btnGroup) {
        var btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.innerHTML = '🎬 Режим презентации';
        btn.onclick = togglePitchDeck;
        btnGroup.appendChild(btn);
    }
}

// ============================================================
// 17. AI USER ANALYTICS — Аналитика пользователей
// ============================================================

/**
 * renderUserAnalytics() — рендерит блок AI-аналитики пользователей
 * для каждого конкурента: причины выбора, статистика возвратов/корзины,
 * количественные метрики (MAU, конверсия и т.д.)
 */
function renderUserAnalytics() {
    var container = document.getElementById('userAnalyticsContainer');
    if (!container) return;

    var html = '';

    // Собираем все данные (Umayshop + конкуренты)
    var allEntities = [];
    if (umayshopScored && appState.umayshop && appState.umayshop.user_analytics) {
        allEntities.push({
            id: umayshopScored.id,
            name: umayshopScored.name,
            score: umayshopScored.score,
            ua: appState.umayshop.user_analytics,
            isUmayshop: true
        });
    }
    for (var i = 0; i < scoredData.length; i++) {
        var comp = appState.competitors.find(function(c) { return c.id === scoredData[i].id; });
        if (comp && comp.user_analytics) {
            allEntities.push({
                id: scoredData[i].id,
                name: scoredData[i].name,
                score: scoredData[i].score,
                ua: comp.user_analytics,
                isUmayshop: false
            });
        }
    }

    if (allEntities.length === 0) {
        container.innerHTML = '<div class="swot-empty">📊 Данные пользовательской аналитики не загружены</div>';
        return;
    }

    // === Секция 1: MAU и ключевые метрики ===
    html += '<div class="section-title">';
    html += '  <div class="icon">👥</div>';
    html += '  <h2>Количественная статистика пользователей (MAU, конверсия, возвраты)</h2>';
    html += '</div>';

    html += '<div class="ua-mau-grid">';
    for (var ei = 0; ei < allEntities.length; ei++) {
        var ent = allEntities[ei];
        var ua = ent.ua;
        var cardClass = ent.isUmayshop ? 'ua-mau-card ua-mau-card-umay' : 'ua-mau-card';
        var rank = getRankLabel(ent.score);

        html += '<div class="' + cardClass + '">';
        html += '  <div class="ua-mau-header">';
        html += '    <span class="ua-mau-name">' + (ent.isUmayshop ? '🚀 ' : '') + ent.name + '</span>';
        if (!ent.isUmayshop) {
            html += '    <span class="badge ' + rank.cls + '" style="font-size:10px;">' + rank.label + '</span>';
        } else {
            html += '    <span class="badge badge-leader" style="font-size:10px;">⚡ Наша платформа</span>';
        }
        html += '  </div>';
        html += '  <div class="ua-mau-body">';
        html += '    <div class="ua-mau-stat">';
        html += '      <span class="ua-mau-stat-icon">👤</span>';
        html += '      <div class="ua-mau-stat-info">';
        html += '        <span class="ua-mau-stat-val">' + ua.mau_millions + ' млн</span>';
        html += '        <span class="ua-mau-stat-lbl">MAU (активные пользователи)</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="ua-mau-stat">';
        html += '      <span class="ua-mau-stat-icon">📈</span>';
        html += '      <div class="ua-mau-stat-info">';
        html += '        <span class="ua-mau-stat-val">' + ua.conversion_rate_pct + '%</span>';
        html += '        <span class="ua-mau-stat-lbl">Конверсия (CR)</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="ua-mau-stat">';
        html += '      <span class="ua-mau-stat-icon">🛒</span>';
        html += '      <div class="ua-mau-stat-info">';
        html += '        <span class="ua-mau-stat-val">' + ua.avg_items_per_order + '</span>';
        html += '        <span class="ua-mau-stat-lbl">Среднее кол-во товаров</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="ua-mau-stat">';
        html += '      <span class="ua-mau-stat-icon">📦</span>';
        html += '      <div class="ua-mau-stat-info">';
        html += '        <span class="ua-mau-stat-val">' + ua.return_rate_pct + '%</span>';
        html += '        <span class="ua-mau-stat-lbl">Возвраты товаров</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="ua-mau-stat">';
        html += '      <span class="ua-mau-stat-icon">🗑️</span>';
        html += '      <div class="ua-mau-stat-info">';
        html += '        <span class="ua-mau-stat-val">' + ua.cart_abandonment_rate_pct + '%</span>';
        html += '        <span class="ua-mau-stat-lbl">Брошенные корзины</span>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    }
    html += '</div>';

    // === Секция 2: Причины выбора маркетплейса (AI-анализ) ===
    html += '<div class="section-title" style="margin-top:32px;">';
    html += '  <div class="icon">🧠</div>';
    html += '  <h2>AI-анализ: Причины выбора маркетплейса пользователями</h2>';
    html += '</div>';

    html += '<div class="ua-reasons-grid">';
    for (var ei = 0; ei < allEntities.length; ei++) {
        var ent = allEntities[ei];
        var ua = ent.ua;
        var reasons = ua.top_reasons || [];
        var cardClass = ent.isUmayshop ? 'ua-reasons-card ua-reasons-card-umay' : 'ua-reasons-card';

        html += '<div class="' + cardClass + '">';
        html += '  <div class="ua-reasons-header">';
        html += '    <span class="ua-reasons-name">' + (ent.isUmayshop ? '🚀 ' : '') + ent.name + '</span>';
        html += '    <span class="ua-reasons-score">Индекс: ' + ent.score + '/100</span>';
        html += '  </div>';
        html += '  <div class="ua-reasons-body">';
        html += '    <div class="ua-reasons-label">🔑 Ключевые причины выбора:</div>';
        html += '    <ol class="ua-reasons-list">';
        for (var ri = 0; ri < reasons.length; ri++) {
            html += '      <li>' + reasons[ri] + '</li>';
        }
        html += '    </ol>';
        html += '  </div>';
        html += '  <div class="ua-reasons-footer">';
        html += '    <span class="ua-reasons-ai">🤖 AI-анализ поведенческих факторов</span>';
        html += '  </div>';
        html += '</div>';
    }
    html += '</div>';

    // === Секция 3: Сравнительная таблица пользовательских метрик ===
    html += '<div class="section-title" style="margin-top:32px;">';
    html += '  <div class="icon">📊</div>';
    html += '  <h2>Сравнительная таблица пользовательской аналитики</h2>';
    html += '</div>';

    html += '<div class="comparison-table-wrap">';
    html += '<table class="comparison-table">';
    html += '<thead><tr><th>Показатель</th>';
    for (var ei = 0; ei < allEntities.length; ei++) {
        html += '<th>' + allEntities[ei].name + '</th>';
    }
    html += '</tr></thead><tbody>';

    var userMetrics = [
        { key: 'mau_millions', label: 'MAU (млн)', fmt: function(v) { return v + ' млн'; }, invert: false },
        { key: 'conversion_rate_pct', label: 'Конверсия (CR %)', fmt: function(v) { return v + '%'; }, invert: false },
        { key: 'avg_items_per_order', label: 'Среднее кол-во товаров', fmt: function(v) { return v; }, invert: false },
        { key: 'return_rate_pct', label: 'Возвраты товаров (%)', fmt: function(v) { return v + '%'; }, invert: true },
        { key: 'cart_abandonment_rate_pct', label: 'Брошенные корзины (%)', fmt: function(v) { return v + '%'; }, invert: true }
    ];

    for (var mi = 0; mi < userMetrics.length; mi++) {
        var m = userMetrics[mi];
        var values = [];
        for (var ei = 0; ei < allEntities.length; ei++) {
            values.push(allEntities[ei].ua[m.key]);
        }

        // Находим лучшее значение
        var bestIdx = 0;
        for (var vi = 1; vi < values.length; vi++) {
            if (m.invert) {
                if (values[vi] < values[bestIdx]) bestIdx = vi;
            } else {
                if (values[vi] > values[bestIdx]) bestIdx = vi;
            }
        }

        html += '<tr>';
        html += '<td>' + m.label + '</td>';
        for (var vi = 0; vi < values.length; vi++) {
            var isBest = (vi === bestIdx);
            html += '<td' + (isBest ? ' style="color:var(--success);font-weight:700;"' : '') + '>' + m.fmt(values[vi]) + '</td>';
        }
        html += '</tr>';
    }

    html += '</tbody></table></div>';

    container.innerHTML = html;
}

// ============================================================
// 19. RENDER ALL
// ============================================================
function renderAll() {
    umayshopScored = calculateUmayshopScore();
    renderUmayshopCard();
    renderStats();
    renderCards();
    renderRadarChart();
    renderBarChart();
    renderWeights();
    renderComparison();
    populateRadarSelect();
    populateComparisonRadarSelect();
    populateCartRecoverySelect();
    renderComparisonRadar();
    updateCartRecovery();
    renderUserAnalytics();
}

// ============================================================
// 18. INIT
// ============================================================
(function init() {
    // Добавляем кнопку Pitch Deck
    addPitchDeckButton();

    // Загружаем данные
    fetchCompetitorData().then(function() {
        scoredData = calculateAllScores();
        renderAll();
        // Инициализируем Siphon калькулятор после загрузки данных
        initSiphon();
    });
})();
