interface PricefeedParams {
  invertedPrice: boolean;
  // TODO: This is a really simple mapping of identifier to URL to query to get latest price for an identifier.
  // Future work should blend off-chain prices from different sources similar to how we do it in
  // `protocol/financial-templates-lib/price-feed/MedianizerPriceFeed.js`
  source: string[];
}

interface PricefeedParamsMap {
  [identifier: string]: PricefeedParams;
}

// These functions format JSON data from an exchange API into a number, which is useful
// because each API returns differently shaped data.
function _getCoinbasePriceFromJSON(jsonData: any) {
  return Number(jsonData[0].price);
}

function _getBinancePriceFromJSON(jsonData: any) {
  return Number(jsonData.price);
}

function _getKrakenPriceFromJSON(jsonData: any) {
  // Kraken sends all data within a special ticker name key, for example the ETHUSD data is within a XETHZUSD key.
  // const tickerName = Object.keys(jsonData.result)[0];

  return Number(1);
}

function _getBitstampPriceFromJSON(jsonData: any) {
  return Number(jsonData.last);
}

// This is needed because our new cors proxy wont forward http or https. We really only use https.
function stripProtocol(url: string) {
  return url.replace("https://", "");
}

// Small helper to wrap a url in cors proxy.
export function proxyUrl(
  url: string,
  // This env can be set with a .env file. It has to be prefixed with NEXT_PUBLIC_ to be available in browser
  // This has a default set for now until we can get prod env var in.
  proxy = process.env.NEXT_PUBLIC_CORS_PROXY_URL ||
    "https://us-central1-uma-protocol.cloudfunctions.net/cors-proxy"
) {
  return [proxy, stripProtocol(url)].join("/");
}

// This function returns a type predicate that we can use to filter prices from a (number | null)[] into a number[],
// source: https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isValidPrice<Price>(value: Price | null): value is Price {
  return value !== null;
}

export const PRICEFEED_PARAMS: PricefeedParamsMap = {
  compusd: {
    invertedPrice: false,
    source: ["https://api.pro.coinbase.com/products/COMP-USD/trades?limit=1"],
  },
  ethbtc: {
    invertedPrice: false,
    source: [
      "https://api.pro.coinbase.com/products/ETH-BTC/trades?limit=1",
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHBTC",
    ],
  },
  usdeth: {
    invertedPrice: true,
    source: [
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHUSDT",
      "https://api.pro.coinbase.com/products/ETH-USD/trades?limit=1",
    ],
  },
  usdbtc: {
    invertedPrice: true,
    source: [
      proxyUrl("https://www.bitstamp.net/api/v2/ticker/btcusd"),
      "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT",
      "https://api.pro.coinbase.com/products/BTC-USD/trades?limit=1",
    ],
  },
  bchnbtc: {
    invertedPrice: false,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=BCHBTC"],
  },
  xauperl: {
    invertedPrice: true,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=PERLUSDT"],
  },
  usdperl: {
    invertedPrice: true,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=PERLUSDT"],
  },
  usdopen: {
    invertedPrice: true,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=OCEANUSDT"],
  },
  stablespread: {
    invertedPrice: false,
    source: ["https://api.kraken.com/0/public/Ticker?pair=ETHUSD"],
  },
  btcdom: {
    invertedPrice: false,
    source: ["https://api.kraken.com/0/public/Ticker?pair=ETHUSD"],
  },
  calloptions: {
    invertedPrice: false,
    source: ["https://api.kraken.com/0/public/Ticker?pair=ETHUSD"],
  },
  yuma: {
    invertedPrice: true,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=UMAUSDT"],
  },
  opendao: {
    invertedPrice: true,
    source: [
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHUSDT",
      "https://api.pro.coinbase.com/products/ETH-USD/trades?limit=1",
    ],
  },
  apeuni: {
    invertedPrice: true,
    source: ["https://api.binance.com/api/v3/avgPrice?symbol=UNIUSDT"],
  },
};

