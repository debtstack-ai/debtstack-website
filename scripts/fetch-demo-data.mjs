// scripts/fetch-demo-data.mjs
// Prebuild script: fetches real data from backend API for demo display.
// Writes to data/demo-data.json. Falls back gracefully on failure.

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'data', 'demo-data.json');

const BACKEND_URL = process.env.BACKEND_URL || 'https://credible-ai-production.up.railway.app';
const DEMO_API_KEY = process.env.DEMO_API_KEY;
const TICKER = 'RIG';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${DEMO_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

// Format large numbers to billions string (e.g. "5.2B")
function toBillions(cents) {
  const billions = cents / 100_000_000_000;
  if (billions >= 10) return `$${Math.round(billions)}B`;
  if (billions >= 1) return `$${billions.toFixed(1)}B`;
  return `$${(billions * 1000).toFixed(0)}M`;
}

// Format to billions number (e.g. 5.2)
function toBillionsNum(cents) {
  return Math.round((cents / 100_000_000_000) * 10) / 10;
}

function transformStructure(company, entities, bonds) {
  const entityTypeOrder = { 'holdco': 0, 'parent': 0, 'finco': 1, 'intermediate': 1, 'opco': 2, 'subsidiary': 2 };

  const colorSchemes = [
    { bg: 'blue-50', border: 'blue-200', badge: 'blue-600', text: 'blue-600' },
    { bg: 'amber-50', border: 'amber-200', badge: 'amber-600', text: 'amber-600' },
    { bg: 'purple-50', border: 'purple-200', badge: 'purple-600', text: 'purple-600' },
    { bg: 'emerald-50', border: 'emerald-200', badge: 'emerald-600', text: 'emerald-600' },
  ];

  const labelMap = {
    'holdco': 'HoldCo', 'parent': 'HoldCo',
    'finco': 'FinCo', 'intermediate': 'Intermediate',
    'opco': 'OpCo', 'subsidiary': 'OpCo',
  };

  // Compute debt per issuer (using outstanding, principal, or commitment)
  const debtByIssuerName = {};
  for (const bond of bonds) {
    const name = bond.issuer_name;
    if (!name) continue;
    if (!debtByIssuerName[name]) debtByIssuerName[name] = { total: 0, secured: 0, unsecured: 0, type: bond.issuer_type, issuerId: bond.issuer_id };
    const amt = bond.outstanding || bond.principal || bond.commitment || 0;
    debtByIssuerName[name].total += amt;
    const seniority = (bond.seniority || '').toLowerCase();
    const isSecured = seniority.includes('secured') && !seniority.includes('unsecured');
    if (isSecured) debtByIssuerName[name].secured += amt;
    else debtByIssuerName[name].unsecured += amt;
  }

  // Build a map of all significant entities: borrowers with debt + guarantors
  const significantEntities = new Map();

  // Add entities with debt from bonds
  for (const [name, d] of Object.entries(debtByIssuerName)) {
    if (d.total > 0) {
      const traverseEntity = entities.find(e => e.name === name || e.id === d.issuerId);
      significantEntities.set(name, {
        name,
        entity_type: d.type || traverseEntity?.entity_type || 'subsidiary',
        jurisdiction: traverseEntity?.jurisdiction || '',
        is_guarantor: traverseEntity?.is_guarantor || false,
        is_borrower: true,
        debt: { total: d.total, secured: d.secured, unsecured: d.unsecured },
      });
    }
  }

  // Add guarantors from traverse (even if they don't have direct debt)
  for (const e of entities) {
    if (e.is_guarantor && !significantEntities.has(e.name)) {
      significantEntities.set(e.name, {
        name: e.name,
        entity_type: e.entity_type || 'finco',
        jurisdiction: e.jurisdiction || '',
        is_guarantor: true,
        is_borrower: e.is_borrower || false,
        debt: { total: 0, secured: 0, unsecured: 0 },
      });
    }
  }

  // Add parent company as HoldCo
  const parentName = company.name;
  if (!significantEntities.has(parentName)) {
    significantEntities.set(parentName, {
      name: parentName,
      entity_type: 'holdco',
      jurisdiction: 'Switzerland · Public (NYSE)',
      is_guarantor: false,
      is_borrower: false,
      debt: { total: 0, secured: 0, unsecured: 0 },
    });
  } else {
    const parent = significantEntities.get(parentName);
    parent.entity_type = 'holdco';
    if (!parent.jurisdiction) parent.jurisdiction = 'Switzerland · Public (NYSE)';
  }

  // Convert to array and sort by hierarchy
  let allEntities = Array.from(significantEntities.values());
  allEntities.sort((a, b) => {
    const aOrder = entityTypeOrder[a.entity_type?.toLowerCase()] ?? 1;
    const bOrder = entityTypeOrder[b.entity_type?.toLowerCase()] ?? 1;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Secondary sort: entities with more debt first
    return b.debt.total - a.debt.total;
  });

  // Take top 4 entities for the demo (to show deeper structure)
  const selected = allEntities.slice(0, 4);

  const structureEntities = selected.map((e, i) => {
    const debt = e.debt;
    const instruments = [];

    if (debt.total > 0) {
      if (debt.secured > 0) instruments.push({ label: 'Secured Debt', amount: toBillions(debt.secured) });
      if (debt.unsecured > 0) instruments.push({ label: 'Unsecured Debt', amount: toBillions(debt.unsecured) });
      if (instruments.length === 0) instruments.push({ label: 'Total Debt', amount: toBillions(debt.total) });
    } else if (e.is_guarantor) {
      instruments.push({ label: 'Guarantor', amount: '—' });
    }

    const entityType = e.entity_type?.toLowerCase() || 'subsidiary';

    return {
      name: e.name,
      jurisdiction: e.jurisdiction || '',
      label: labelMap[entityType] || 'Entity',
      totalDebt: debt.total > 0 ? toBillions(debt.total) : (e.is_guarantor ? 'Guarantor' : '—'),
      instruments,
      colors: colorSchemes[i] || colorSchemes[colorSchemes.length - 1],
    };
  });

  return {
    companyName: company.name || `${TICKER} Inc.`,
    ticker: TICKER,
    entityCount: company.entity_count || entities.length,
    instrumentCount: bonds.length,
    totalDebt: toBillions(company.total_debt || 0),
    entities: structureEntities,
  };
}

function transformMaturityWall(bonds, companyName, instrumentCount, totalDebt) {
  // Group bonds by maturity year
  const currentYear = new Date().getFullYear();
  const bucketCutoff = currentYear + 5; // years after this go into "20XX+" bucket
  const yearMap = {};

  for (const bond of bonds) {
    const amt = bond.outstanding || bond.principal || bond.amount_outstanding;
    if (!bond.maturity_date || !amt) continue;

    const year = new Date(bond.maturity_date).getFullYear();
    const bucketKey = year > bucketCutoff ? `${bucketCutoff + 1}+` : String(year);

    if (!yearMap[bucketKey]) {
      yearMap[bucketKey] = { year: bucketKey, secured: 0, unsecured: 0 };
    }

    const amountBillions = toBillionsNum(amt);
    const seniority = (bond.seniority || '').toLowerCase();
    const isSecured = seniority.includes('secured') && !seniority.includes('unsecured');

    if (isSecured) {
      yearMap[bucketKey].secured += amountBillions;
    } else {
      yearMap[bucketKey].unsecured += amountBillions;
    }
  }

  // Sort by year and compute totals
  const maturities = Object.values(yearMap)
    .sort((a, b) => {
      const aNum = parseInt(a.year);
      const bNum = parseInt(b.year);
      if (isNaN(aNum)) return 1;
      if (isNaN(bNum)) return -1;
      return aNum - bNum;
    })
    .map(m => ({
      year: m.year,
      amount: Math.round((m.secured + m.unsecured) * 10) / 10,
      secured: Math.round(m.secured * 10) / 10,
      unsecured: Math.round(m.unsecured * 10) / 10,
    }));

  return {
    companyName,
    ticker: TICKER,
    instrumentCount,
    totalDebt,
    maturities,
  };
}

function getYield(bond) {
  if (bond.pricing) return bond.pricing.ytm || bond.pricing.yield_to_worst || null;
  return null;
}

function getSpread(bond) {
  if (bond.pricing) return bond.pricing.spread || bond.pricing.oas || null;
  return null;
}

// Pretty-print seniority for display
function formatSeniority(seniority) {
  const map = {
    'senior_secured': 'Sr Secured',
    'senior_unsecured': 'Sr Unsecured',
    'subordinated': 'Subordinated',
    'second_lien': '2nd Lien',
  };
  return map[seniority] || seniority || 'Sr Unsecured';
}

function transformBondYields(bonds, structureEntities) {
  const colorMap = {
    'opco': { bg: 'emerald-50', border: 'emerald-200', text: 'emerald-600', structureLabel: 'OpCo' },
    'subsidiary': { bg: 'emerald-50', border: 'emerald-200', text: 'emerald-600', structureLabel: 'OpCo' },
    'finco': { bg: 'amber-50', border: 'amber-200', text: 'amber-600', structureLabel: 'FinCo' },
    'intermediate': { bg: 'amber-50', border: 'amber-200', text: 'amber-600', structureLabel: 'Intermediate' },
    'holdco': { bg: 'red-50', border: 'red-200', text: 'red-500', structureLabel: 'HoldCo' },
    'parent': { bg: 'red-50', border: 'red-200', text: 'red-500', structureLabel: 'HoldCo' },
  };

  // Prefer bonds with pricing; fall back to coupon_rate if no pricing available yet
  const hasPricing = bonds.some(b => getYield(b) !== null);

  // Filter to bonds that have some yield info (pricing or coupon)
  const usableBonds = bonds.filter(b => b.maturity_date && (getYield(b) !== null || (b.coupon_rate && b.coupon_rate > 0)));

  // Group by issuer type to get diversity
  const byEntityType = {};
  for (const bond of usableBonds) {
    const key = bond.issuer_type?.toLowerCase() || 'unknown';
    if (!byEntityType[key]) byEntityType[key] = [];
    byEntityType[key].push(bond);
  }

  // Pick 1-2 from each entity type
  const selected = [];
  const typeOrder = ['opco', 'subsidiary', 'finco', 'intermediate', 'holdco', 'parent'];

  for (const type of typeOrder) {
    const typeBonds = byEntityType[type] || [];
    // Sort by maturity date for variety
    typeBonds.sort((a, b) => new Date(a.maturity_date) - new Date(b.maturity_date));
    // Take up to 2 per type
    const take = type === 'finco' || type === 'intermediate' ? 2 : 1;
    for (const bond of typeBonds.slice(0, take)) {
      if (selected.length < 4) selected.push(bond);
    }
  }

  // Sort selected by yield/coupon ascending (lowest = most senior, displayed first)
  selected.sort((a, b) => {
    const aVal = getYield(a) ?? a.coupon_rate ?? 0;
    const bVal = getYield(b) ?? b.coupon_rate ?? 0;
    return aVal - bVal;
  });

  const bondYields = selected.map(bond => {
    const ytm = getYield(bond) ?? bond.coupon_rate ?? 0;
    const spread = getSpread(bond);
    const matYear = new Date(bond.maturity_date).getFullYear().toString().slice(-2);
    const seniority = formatSeniority(bond.seniority);
    const entityType = bond.issuer_type?.toLowerCase() || 'intermediate';
    const colors = colorMap[entityType] || colorMap['intermediate'];

    return {
      label: `${seniority} '${matYear}`,
      issuerName: bond.issuer_name || bond.entity_name || TICKER,
      ytm: `${ytm.toFixed(2)}%`,
      spread: spread !== null ? `+${Math.round(spread)} bps` : (bond.coupon_rate ? `${bond.coupon_rate.toFixed(2)}% coupon` : ''),
      colors,
    };
  });

  // Build mini structure for left panel
  const miniStructure = structureEntities.map(e => {
    // Find yield range for this entity's bonds
    const entityBonds = selected.filter(b => {
      const bType = b.issuer_type?.toLowerCase() || '';
      const eLabel = e.label.toLowerCase();
      if (eLabel === 'holdco') return bType === 'holdco' || bType === 'parent';
      if (eLabel === 'finco' || eLabel === 'intermediate') return bType === 'finco' || bType === 'intermediate';
      if (eLabel === 'opco') return bType === 'opco' || bType === 'subsidiary';
      return false;
    });

    const yields = entityBonds.map(b => getYield(b) ?? b.coupon_rate ?? 0).filter(y => y > 0);
    let yieldRange = '';
    if (yields.length === 1) {
      yieldRange = `${yields[0].toFixed(2)}%`;
    } else if (yields.length > 1) {
      const min = Math.min(...yields);
      const max = Math.max(...yields);
      yieldRange = min === max ? `${min.toFixed(2)}%` : `${min.toFixed(2)}-${max.toFixed(2)}%`;
    }

    return {
      label: e.label,
      name: e.name.length > 15 ? e.name.substring(0, 15) : e.name,
      yieldRange,
      colors: e.colors,
    };
  });

  return {
    ticker: TICKER,
    bondCount: bondYields.length,
    bonds: bondYields,
    miniStructure,
  };
}

async function main() {
  if (!DEMO_API_KEY) {
    console.warn('[fetch-demo-data] DEMO_API_KEY not set, skipping fetch. Using existing demo-data.json.');
    if (!existsSync(OUTPUT_PATH)) {
      console.warn('[fetch-demo-data] WARNING: No existing demo-data.json found. LiveDemo will use fallback data.');
    }
    process.exit(0);
  }

  console.log(`[fetch-demo-data] Fetching demo data for ${TICKER} from ${BACKEND_URL}...`);

  try {
    // Make all 3 API calls in parallel
    const [companyRes, traverseRes, bondsRes] = await Promise.all([
      fetchJSON(`${BACKEND_URL}/v1/companies?ticker=${TICKER}`),
      fetchJSON(`${BACKEND_URL}/v1/entities/traverse`, {
        method: 'POST',
        body: JSON.stringify({
          start: { type: 'company', id: TICKER },
          relationships: ['subsidiaries'],
          direction: 'outbound',
          depth: 10,
        }),
      }),
      fetchJSON(`${BACKEND_URL}/v1/bonds?ticker=${TICKER}&sort=maturity_date&limit=50`),
    ]);

    // Extract data from responses
    const company = companyRes.data?.[0] || companyRes.results?.[0] || companyRes;
    const entities = traverseRes.data?.traversal?.entities || traverseRes.entities || traverseRes.data || [];
    const bonds = bondsRes.data || bondsRes.results || bondsRes;

    if (!company) {
      throw new Error('No company data found for ' + TICKER);
    }
    if (!Array.isArray(bonds)) {
      throw new Error('Unexpected bonds response format');
    }

    console.log(`[fetch-demo-data] Got: ${entities.length} entities, ${bonds.length} bonds`);

    // Transform data
    const structure = transformStructure(company, entities, bonds);
    const maturityWall = transformMaturityWall(bonds, structure.companyName, structure.instrumentCount, structure.totalDebt);
    const yields = transformBondYields(bonds, structure.entities);

    const demoData = {
      _generated: new Date().toISOString(),
      _ticker: TICKER,
      structure,
      maturityWall,
      yields,
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(demoData, null, 2));
    console.log(`[fetch-demo-data] Wrote demo data to ${OUTPUT_PATH}`);
  } catch (err) {
    console.warn(`[fetch-demo-data] Failed to fetch data: ${err.message}`);
    console.warn('[fetch-demo-data] Build will continue with existing demo-data.json or fallback data.');
    if (!existsSync(OUTPUT_PATH)) {
      console.warn('[fetch-demo-data] WARNING: No existing demo-data.json found. LiveDemo will use fallback data.');
    }
    process.exit(0); // Don't fail the build
  }
}

main();
