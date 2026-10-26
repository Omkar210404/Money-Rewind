// Every dataset, formula, caveat and credit, in plain language. Coverage
// tables are generated from data.json so they can't drift from the site.

function coverage(data, c, itemId) {
  const obs = c.prices[itemId]
  if (!obs) return { text: 'no data', sources: [] }
  const ys = Object.keys(obs).map(Number).sort((a, b) => a - b)
  const kinds = [...new Set(ys.map((y) => obs[y].k))]
  const sources = [...new Set(ys.map((y) => obs[y].s))]
  const span = ys.length === 1 ? `${ys[0]}` : `${ys.length} years, ${ys[0]}–${ys[ys.length - 1]}`
  return { text: `${kinds.join(', ')} · ${span}`, sources }
}

function yearSpan(data, arr) {
  const ys = arr.map((v, i) => (v == null ? null : data.years[0] + i)).filter((v) => v != null)
  return ys.length ? `${ys[0]}–${ys[ys.length - 1]}` : 'none'
}

export default function Methods({ data }) {
  return (
    <article className="methods">
      <header>
        <p className="eyebrow">Methods & sources</p>
        <h1>How the numbers are made</h1>
        <p className="lede">
          Nothing on this site is invented. Each figure is either a published number, a conversion of one, or an
          estimate that is labelled as an estimate. When there is nothing honest to show, the site says “no data”.
        </p>
      </header>

      <section>
        <h2>The questions</h2>
        <p>
          The pedestal answers <b>“how many of each item does this amount buy in a given year?”</b>:
          count = amount ÷ price of one unit in that year.
        </p>
        <p>
          The second layer answers <b>“did income keep up?”</b>: a month of average income = GDP per capita ÷ 12,
          and “months of income to buy” = item price ÷ a month of income.
        </p>
      </section>

      <section>
        <h2>Where item prices come from</h2>
        <ul className="defs">
          <li><b>Measured</b>: an official average price for that exact year (US Bureau of Labor Statistics, UK Office for National Statistics, World Bank petrol prices). Annual values are the average of the monthly figures.</li>
          <li><b>Published figure</b>: a single number from a named report (for example Japan’s Retail Price Survey or India’s average cinema ticket from Ormax Media). Used as an anchor.</li>
          <li><b>World gold price × exchange rate</b>: gold’s annual average in US dollars per troy ounce (World Bank Pink Sheet) ÷ 31.1035 grams, times that year’s official exchange rate.</li>
          <li><b>Estimated from CPI</b>: for a year without a measured price, the price from the nearest measured year is scaled by the change in the country’s consumer price index:
            <code>price(year) = price(anchor) × CPI(year) ÷ CPI(anchor)</code>.
            This assumes the item’s price moved with overall inflation, which is often not true for a single item over decades.</li>
        </ul>
        <p>Unit conversions: 1 US gallon = 3.785 L, 1 UK pint = 0.568 L, 1 lb = 453.6 g. US bread is per pound and Japan’s per kilogram; both are scaled to an 800 g loaf.</p>
      </section>

      <section>
        <h2>Coverage by country</h2>
        <div className="table-scroll">
          <table className="coverage">
            <thead>
              <tr>
                <th>Country</th>
                <th>CPI</th>
                <th>Income</th>
                {data.items.map((it) => <th key={it.id}>{it.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.countries.map((c) => (
                <tr key={c.iso3}>
                  <td><b>{c.name}</b></td>
                  <td>{yearSpan(data, c.cpi)}</td>
                  <td>{yearSpan(data, c.gdppc)}</td>
                  {data.items.map((it) => {
                    const cov = coverage(data, c, it.id)
                    return (
                      <td key={it.id} className={cov.sources.length ? '' : 'nodata'} title={cov.sources.map((s) => data.sources[s]?.name).join(' | ')}>
                        {cov.text}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine">Years outside each measured range use the CPI estimate above. Years with no CPI show “no data”.</p>
      </section>

      <section>
        <h2>Caveats</h2>
        <ul className="defs">
          <li><b>Income is a proxy.</b> GDP per capita is total output divided by population. It is not wages, it ignores how income is shared, and it includes things households never receive. Read it as “the average person’s share of the economy”.</li>
          <li><b>National averages hide a lot.</b> Prices differ between cities and shops; Japan’s bread and milk are Tokyo prices; India’s milk figure is a single day’s all-India average.</li>
          <li><b>Products change.</b> A 1970 loaf, car fuel or cinema seat is not the same product as today’s.</li>
          <li><b>Currency changes.</b> Brazil adopted the real in 1994; the World Bank expresses earlier years in today’s reais, so pre-1994 amounts are not money anyone held.</li>
          <li><b>Petrol after 2016.</b> The World Bank stopped publishing pump prices in 2016, so later years outside the US are CPI estimates.</li>
          <li><b>Gold</b> is priced at the world market rate; local retail prices include taxes and making charges.</li>
          <li><b>Latest year.</b> The newest annual figures can be missing or revised; the US CPI series currently ends one year earlier than other countries.</li>
        </ul>
      </section>

      <section>
        <h2>Sources & licences</h2>
        <ul className="sources">
          {Object.entries(data.sources).map(([id, s]) => (
            <li key={id}>
              {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}
              <span className="lic">{s.licence}{s.updated ? ` · updated ${s.updated}` : ''}</span>
            </li>
          ))}
        </ul>
        <p className="fine">
          World Bank data is used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Creative Commons Attribution 4.0</a> licence.
          ONS data under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noreferrer">Open Government Licence v3.0</a>.
          BLS data is in the public domain. Data built {data.generated}.
        </p>
      </section>
    </article>
  )
}
