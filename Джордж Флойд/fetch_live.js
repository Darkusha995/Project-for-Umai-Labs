/**
 * fetch_live.js — Скрипт для сбора актуальных данных о конкурентах e-commerce
 *
 * Использование:
 *   1. Установи зависимости: npm install axios cheerio
 *   2. Запусти: node fetch_live.js
 *   3. Скрипт обновит файл competitors_data.json
 *
 * Скрипт пытается получить данные из открытых источников.
 * Если источник недоступен — использует последние известные значения.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const DATA_FILE = path.join(__dirname, 'competitors_data.json');
const TIMEOUT_MS = 15000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// ============================================================
// ЗАГРУЗКА ТЕКУЩИХ ДАННЫХ
// ============================================================
function loadCurrentData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn('⚠ Не удалось прочитать текущий data.json:', e.message);
    }
    return null;
}

// ============================================================
// HTTP-ХЕЛПЕР
// ============================================================
async function fetchUrl(url, parser) {
    try {
        const response = await axios.get(url, {
            timeout: TIMEOUT_MS,
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/json, text/html, */*'
            }
        });
        return parser ? parser(response.data) : response.data;
    } catch (err) {
        console.warn(`⚠ [${url}] — ${err.message}`);
        return null;
    }
}

// ============================================================
// ПАРСЕРЫ ДЛЯ КАЖДОГО КОНКУРЕНТА
// ============================================================

/**
 * Kaspi.kz — публичные данные с KASE / IR
 * Источники: https://ir.kaspi.kz, https://kase.kz
 */
async function fetchKaspiData() {
    console.log('🔍 Kaspi.kz: запрос данных...');

    // Пробуем получить данные через IR Kaspi (JSONP-эндпоинт)
    const irData = await fetchUrl(
        'https://ir.kaspi.kz/api/v1/key-metrics?lang=ru',
        (data) => {
            // Парсим ключевые метрики
            const result = {};
            if (data && Array.isArray(data)) {
                data.forEach(item => {
                    if (item.key === 'gmv') result.gmv = parseFloat(item.value) || null;
                    if (item.key === 'marketplace_gmv') result.marketplaceGmv = parseFloat(item.value) || null;
                    if (item.key === 'active_users') result.activeUsers = parseInt(item.value) || null;
                    if (item.key === 'merchants') result.merchants = parseInt(item.value) || null;
                });
            }
            return result;
        }
    );

    // Пробуем получить цену акций KASE как индикатор
    const stockData = await fetchUrl(
        'https://api.kase.kz/api/v2/securities/KSPI',
        (data) => {
            if (data && data.last_price) {
                return { stockPrice: data.last_price };
            }
            return null;
        }
    );

    // Возвращаем собранные данные (или null, если ничего не нашли)
    if (irData && (irData.gmv || irData.marketplaceGmv)) {
        return {
            source: 'ir.kaspi.kz (API)',
            gmv_billion_usd: irData.marketplaceGmv
                ? Math.round(irData.marketplaceGmv / 1000 * 10) / 10
                : irData.gmv
                    ? Math.round(irData.gmv / 1000 * 10) / 10
                    : null,
            merchant_base_count: irData.merchants || null,
            active_users: irData.activeUsers || null,
            stock_price: stockData?.stockPrice || null
        };
    }

    // Если API не ответил — возвращаем null (используем fallback)
    console.log('⚠ Kaspi.kz: API недоступен, будет использован fallback');
    return null;
}

/**
 * Temu (PDD Holdings) — данные из отчётов PDD
 * Источники: https://investors.pddholdings.com
 */
async function fetchTemuData() {
    console.log('🔍 Temu (PDD Holdings): запрос данных...');

    // Пробуем получить данные через финансовый API PDD
    const pddData = await fetchUrl(
        'https://financialmodelingprep.com/api/v3/profile/PDD?apikey=demo',
        (data) => {
            if (data && data[0]) {
                return {
                    marketCap: data[0].marketCap,
                    revenue: data[0].revenue,
                    revenueGrowth: data[0].revenueGrowth
                };
            }
            return null;
        }
    );

    if (pddData && pddData.revenue) {
        // PDD revenue в млрд USD, Temu составляет ~40-50% выручки PDD
        const temuShare = 0.45;
        const estimatedGmv = Math.round(pddData.revenue * temuShare * 10) / 10;
        return {
            source: 'financialmodelingprep.com (PDD Holdings)',
            gmv_billion_usd: estimatedGmv,
            revenue_growth_pct: pddData.revenueGrowth
                ? Math.round(pddData.revenueGrowth * 100)
                : null,
            market_cap: pddData.marketCap
        };
    }

    console.log('⚠ Temu: API недоступен, будет использован fallback');
    return null;
}

/**
 * Uzum — данные из открытых источников
 * Источники: TechCrunch, Spot.uz, местные СМИ
 */
async function fetchUzumData() {
    console.log('🔍 Uzum: запрос данных...');

    // Пробуем получить данные через Crunchbase API (публичный)
    const cbData = await fetchUrl(
        'https://api.crunchbase.com/api/v4/entities/organizations/uzum?user_key=demo',
        (data) => {
            if (data && data.properties) {
                return {
                    funding: data.properties.total_funding_usd,
                    valuation: data.properties.valuation_usd,
                    short_description: data.properties.short_description
                };
            }
            return null;
        }
    );

    if (cbData && cbData.valuation) {
        const valuationBln = Math.round(cbData.valuation / 1e9 * 10) / 10;
        return {
            source: 'crunchbase.com',
            valuation_billion_usd: valuationBln,
            funding_total: cbData.funding
        };
    }

    console.log('⚠ Uzum: API недоступен, будет использован fallback');
    return null;
}

