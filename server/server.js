const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const cron = require("node-cron");
const quotesKo = require("./data/quotes_ko");
const quotesEn = require("./data/quotes_en");
const quotesZh = require("./data/quotes_zh");

const quotesMap = {
  ko: quotesKo,
  en: quotesEn,
  zh: quotesZh,
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-service-account.json")),
});

const db = admin.firestore();

const tokens = ["USER_FCM_TOKEN"];

let todayQuote = null;

// Run API
app.get("/", (req, res) => {
  res.send("DailyQuote server running 🚀");
});

// 언어 코드를 받아서 해당 파일 데이터를 리턴하는 헬퍼 함수
const getQuotesByLang = (lang) => {
  if (lang === "en") return quotesEn;
  return quotesKo; // 기본값은 한국어
};

// 데이터 삽입 (단건 & 대량 등록 지원)
app.post("/quote", async (req, res) => {
  try {
    // 1. req.body가 배열인지 단일 객체인지 확인하여 배열 형태로 통일
    const items = Array.isArray(req.body) ? req.body : [req.body];

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "저장할 데이터가 없습니다.",
      });
    }

    // 2. Firestore 배치(Batch) 생성 - 최대 500개까지 한 번에 처리 가능
    const batch = db.batch();
    const insertedIds = [];

    for (const item of items) {
      const { id, display_date, category, translations, like } = item;

      // 필수 데이터 유효성 검증
      if (!id || !display_date || !category || !translations) {
        return res.status(400).json({
          success: false,
          message: `필수 필드 누락 (ID: ${id || "unknown"})`,
        });
      }

      // Firestore 저장용 객체 조립
      const newQuote = {
        id: Number(id),
        display_date: String(display_date),
        category: Array.isArray(category) ? category : [category],
        like: Number(like || 0),
        translations: translations,
      };

      // 배치 작업에 문서 추가 (문서 키: quote_1, quote_2 ...)
      const docRef = db.collection("Quotes").doc(`quote_${id}`);
      batch.set(docRef, newQuote);
      insertedIds.push(`quote_${id}`);
    }

    // 3. 일괄 저장(Commit) 실행
    await batch.commit();

    // 4. 성공 응답 반환
    res.status(201).json({
      success: true,
      message: `성공적으로 ${insertedIds.length}개의 명언이 저장되었습니다.`,
      insertedIds: insertedIds,
    });
  } catch (error) {
    console.error("Firestore 데이터 삽입 중 에러 발생:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// GET /quote/today?today=2026-06-18 (lang 쿼리 파라미터 불필요)
app.get("/quote/today", async (req, res) => {
  try {
    const clientDate =
      req.query.today ||
      new Date()
        .toLocaleDateString("ko-KR", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(".", "");

    const snapshot = await db
      .collection("Quotes")
      .where("display_date", "==", clientDate)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(200).json(null);
    }

    const data = snapshot.docs[0].data();

    // 💡 lang 추출 로직을 제거하고 전체 translations 객체를 전달합니다.
    res.status(200).json({
      id: data.id,
      display_date: data.display_date,
      category: data.category,
      like: data.like,
      translations: data.translations, // { ko: {...}, en: {...}, "zh-HK": {...} } 전체 반환
    });
  } catch (error) {
    console.error("Fetch quote error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/quote/history", async (req, res) => {
  try {
    const clientDate =
      req.query.today ||
      new Date()
        .toLocaleDateString("ko-KR", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(".", "");

    // 💡 프론트엔드에서 전달한 limit 값 적용 (기본값 7)
    const limitCount = req.query.limit ? parseInt(req.query.limit, 10) : 7;

    const historySnapshot = await db
      .collection("Quotes")
      .where("display_date", "<", clientDate)
      .orderBy("display_date", "desc")
      .limit(limitCount)
      .get();

    // 🚀 translations 전체 객체를 그대로 포함해서 원본 Quote 형태로 전달
    const historyQuotes = historySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        display_date: data.display_date,
        created_at: data.created_at,
        category: data.category || [],
        like: data.like || 0,
        translations: data.translations || {}, // 프론트 i18n 대응을 위해 전체 객체 반환
      };
    });

    res.status(200).json(historyQuotes);
  } catch (error) {
    console.error("히스토리 조회 오류:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 💖 [좋아요 API] 유저가 보고 있는 언어의 데이터만 수정하는 방식
app.post("/quote/:id/like", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    // 🚀 body에서 action과 함께 유저의 현재 언어(lang)를 받아옵니다! (예: 'ko')
    const { action, lang } = req.body;

    // 1. 유저 언어에 맞는 명언 리스트가 존재하는지 확인
    const currentLanguageQuotes = quotesMap[lang || "ko"]; // 기본값 'ko' 세팅
    if (!currentLanguageQuotes) {
      return res
        .status(400)
        .json({ success: false, message: "지원하지 않는 언어입니다." });
    }

    // 2. 해당 언어의 배열에서만 명언 찾기
    const targetQuote = currentLanguageQuotes.find((q) => q.id === itemId);

    if (!targetQuote) {
      return res
        .status(404)
        .json({ success: false, message: "해당 명언을 찾을 수 없습니다." });
    }

    const incrementValue = action === "like" ? 1 : -1;
    console.log(incrementValue);
    // ⚠️ [핵심 체크] 파이어베이스 문서 이름 규격인 `quote_${id}`와 정확히 일치해야 합니다!
    const quoteRef = db.collection("Quotes").doc(`quote_${itemId}`);

    // 🔥 파이어베이스 실제 DB 데이터 증감 실행
    await quoteRef.update({
      like: admin.firestore.FieldValue.increment(incrementValue),
    });

    console.log(
      `[좋아요 반영] 언어: ${lang} | ID: ${itemId} | Action: ${action} | 현재 좋아요 수: ${targetQuote.like}`,
    );

    // 4. 성공 응답
    res.json({
      success: true,
      currentLike: targetQuote.like,
    });
  } catch (error) {
    console.error("좋아요 처리 중 서버 에러:", error);
    res
      .status(500)
      .json({ success: false, message: "서버 에러가 발생했습니다." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
