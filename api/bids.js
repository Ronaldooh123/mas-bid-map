export default async function handler(req, res) {
  try {
    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY;

    if (!serviceKey) {
      return res.status(500).json({
        error: "PUBLIC_DATA_SERVICE_KEY 환경변수가 설정되지 않았습니다."
      });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const formatApiDateTime = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      return `${yyyy}${mm}${dd}${hh}${mi}`;
    };

    const apiUrl = new URL(
      "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoCnstwk"
    );

    apiUrl.searchParams.set("serviceKey", serviceKey);
    apiUrl.searchParams.set("pageNo", "1");
    apiUrl.searchParams.set("numOfRows", "999");
    apiUrl.searchParams.set("type", "json");
    apiUrl.searchParams.set("inqryDiv", "1");
    apiUrl.searchParams.set("inqryBgnDt", formatApiDateTime(yesterday));
    apiUrl.searchParams.set("inqryEndDt", formatApiDateTime(now));

    const response = await fetch(apiUrl.toString());
    const text = await response.text();

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const json = JSON.parse(text);
      return res.status(response.status).json(json);
    } catch {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