export function getPricefeedParamsFromTokenSymbol(symbol: string | null) {
  // This returns whichever "case" expression matches the conditional in `switch`.
  // In this case, whichever "case" expression evaluates to "true".
  // Source: https://stackoverflow.com/questions/4082204/javascript-conditional-switch-statement
  switch (true) {
    case symbol?.includes("yCOMP"):
      return PRICEFEED_PARAMS.compusd;
    case symbol?.includes("ETHBTC"):
      return PRICEFEED_PARAMS.ethbtc;
    case symbol?.includes("uUSDrBTC"):
      return PRICEFEED_PARAMS.usdbtc;
    case symbol?.includes("uUSDrETH"):
      return PRICEFEED_PARAMS.usdeth;
    case symbol?.includes("uUSDwETH"):
      return PRICEFEED_PARAMS.usdeth;
    case symbol?.includes("yUSD"):
      return PRICEFEED_PARAMS.usdeth;
    case symbol?.includes("YD-BTC"):
      return PRICEFEED_PARAMS.usdbtc;
    case symbol?.includes("YD-ETH"):
      return PRICEFEED_PARAMS.usdeth;
    case symbol?.includes("Mario"):
      return PRICEFEED_PARAMS.bchnbtc;
    case symbol?.includes("pxGOLD"):
      return PRICEFEED_PARAMS.xauperl;
    case symbol?.includes("pxUSD"):
      return PRICEFEED_PARAMS.usdperl;
    case symbol?.includes("OCEAN"):
      return PRICEFEED_PARAMS.usdopen;
    case symbol?.includes("USDT"):
      return PRICEFEED_PARAMS.stablespread;
    case symbol?.includes("BTCDOM"):
      return PRICEFEED_PARAMS.btcdom;
    case symbol?.includes("UMAx"):
      return PRICEFEED_PARAMS.calloptions;
    case symbol?.includes("yUMA"):
      return PRICEFEED_PARAMS.yuma;
    case symbol?.includes("O-ETH"):
      return PRICEFEED_PARAMS.opendao;
    case symbol?.includes("NEW-PERP-TEST"):
      return PRICEFEED_PARAMS.ethbtc;
    default:
      return null;
  }
}

// Wrapper around `getPricefeedParamsFromTokenSymbol.invertedPrice` so that it never returns null
export function isPricefeedInvertedFromTokenSymbol(symbol: string | null) {
  const pricefeedParams = getPricefeedParamsFromTokenSymbol(symbol);
  if (pricefeedParams === null) {
    return false;
  } else {
    return pricefeedParams.invertedPrice;
  }
}

export const getOffchainPriceFromTokenSymbol = async (symbol: string) => {
  let identifierParams = getPricefeedParamsFromTokenSymbol(symbol);
  if (identifierParams === null) {
    console.error(
      `Missing identifier parameters for token with symbol ${symbol}`
    );
    return null;
  } else {
    const prices: (number | null)[] = await Promise.all(
      identifierParams.source.map(async (url: string) => {
        try {
          const response = await fetch(url);
          const json = await response.json();

          switch (true) {
            case url.includes("coinbase"):
              return _getCoinbasePriceFromJSON(json);
            case url.includes("binance"):
              return _getBinancePriceFromJSON(json);
            case url.includes("kraken"):
              return _getKrakenPriceFromJSON(json);
            case url.includes("bitstamp"):
              return _getBitstampPriceFromJSON(json);
            default:
              return null;
          }
        } catch (err) {
          console.error(
            `Failed to get price for for token with symbol ${symbol}, url=${url}`,
            err
          );
          return null;
        }
      })
    );

    const validPrices = prices.filter(isValidPrice);
    if (validPrices.length > 0) {
      // Sort in ascending order (lowest first), and return the median index.
      const mid = Math.floor(validPrices.length / 2);
      validPrices.sort((a: number, b: number) => a - b);
      let medianPrice;
      if (validPrices.length % 2 === 0) {
        medianPrice = (validPrices[mid - 1] + validPrices[mid]) / 2;
      } else {
        medianPrice = validPrices[mid];
      }

      // Return inverted price if appropriate
      if (identifierParams.invertedPrice) {
        return 1 / medianPrice;
      } else {
        return medianPrice;
      }
    } else {
      return null;
    }
  }
};
