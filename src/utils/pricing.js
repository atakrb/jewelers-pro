// src/utils/pricing.js
// Fiyatlandırma yardımcıları (markup | profit | target)
// Dönen: { base, priceNet, priceGross, profitTL, profitPct, roundNote }

function num(n, def = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? v : def;
}
function clamp(n, min = 0) { return Math.max(min, n); }

// ---- Rounding helpers (BRÜT üzerinden) ----
function roundToStep(x, step = 1) {
    if (step <= 0) return x;
    return Math.round(x / step) * step;
}
// 25,xxx → 25.990; küçükse bir üst bine 990
function roundToEnding990(x) {
    const k = Math.floor(x / 1000);
    let cand = k * 1000 + 990;
    if (cand < x) cand = (k + 1) * 1000 + 990;
    return cand;
}
function applyRounding(gross, mode) {
    const m = (mode || "none").toLowerCase();
    switch (m) {
        case "to10":   return roundToStep(gross, 10);
        case "to100":  return roundToStep(gross, 100);
        case "to1000": return roundToStep(gross, 1000);
        case "end_990":return roundToEnding990(gross);
        default:       return gross; // none
    }
}
function roundingNote(mode) {
    const m = (mode || "none").toLowerCase();
    return m === "to10"   ? "10 TL adım"
        : m === "to100"  ? "100 TL adım"
            : m === "to1000" ? "1.000 TL adım"
                : m === "end_990"? "…990'a yuvarla"
                    : "Yok";
}

// ---- Ana hesap ----
export function priceCalc(p = {}) {
    const cost   = clamp(num(p.cost), 0);
    const extras = clamp(num(p.extras), 0);
    const base   = clamp(cost + extras, 0);           // NET taban

    const vatP   = clamp(num(p.vatPercent, 20), 0);
    const vatMul = 1 + vatP / 100;

    const mode = (p.pricingMode || "markup").toLowerCase();
    let targetNet;        // hedef NET
    let initialGross;     // yuvarlama öncesi BRÜT

    if (mode === "markup") {
        const mp = clamp(num(p.markupPercent), 0);
        targetNet = base * (1 + mp / 100);
    } else if (mode === "profit") {
        const pf = clamp(num(p.profitTL), 0);
        targetNet = base + pf;
    } else if (mode === "target") {
        const tGross = clamp(num(p.targetPrice), 0);  // hedef BRÜT
        initialGross = tGross;
        targetNet = tGross / vatMul;
    } else {
        targetNet = base;
    }

    if (!initialGross) initialGross = targetNet * vatMul;

    const roundedGross = applyRounding(initialGross, p.rounding);
    const priceGross   = clamp(roundedGross, 0);
    const priceNet     = vatMul > 0 ? priceGross / vatMul : priceGross;

    const profitTL     = clamp(priceNet - base, -base);
    const profitPct    = base > 0 ? (profitTL / base) * 100 : 0; // net kâr / net taban

    return {
        base,
        priceNet,
        priceGross,
        profitTL,
        profitPct,
        roundNote: roundingNote(p.rounding)
    };
}

export default { priceCalc };
