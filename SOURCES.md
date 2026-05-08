# Statistics on this site — sources & verification

Every empirical claim should be defensible to a working journalist. This is an audit of every statistic that appears on the site, with the best authoritative source we could find. Claims are marked:

- ✅ **Verified** — figure matches a primary source within a small margin.
- 🟡 **Plausible / directional** — order of magnitude defensible from primary sources, but the exact figure shown is illustrative or aggregated; revisit before public launch.
- 🔵 **Campaign metric** — internal counter (signatures, actions, etc.). Not a research statistic; replace with live data when the campaign is real.
- ⚠️ **Needs better source before public launch** — research did not surface direct support for the exact figure shown.

The **Hero**, **Stats band**, **Mini stats** and **Crisis grid** are powered by `content.json` and editable via `/#/admin`. Update the `num` / `format` / `label` fields when better data lands.

---

## Hero & headline claim

| Where | Claim | Status | Source |
| --- | --- | --- | --- |
| Hero h1 | "1 in 5 Australians can't afford the power bill" | 🟡 | Brotherhood of St Laurence: 18–23% of Australian households were in **energy stress** between 2006–2020 (energy spend > 6% of disposable income). This is the closest defensible "1 in 5" figure. The hero conflates "energy hardship" with "can't afford the power bill"; tighten the wording before launch. [BSL: Power pain — energy stress](https://www.bsl.org.au/research/publications/power-pain/) |
| Hero counter | 47,832 signed | 🔵 | Campaign metric. Replace with live count when integrated. |

## Stats band (homepage)

| # | Number | Label | Status | Source |
| --- | --- | --- | --- | --- |
| 1 | 1 in 20 | Australian households in energy hardship today | 🟡 | The AER's most recent figure shows **3.1% of residential customers** held energy debt at end-Jun-2025 — i.e. ~1 in 32. "1 in 20" is closer to the BSL "energy stress" definition. Pick one definition (debt vs. stress) and align the number to it. [AER: Debt and hardship persist](https://www.aer.gov.au/news/articles/news-releases/debt-and-hardship-persist-vulnerable-customers) |
| 2 | $1,367 | Average household energy debt | ✅ | **Exact match.** AER Annual Retail Markets Report 2024-25: average residential energy debt at end-Jun-2025 was $1,367 (up from $1,148 in 2024). [AER report announcement](https://www.aer.gov.au/news/articles/news-releases/debt-and-hardship-persist-vulnerable-customers) · [Full PDF](https://www.aer.gov.au/system/files/2025-12/Annual%20Retail%20Markets%20Report%202024%E2%80%9325%20-%2030%20November%202025.pdf) |
| 3 | 19% | Electricity price rise in three years | 🟡 | AEMC and AER show meaningful DMO increases over the 2022→2025 cycle (8–25% in single years for some regions). A compounded 19% over three years is defensible but specific to the assumed reference customer / region — cite the calculation method when published. [AEMC: Residential Electricity Price Trends 2025](https://www.aemc.gov.au/market-reviews-advice/residential-electricity-price-trends-2025) |
| 4 | 340k | Households in long-term energy debt | 🟡 | AER tracks energy-debt customer counts quarterly. 3.1% of residential customers in debt at end-Jun-2025 implies ~280–340k depending on which jurisdictions and customer base are included. Use the AER quarterly retail performance dataset to lock the exact number. [AER quarterly retail performance](https://www.aer.gov.au/industry/retail/performance-reporting) |

## Petition page mini stats

Same as the stats band above plus:

| Number | Label | Status | Source |
| --- | --- | --- | --- |
| 15% | Sacrificing food or housing | ⚠️ | Not directly sourced in our research. ACOSS reports that low-income households spend 6.4% of income on energy (vs. 1.5% for high-income), and that a quarter of Newstart recipients can't pay their electricity bill on time — but the specific "15% sacrifice food/housing" figure needs a primary source (likely ACOSS, Consumer Action Law Centre, or Energy Consumers Australia survey data) before publication. [ACOSS energy reports](https://www.acoss.org.au/wp-content/uploads/2018/10/Energy-Stressed-in-Australia.pdf) |

## "The Problem" — big number

| Number | Label | Status | Source |
| --- | --- | --- | --- |
| 19% | Electricity prices have risen nineteen per cent in just three years | 🟡 | Same as stats-band entry #3. The "another 24% projected by July 2026" sub-claim is **⚠️ unverified** in our research; AEMC's 10-year outlook does not flag a 24% increase to mid-2026. Source or remove. |

## "The Problem" — eight-figure crisis grid

| Number | Label | Status | Source |
| --- | --- | --- | --- |
| 1 in 5 | Households in hardship | 🟡 | BSL energy-stress figure; see hero h1 row. |
| $1,367 | Average household energy debt | ✅ | AER Annual Retail Markets Report 2024-25. |
| 340k | Households in long-term debt | 🟡 | Derived from AER quarterly retail performance. |
| 19% | Price rise in 3 years | 🟡 | AEMC/AER price trend reports. |
| 24% | Further rise by July 2026 | ⚠️ | Not surfaced in AEMC 2025 trends report. Source or remove before publication. |
| 15% | Families sacrificing food or housing | ⚠️ | Same as petition mini stat. Source or remove. |
| 200+ | NSW spot-price spikes >$10k/MWh in 2024 | 🟡 | AEMO did apply administered price caps in NSW in May 2024 due to cumulative-price thresholds; AER tracks 30-minute prices above $5,000/MWh. The exact count of >$10k events should come from AEMO/AER aggregated price data, not estimated. [AEMO: Administered price cap activated in NSW (May 2024)](https://aemo.com.au/en/newsroom/media-release/administered-price-cap-activated-in-nsw) · [AER: 30-minute prices above $5,000/MWh — Apr-Jun 2024](https://www.aer.gov.au/system/files/2024-07/AER%20-%20Electricity%20prices%20above%20$5,000MWh%20-%20April%20to%20June%202024.pdf) |
| $200+ | Average debt increase in 12 months | ✅ | AER: average residential energy debt grew from **$1,148 to $1,367** between Jun-2024 and Jun-2025 — a **+$219** increase. [AER announcement](https://www.aer.gov.au/news/articles/news-releases/debt-and-hardship-persist-vulnerable-customers) |

## "The Problem" — affected-tabs deep-dive

| Group | Stat | Status | Source |
| --- | --- | --- | --- |
| Households | "1 in 5 households in hardship" | 🟡 | BSL energy stress. |
| Small business | "78% of SMEs naming energy a top-3 cost" | ⚠️ | Not surfaced. Likely candidates for a real source: Council of Small Business Australia (COSBOA) surveys, Ai Group SME-specific data, or Energy Consumers Australia retail consumer sentiment surveys. |
| Heavy industry | "4,200 manufacturing jobs lost in 2025" | ⚠️ | Ai Group confirms manufacturing **entered recession in H2 2024** with output contracting 1.7% p.a., and confirms plant closures are accelerating — but the exact "4,200 jobs lost in 2025" figure is not in the surfaced reporting. ABS Labour Account quarterly data is the appropriate primary source. [Ai Group: Manufacturing left behind](https://www.aigroup.com.au/news/media-centre/2025/manufacturing-left-behind-in-industrial-recovery/) · [ABS Labour Account](https://www.abs.gov.au/statistics/labour/labour-accounts/labour-account-australia/latest-release) |
| Pensioners | "$200+ avg debt rise in a single year" | ✅ | AER: $1,148 → $1,367 = +$219 between Jun-2024 and Jun-2025. (Note: this is the all-residential average, not pensioner-specific. Either narrow the claim or cite a pensioner-specific dataset from COTA / National Seniors Australia.) |

## Bill calculator benchmarks (homepage)

| State | Benchmark $/yr in code | Status | Source |
| --- | --- | --- | --- |
| NSW / SA / SE QLD | 1,640 / 1,780 / 1,480 | 🟡 | The 2025-26 AER **Default Market Offer reference price** for NSW/SA/SE-QLD on general usage is $2,301/yr. The campaign uses a "2015 inflation-adjusted" benchmark instead, which is a fair concept but should publish its methodology. [AER DMO 2025-26 final determination](https://www.aer.gov.au/system/files/2025-05/AER%20-%20Final%20determination%20-%20Default%20market%20offer%20prices%202025%E2%80%9326%20-%2026%20May%202025_0.pdf) |
| VIC | 1,520 | 🟡 | The Victorian Default Offer (VDO) is currently $1,546/yr — almost an exact match to the campaign benchmark. Either re-source as "current VDO" rather than "2015 inflation-adjusted" or update the methodology note. [AEMC residential price trends](https://www.aemc.gov.au/market-reviews-advice/residential-electricity-price-trends-2025) |
| Other states | various | 🟡 | No single national reference price exists. Each state's benchmark needs its own primary source. |

## About / governance

| Claim | Status | Source |
| --- | --- | --- |
| "80% of Australians who feel the country lacks a well-planned approach to managing the energy transition" | ⚠️ | Not directly supported by Lowy 2025 poll (which shows 51% say warming is a serious problem, with declining urgency from 2024) or Ipsos 2025 climate report (which notes increasing concerns about cost-of-living/reliability impacts of the transition, but no 80% planning-quality figure). Source the exact wording or rephrase. [Lowy 2025: Climate change and energy](https://poll.lowyinstitute.org/report/2025/climate-change-and-energy/) · [Ipsos Climate Change Report](https://www.ipsos.com/en-au/climate-change-report) |
| "ABN 93 676 364 855" | 🔵 | Placeholder ABN. Replace with the real registered ABN before launch. |

## Donate page — campaign metrics

| Number | Label | Status |
| --- | --- | --- |
| 47,832 | Signatures collected | 🔵 Campaign metric. |
| 12,400 | Letters sent to MPs | 🔵 Campaign metric. |
| 151 | Electorates with active supporters | 🔵 Campaign metric. (151 happens to be the actual number of seats in the Australian House of Representatives — fine for narrative, but until you have a supporter in each it's aspirational.) |

## Take Action page — live activity

All three numbers (4,128 actions today / 312 letters per hour / 87 events) are 🔵 campaign metrics. Wire to live counters when the campaign is live; otherwise label as "illustrative" if launched as static.

---

## Recommended next steps

1. **Lock the headline number.** Decide whether the campaign's lead claim is "1 in 5 households in energy stress" (BSL definition) or "1 in 32 in energy debt" (AER definition). They are not the same metric and conflating them is the easiest way to get fact-checked.
2. **Pull the AER quarterly retail performance dataset** to nail down the exact long-term-debt customer count instead of the rounded 340k figure.
3. **Replace ⚠️ items** before any media outreach. The 24%-by-July-2026 projection, the 15% food/housing-sacrifice claim, the 78% SME claim, the 4,200 jobs claim, and the 80% energy-planning sentiment claim all need primary sources or rewording.
4. **Publish a methodology note** linked from the calculator and the crisis grid that explains the benchmarks, sources, and dates of each figure. This is the cheap defence that pre-empts almost every "where does this number come from" question.

## Primary sources used in this audit

- [AER: Annual retail markets report 2024-25](https://www.aer.gov.au/publications/reports/performance/annual-retail-markets-report-2024-25)
- [AER: Debt and hardship persist for vulnerable customers (Nov 2025 release)](https://www.aer.gov.au/news/articles/news-releases/debt-and-hardship-persist-vulnerable-customers)
- [AER: Default market offer prices 2025-26 — final determination](https://www.aer.gov.au/system/files/2025-05/AER%20-%20Final%20determination%20-%20Default%20market%20offer%20prices%202025%E2%80%9326%20-%2026%20May%202025_0.pdf)
- [AER: Wholesale electricity market performance report 2024](https://www.aer.gov.au/system/files/2024-12/Wholesale%20electrcity%20market%20performance%20report%20-%20December%202024.pdf)
- [AER: 30-minute electricity prices above $5,000/MWh — Apr-Jun 2024](https://www.aer.gov.au/system/files/2024-07/AER%20-%20Electricity%20prices%20above%20$5,000MWh%20-%20April%20to%20June%202024.pdf)
- [AEMC: Residential Electricity Price Trends 2025](https://www.aemc.gov.au/market-reviews-advice/residential-electricity-price-trends-2025)
- [AEMO: Administered price cap activated in NSW, May 2024](https://aemo.com.au/en/newsroom/media-release/administered-price-cap-activated-in-nsw)
- [Brotherhood of St Laurence: Power pain — energy stress in Australia](https://www.bsl.org.au/research/publications/power-pain/)
- [BSL: Energy stressed in Australia](https://www.bsl.org.au/research/publications/energy-stressed-in-australia/)
- [ACOSS: Energy Stressed in Australia (Oct 2018)](https://www.acoss.org.au/wp-content/uploads/2018/10/Energy-Stressed-in-Australia.pdf)
- [ACOSS: Overhaul of energy concessions needed](https://www.acoss.org.au/media_release/overhaul-of-energy-concessions-needed-as-three-million-households-struggle-to-pay-their-energy-bills/)
- [Ai Group: Manufacturing left behind in industrial recovery (2025)](https://www.aigroup.com.au/news/media-centre/2025/manufacturing-left-behind-in-industrial-recovery/)
- [Ai Group: Australian Industry Outlook 2025](https://www.aigroup.com.au/resourcecentre/research-economics/australian-industry-outlook-2025/)
- [ABS: Labour Account Australia — latest release](https://www.abs.gov.au/statistics/labour/labour-accounts/labour-account-australia/latest-release)
- [Lowy Institute Poll 2025: Climate change and energy](https://poll.lowyinstitute.org/report/2025/climate-change-and-energy/)
- [Ipsos: Climate Change Report (Australia)](https://www.ipsos.com/en-au/climate-change-report)
- [Energy Consumers Australia](https://energyconsumersaustralia.com.au/)
