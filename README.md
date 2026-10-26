# Time Machine for Money

A small museum exhibit in the browser. Pick an amount and a country, drag the gold timeline, and a pile of everyday things (bread, milk, petrol, a cinema ticket, a gram of gold) grows or dissolves on a stone pedestal to show what that money bought in each year since 1960. A faded second pedestal holds a comparison year, and a second layer asks whether average income kept up.

React (Vite, plain JSX) · Framer Motion · Canvas 2D particles · d3-scale · one Python data script · works offline.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

Refresh the data (Python 3.11, standard library only, no API keys):

```bash
python scripts/build_data.py   # writes public/data.json
```

## Where the numbers come from

| Data | Source | Licence |
|---|---|---|
| Consumer price index, exchange rate, GDP per capita (local currency) | [World Bank WDI](https://data.worldbank.org/) | CC BY 4.0 |
| Petrol pump price, US$/litre (1991–2016) | World Bank WDI Database Archives | CC BY 4.0 |
| Gold, US$/troy oz (1960–2025) | [World Bank Pink Sheet](https://www.worldbank.org/en/research/commodity-markets) | CC BY 4.0 |
| US bread, milk, petrol average prices | [US BLS](https://www.bls.gov/cpi/factsheets/average-prices.htm) | Public domain |
| UK bread (800 g loaf) and milk (pint) average prices | [UK ONS](https://www.ons.gov.uk/) series CZOH, CZNT | OGL v3.0 |
| Single reference prices (Japan bread/milk, cinema tickets, India milk) | Cited in `scripts/build_data.py` and on the Methods page | Cited figures |

Each price on screen is labelled as **measured**, a **published figure**, **world gold price × exchange rate**, or **estimated from CPI** (the nearest measured price scaled by the change in the consumer price index). Missing years say "no data". The Methods page in the app lists every formula, caveat and source.

## Optional item photos

Drop transparent PNGs named `bread.png`, `milk.png`, `fuel.png`, `ticket.png`, `coin.png`, `note.png` into `public/items/` and the app uses them. Without them it draws its own SVG objects.

## Limitations

- "Average income" is GDP per capita, a proxy for output per person. It is not wages or take-home pay.
- No open, verifiable unit price was found for bread in India or Brazil, or milk in Brazil, so those show "no data".
- Many years are CPI estimates anchored to one published price, which assumes the item moved with overall inflation.
- Japan's bread and milk are Tokyo prices; India's milk is a single day's all-India average.
- Brazil before 1994 is shown in converted reais, which nobody held at the time; the site flags this.
- The World Bank stopped publishing petrol prices after 2016, and the US CPI series currently ends at 2024.
- Not built yet: Hours-of-work view, Compare countries, live exchange-rate ticker, share image, custom price overrides.

## Licence

Code: MIT. Data belongs to its publishers under the licences above; World Bank data is credited under CC BY 4.0.
