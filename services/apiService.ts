const BRAPI_URL = "https://brapi.dev/api/quote/";
const TOKEN = "rkLzPneidi9avr7mkdQz1L";

export async function getStockPriceBRL(ticker: string): Promise<number> {
  try {
    const response = await fetch(`${BRAPI_URL}${ticker}?token=${TOKEN}`);
    const data = await response.json();

    return data.results[0].regularMarketPrice;
  } catch (error) {
    console.error("Erro ao buscar cotação na API:", error);
    return 0;
  }
}