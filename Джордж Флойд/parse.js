#!/usr/bin/env node

/**
 * ============================================================
 * parse.js — Node.js Data Ingestion & Parser для Umayshop AI
 * ============================================================
 *
 * Назначение:
 *   Парсер для обновления competitors_live.json актуальными
 *   данными из внешних источников (API, CSV, ручной ввод).
 *
 * Использование:
 *   node parse.js                          — показать справку
 *   node parse.js --help                   — справка
 *   node parse.js --status                 — показать текущее состояние JSON
 *   node parse.js --update <file.json>     — загрузить данные из внешнего JSON
 *   node parse.js --merge <file.json>      — смержить данные (обновить только указанные поля)
 *   node parse.js --reset                  — сбросить к базовым данным
 *   node parse.js --fetch-currency         — получить курсы валют (пример интеграции с API)
 *
 * Формат входного JSON для --update / --merge:
 *   {
 *     "_meta": {
 *       "last_updated": "2026-06-14T22:20:00.000Z",
 *       "data_source": "ручной ввод / API",
 *       "notes": "комментарий"
 *     },
 *     "competitors": [ ... ]  // массив объектов конкурентов
 *   }
 *
 * Пример интеграции с Cline (AI-апдейт):
 *   После того как Cline найдёт свежие данные в интернете,
 *   он сгенерирует обновлённый JSON и вызовет:
 *   node parse.js --update cline_update.json
 *
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'competitors_live.json');

// ============================================================
// Базовые данные (fallback, если файл повреждён)
// ============================================================
const BASE_DATA = {
  "_meta": {
    "last_updated": new Date().toISOString(),
    "data_source": "Umayshop AI — базовый датасет",
    "data_version": "2.4",
    "notes": "Базовые данные конкурентов e-commerce"
  },
  "competitors": [
    {
      "id": "kaspi", "name": "Kaspi Магазин",
      "market_analysis": { "gmv_billion_usd": 18.5, "market_growth_pct": 32, "average_order_value_usd": 45, "purchase_frequency_per_month": 4.2 },
      "operational_maturity": { "logistic_points_count": 12500, "user_retention_rate_pct": 78, "merchant_base_count": 185000 },
      "product_features": { "seller_commission_pct": 8.5, "has_fintech_installment": true, "cart_recovery_efficiency_pct": 62, "gamification_level_score": 7 }
    },
    {
      "id": "temu", "name": "Temu",
      "market_analysis": { "gmv_billion_usd": 28.0, "market_growth_pct": 145, "average_order_value_usd": 25, "purchase_frequency_per_month": 6.8 },
      "operational_maturity": { "logistic_points_count": 3400, "user_retention_rate_pct": 45, "merchant_base_count": 95000 },
      "product_features": { "seller_commission_pct": 5.0, "has_fintech_installment": false, "cart_recovery_efficiency_pct": 48, "gamification_level_score": 9 }
    },
    {
      "id": "uzum", "name": "Uzum",
      "market_analysis": { "gmv_billion_usd": 3.2, "market_growth_pct": 89, "average_order_value_usd": 32, "purchase_frequency_per_month": 3.5 },
      "operational_maturity": { "logistic_points_count": 5800, "user_retention_rate_pct": 62, "merchant_base_count": 72000 },
      "product_features": { "seller_commission_pct": 6.0, "has_fintech_installment": true, "cart_recovery_efficiency_pct": 55, "gamification_level_score": 6 }
    },
    {
      "id": "wildberries", "name": "Wildberries",
      "market_analysis": { "gmv_billion_usd": 22.0, "market_growth_pct": 41, "average_order_value_usd": 38, "purchase_frequency_per_month": 5.1 },
      "operational_maturity": { "logistic_points_count": 28000, "user_retention_rate_pct": 71, "merchant_base_count": 210000 },
      "product_features": { "seller_commission_pct": 12.0, "has_fintech_installment": true, "cart_recovery_efficiency_pct": 58, "gamification_level_score": 5 }
    },
    {
      "id": "ozon", "name": "Ozon",
      "market_analysis": { "gmv_billion_usd": 14.8, "market_growth_pct": 55, "average_order_value_usd": 40, "purchase_frequency_per_month": 4.5 },
      "operational_maturity": { "logistic_points_count": 19500, "user_retention_rate_pct": 68, "merchant_base_count": 165000 },
      "product_features": { "seller_commission_pct": 10.0, "has_fintech_installment": true, "cart_recovery_efficiency_pct": 60, "gamification_level_score": 6 }
    }
  ]
};

// ============================================================
// Вспомогательные функции
// ============================================================

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.warn('⚠ Файл не найден. Создаю базовый датасет.');
      writeData(BASE_DATA);
      return JSON.parse(JSON.stringify(BASE_DATA));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.competitors || !Array.isArray(parsed.competitors)) {
      throw new Error('Неверная структура: отсутствует массив competitors');
    }
    return parsed;
  } catch (err) {
    console.error('❌ Ошибка чтения:', err.message);
    console.log('↻ Восстанавливаю базовый датасет...');
    writeData(BASE_DATA);
    return JSON.parse(JSON.stringify(BASE_DATA));
  }
}

function writeData(data) {
  data._meta.last_updated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✅ Данные сохранены в', DATA_FILE);
  console.log('   Время обновления:', data._meta.last_updated);
}

function showStatus() {
  const data = readData();
  console.log('\n📊 СТАТУС ДАННЫХ UMAYSHOP AI');
  console.log('═══════════════════════════════');
  console.log(`   Источник:     ${data._meta.data_source}`);
  console.log(`   Версия:       ${data._meta.data_version || 'N/A'}`);
  console.log(`   Обновлено:    ${data._meta.last_updated}`);
  console.log(`   Конкурентов:  ${data.competitors.length}`);
  console.log('───────────────────────────────');
  data.competitors.forEach(c => {
    console.log(`   • ${c.name} (${c.id}) — GMV: $${c.market_analysis.gmv_billion_usd} млрд`);
  });
  console.log('═══════════════════════════════\n');
}

function validateCompetitor(comp, index) {
  const errors = [];
  if (!comp.id) errors.push('id');
  if (!comp.name) errors.push('name');
  if (!comp.market_analysis || typeof comp.market_analysis.gmv_billion_usd !== 'number') errors.push('market_analysis.gmv_billion_usd');
  if (!comp.operational_maturity || typeof comp.operational_maturity.logistic_points_count !== 'number') errors.push('operational_maturity.logistic_points_count');
  if (!comp.product_features || typeof comp.product_features.seller_commission_pct !== 'number') errors.push('product_features.seller_commission_pct');
  if (errors.length > 0) {
    console.warn(`⚠ Конкурент #${index + 1} (${comp.name || '?'}): пропущены поля: ${errors.join(', ')}`);
    return false;
  }
  return true;
}

function updateFromFile(inputPath, mode) {
  const inputFile = path.resolve(inputPath);
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Файл не найден: ${inputFile}`);
    process.exit(1);
  }

  let inputData;
  try {
    inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  } catch (err) {
    console.error('❌ Ошибка парсинга JSON:', err.message);
    process.exit(1);
  }

  if (!inputData.competitors || !Array.isArray(inputData.competitors)) {
    console.error('❌ Входной JSON не содержит массив "competitors"');
    process.exit(1);
  }

  if (mode === 'update') {
    // Полная замена
    const valid = inputData.competitors.filter((c, i) => validateCompetitor(c, i));
    const result = {
      _meta: {
        last_updated: new Date().toISOString(),
        data_source: inputData._meta?.data_source || 'внешний источник',
        data_version: inputData._meta?.data_version || '2.4',
        notes: inputData._meta?.notes || 'Обновление через parse.js --update'
      },
      competitors: valid
    };
    writeData(result);
    console.log(`   Загружено ${valid.length} конкурентов (${inputData.competitors.length - valid.length} пропущено с ошибками)`);
  } else if (mode === 'merge') {
    // Мерж: обновляем существующих по id, добавляем новых
    const current = readData();
    const currentMap = new Map(current.competitors.map(c => [c.id, c]));

    inputData.competitors.forEach((c, i) => {
      if (!validateCompetitor(c, i)) return;
      if (currentMap.has(c.id)) {
        // Глубокое слияние
        const existing = currentMap.get(c.id);
        currentMap.set(c.id, deepMerge(existing, c));
      } else {
        currentMap.set(c.id, c);
      }
    });

    const result = {
      _meta: {
        last_updated: new Date().toISOString(),
        data_source: inputData._meta?.data_source || 'мерж с внешним источником',
        data_version: current._meta.data_version || '2.4',
        notes: inputData._meta?.notes || 'Мерж данных через parse.js --merge'
      },
      competitors: Array.from(currentMap.values())
    };
    writeData(result);
    console.log(`   После мержа: ${result.competitors.length} конкурентов`);
  }
}

function deepMerge(target, source) {
  const result = JSON.parse(JSON.stringify(target));
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function resetToBase() {
  writeData(JSON.parse(JSON.stringify(BASE_DATA)));
  console.log('↻ Данные сброшены к базовому датасету.');
}

async function fetchCurrencyRates() {
  console.log('🌐 Запрашиваю курсы валют (пример интеграции с API)...');
  try {
    const https = require('https');
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';

    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Ошибка парсинга ответа')); }
        });
      }).on('error', reject);
    });

    console.log('✅ Курсы валют получены:');
    console.log(`   USD/KZT: ${response.rates.KZT || 'N/A'}`);
    console.log(`   USD/RUB: ${response.rates.RUB || 'N/A'}`);
    console.log(`   USD/UZS: ${response.rates.UZS || 'N/A'}`);

    // Сохраняем курсы в отдельный файл для использования в UI
    const ratesPath = path.join(__dirname, 'currency_rates.json');
    fs.writeFileSync(ratesPath, JSON.stringify({
      fetched_at: new Date().toISOString(),
      base: 'USD',
      rates: {
        KZT: response.rates.KZT || null,
        RUB: response.rates.RUB || null,
        UZS: response.rates.UZS || null,
        EUR: response.rates.EUR || null
      }
    }, null, 2), 'utf-8');
    console.log(`   Курсы сохранены в ${ratesPath}`);
    return response.rates;
  } catch (err) {
    console.error('❌ Ошибка получения курсов:', err.message);
    return null;
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   parse.js — Umayshop AI Data Ingestion Tool            ║
╚══════════════════════════════════════════════════════════╝

Использование:
  node parse.js --status              Показать статус данных
  node parse.js --update <file.json>  Полная замена данных из JSON
  node parse.js --merge <file.json>   Слияние данных (обновление по id)
  node parse.js --reset               Сброс к базовому датасету
  node parse.js --fetch-currency      Получить курсы валют (USD/KZT/RUB/UZS)
  node parse.js --help                Эта справка

Примеры:
  node parse.js --status
  node parse.js --update ./data/new_competitors.json
  node parse.js --merge ./data/patch.json
  node parse.js --fetch-currency
`);
    return;
  }

  if (args.includes('--status')) {
    showStatus();
    return;
  }

  if (args.includes('--reset')) {
    resetToBase();
    return;
  }

  if (args.includes('--fetch-currency')) {
    await fetchCurrencyRates();
    return;
  }

  const updateIdx = args.indexOf('--update');
  if (updateIdx !== -1 && args[updateIdx + 1]) {
    updateFromFile(args[updateIdx + 1], 'update');
    return;
  }

  const mergeIdx = args.indexOf('--merge');
  if (mergeIdx !== -1 && args[mergeIdx + 1]) {
    updateFromFile(args[mergeIdx + 1], 'merge');
    return;
  }

  console.error('❌ Неизвестная команда. Используйте --help для справки.');
  process.exit(1);
}

main().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