/**
 * Wildberries — данные из отчётов
 * Источники: https://ir.wildberries.ru
 */
async function fetchWildberriesData() {
    console.log('🔍 Wildberries: запрос данных...');

    const wbData = await fetchUrl(
        'https://ir.wildberries.ru/api/v1/key-indicators',
        (data) => {
            if (data && data.gmv) {
                return {
                    gmv: data.gmv,
                    orders: data.orders_count,
                    activeSellers: data.active_sellers
                };
            }
            return null;
        }
    );

    if (wbData && wbData.gmv) {
        return {
            source: 'ir.wildberries.ru',
            gmv_billion_usd: Math.round(wbData.gmv / 1000 * 10) / 10,
            orders_count: wbData.orders,
            active_sellers: wbData.activeSellers
        };
    }

    console.log('⚠ Wildberries: API недоступен, будет использован fallback');
    return null;
}

/**
 * Ozon — данные из отчётов
 * Источники: https://ir.ozon.com
 */
async function fetchOzonData() {
    console.log('🔍 Ozon: запрос данных...');

    const ozonData = await fetchUrl(
        'https://ir.ozon.com/api/v1/operational-metrics',
        (data) => {
            if (data && data.gmv) {
                return {
                    gmv: data.gmv,
                    activeBuyers: data.active_buyers,
                    orders: data.orders_count
                };
            }
            return null;
        }
    );

    if (ozonData && ozonData.gmv) {
        return {
            source: 'ir.ozon.com',
            gmv_billion_usd: Math.round(ozonData.gmv / 1000 * 10) / 10,
            active_buyers: ozonData.activeBuyers,
            orders_count: ozonData.orders
        };
    }

    console.log('⚠ Ozon: API недоступен, будет использован fallback');
    return null;
}

// ============================================================
// ОБНОВЛЕНИЕ ДАННЫХ
// ============================================================
function updateCompetitorData(currentData, id, liveData) {
    if (!liveData) {
        console.log(`  → ${id}: данные не получены, оставляю текущие`);
        return;
    }

    const competitor = currentData.competitors.find(c => c.id === id);
    if (!competitor) {
        console.log(`  → ${id}: не найден в data.json, пропускаю`);
        return;
    }

    console.log(`  → ${id}: обновляю данные из ${liveData.source}`);

    // Обновляем GMV если нашли
    if (liveData.gmv_billion_usd) {
        competitor.market_analysis.gmv_billion_usd = liveData.gmv_billion_usd;
    }

    // Обновляем рост рынка если нашли
    if (liveData.revenue_growth_pct) {
        competitor.market_analysis.market_growth_pct = liveData.revenue_growth_pct;
    }

    // Обновляем базу мерчантов если нашли
    if (liveData.merchant_base_count) {
        competitor.operational_maturity.merchant_base_count = liveData.merchant_base_count;
    }

    // Обновляем мета-информацию
    currentData._meta.last_updated = new Date().toISOString().slice(0, 7);
    currentData._meta.data_source = liveData.source
        ? `Live fetch: ${liveData.source}`
        : 'Fallback (источники недоступны)';
    currentData._meta.data_version = '3.1';
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   Umayshop — Live Data Fetcher v1.0         ║');
    console.log('║   Сбор данных о конкурентах e-commerce      ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // Загружаем текущие данные
    const currentData = loadCurrentData();
    if (!currentData) {
        console.error('❌ Не найден competitors_data.json. Сначала создай его.');
        process.exit(1);
    }

    console.log(`📂 Загружены данные для ${currentData.competitors.length} конкурентов`);
    console.log(`🕒 Текущая версия: ${currentData._meta.data_version} (${currentData._meta.last_updated})`);
    console.log('');

    // Собираем данные параллельно
    console.log('🚀 Запуск сбора данных...');
    console.log('');

    const results = await Promise.allSettled([
        fetchKaspiData().then(d => ({ id: 'kaspi', data: d })),
        fetchTemuData().then(d => ({ id: 'temu', data: d })),
        fetchUzumData().then(d => ({ id: 'uzum', data: d })),
        fetchWildberriesData().then(d => ({ id: 'wildberries', data: d })),
        fetchOzonData().then(d => ({ id: 'ozon', data: d }))
    ]);

    console.log('');

    // Обрабатываем результаты
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            updateCompetitorData(currentData, result.value.id, result.value.data);
        } else {
            console.log(`  → Ошибка: ${result.reason?.message || 'неизвестная ошибка'}`);
        }
    });

    // Сохраняем обновлённый файл
    console.log('');
    console.log('💾 Сохраняю обновлённые данные...');
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf-8');

    console.log('');
    console.log('✅ Готово! Файл обновлён:', DATA_FILE);
    console.log(`   Версия: ${currentData._meta.data_version}`);
    console.log(`   Источник: ${currentData._meta.data_source}`);
    console.log(`   Конкурентов: ${currentData.competitors.length}`);
    console.log('');

    // Выводим сводку
    console.log('📊 Сводка данных:');
    console.log('─'.repeat(50));
    currentData.competitors.forEach(c => {
        const ma = c.market_analysis;
        console.log(`  ${c.name.padEnd(20)} GMV: $${ma.gmv_billion_usd} млрд  Рост: ${ma.market_growth_pct}%`);
    });
    console.log('─'.repeat(50));
    console.log('');
    console.log('💡 Запусти index.html через Live Server, чтобы увидеть обновлённые данные.');
}

main().catch(err => {
    console.error('❌ Критическая ошибка:', err);
    process.exit(1);
});
