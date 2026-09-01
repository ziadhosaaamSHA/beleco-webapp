const { onRequest, onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ---- Secrets ----
const WHATSAPP_TOKEN = defineSecret("WHATSAPP_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = defineSecret("WHATSAPP_PHONE_NUMBER_ID");
const WHATSAPP_VERIFY_TOKEN = defineSecret("WHATSAPP_VERIFY_TOKEN");
const MAZEN_WHATSAPP_NUMBER = defineSecret("MAZEN_WHATSAPP_NUMBER");
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const APIFY_TOKEN_SECRET = defineSecret("APIFY_TOKEN");

// APIFY_TOKEN is now stored as a Firebase secret (see APIFY_TOKEN_SECRET above),
// not hardcoded here.

const GRAPH_VERSION = "v21.0";
const PAYMENT_NUMBER = "+201063552697";
const DEPOSIT_RATIO = 0.5;

function formatEgyptPhone(raw) {
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "20" + digits.slice(1);
  return digits;
}

async function sendWhatsAppText({ to, body, phoneNumberId, token }) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    logger.error("WhatsApp send failed", data);
    throw new Error(`WhatsApp send failed: ${JSON.stringify(data)}`);
  }
  return data.messages?.[0]?.id || null;
}

async function uploadWhatsAppMedia({ imageBase64, mediaType, phoneNumberId, token }) {
  const buffer = Buffer.from(imageBase64, "base64");
  const blob = new Blob([buffer], { type: mediaType });

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", blob, "proof.jpg");

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/media`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    logger.error("WhatsApp media upload failed", data);
    throw new Error(`WhatsApp media upload failed: ${JSON.stringify(data)}`);
  }
  return data.id;
}

async function sendWhatsAppImage({ to, mediaId, caption, phoneNumberId, token }) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: { id: mediaId, caption: caption || "" },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    logger.error("WhatsApp image send failed", data);
    throw new Error(`WhatsApp image send failed: ${JSON.stringify(data)}`);
  }
  return data.messages?.[0]?.id || null;
}

async function suggestShortNameWithClaude(longTitle, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 60,
      system:
        "انت بتحوّل عناوين منتجات طويلة (SEO titles) من مواقع زي شي إن، لاسم قصير وطبيعي بالعربي يتحط في متجر أونلاين. " +
        "اسم قصير جدًا (3-6 كلمات)، بيوصف المنتج بس (النوع + اللون أو الميزة الأهم لو مهمة)، من غير أي كلام تسويقي زيادة. " +
        "رد بالاسم المختصر بس، من غير علامات تنصيص ومن غير أي شرح.",
      messages: [{ role: "user", content: longTitle }],
    }),
  });

  const data = await response.json();
  if (data.error) {
    logger.error("Claude short-name API error", data.error);
    return null;
  }
  const text = data.content && data.content[0] ? data.content[0].text : null;
  return text ? text.trim() : null;
}

async function analyzeProofWithClaude({ imageBase64, mediaType, expectedAmount, expectedRecipient, apiKey }) {
  const systemPrompt =
    `انت بتحلل لقطة شاشة لإثبات تحويل فلوس (InstaPay أو فودافون كاش) في مصر. ` +
    `ده تحويل عربون (مش السعر الكامل)، والمفروض المبلغ يكون ${expectedAmount} تقريبًا (فرق بسيط لغاية 1 مقبول)، ` +
    `والمستلم رقمه أو اسمه فيه إشارة للرقم ${expectedRecipient}. ` +
    `افحص الصورة واستنتج: هل العملية نجحت فعلاً؟ هل المبلغ مطابق للعربون؟ هل المستلم مطابق؟ ` +
    `رد بصيغة JSON فقط من غير أي كلام تاني ومن غير markdown code fences، بالشكل ده بالظبط:\n` +
    `{"transactionSuccessful": true/false, "amountFound": number or null, "amountMatch": true/false, ` +
    `"recipientMatch": true/false, "confidence": "high"/"medium"/"low", "notes": "شرح مختصر بالعربي"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            { type: "text", text: "حلل الصورة دي." },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  if (data.error) {
    logger.error("Claude Vision API error", data.error);
    throw new Error(data.error.message);
  }

  const rawText = data.content && data.content[0] ? data.content[0].text : "{}";
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    logger.error("Failed to parse Claude Vision response", { rawText });
    return {
      transactionSuccessful: false,
      amountFound: null,
      amountMatch: false,
      recipientMatch: false,
      confidence: "low",
      notes: "مقدرش يقرأ الصورة صح",
    };
  }
}

exports.submitCartLink = onRequest(
  {
    secrets: [WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, MAZEN_WHATSAPP_NUMBER],
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { cartLink, customerPhone, customerName, customerUid } = req.body || {};

    if (!cartLink || typeof cartLink !== "string" || !cartLink.includes("shein")) {
      return res.status(400).json({ error: "cartLink مطلوب ولازم يكون لينك شي إن صحيح" });
    }
    if (!customerPhone) {
      return res.status(400).json({ error: "customerPhone مطلوب" });
    }
    const nameWords = (customerName || "").trim().split(/\s+/).filter(Boolean);
    if (nameWords.length < 2) {
      return res.status(400).json({ error: "الرجاء إدخال الاسم كامل (اسم ولقب)" });
    }

    try {
      const orderRef = await db.collection("orders").add({
        cartLink,
        customerPhone,
        customerName: customerName || null,
        customerUid: customerUid || null,
        status: "awaiting_calculation",
        totalPrice: null,
        depositAmount: null,
        remainingAmount: null,
        mazenMessageId: null,
        paymentMethod: null,
        mazenPaymentMessageId: null,
        paymentAnalysis: null,
        address: null,
        estimatedDeliveryMinDays: null,
        estimatedDeliveryMaxDays: null,
        mazenOrderConfirmMessageId: null,
        orderedAt: null,
        trackingStage: null,
        customerEgyptMessageId: null,
        mazenAddressChangeMessageId: null,
        addressChangeRequestText: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const shortId = orderRef.id.slice(-6).toUpperCase();
      const messageBody =
        `🛒 طلب جديد #${shortId}\n\n` +
        (customerName ? `الاسم: ${customerName}\n` : "") +
        `اللينك: ${cartLink}\n\n` +
        `رد على الرسالة دي بالتوتال الأصلي بالدولار (رقم بس، مثال: 45.5)`;

      const wamid = await sendWhatsAppText({
        to: MAZEN_WHATSAPP_NUMBER.value(),
        body: messageBody,
        phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
        token: WHATSAPP_TOKEN.value(),
      });

      await orderRef.update({ mazenMessageId: wamid });

      return res.status(200).json({ orderId: orderRef.id, shortId });
    } catch (err) {
      logger.error("submitCartLink error", err);
      return res.status(500).json({ error: "حصل خطأ، جرّبي تاني" });
    }
  }
);

exports.analyzePaymentProof = onRequest(
  {
    secrets: [WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, MAZEN_WHATSAPP_NUMBER, ANTHROPIC_API_KEY],
    cors: true,
    timeoutSeconds: 60,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { orderId, paymentMethod, imageBase64, mediaType } = req.body || {};

    if (!orderId || !paymentMethod || !imageBase64) {
      return res.status(400).json({ error: "orderId و paymentMethod و imageBase64 مطلوبين" });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        return res.status(404).json({ error: "الطلب مش موجود" });
      }
      const order = orderSnap.data();

      if (order.depositAmount == null) {
        return res.status(400).json({ error: "الطلب لسه ماعندوش سعر/عربون محسوب" });
      }

      const analysis = await analyzeProofWithClaude({
        imageBase64,
        mediaType: mediaType || "image/jpeg",
        expectedAmount: order.depositAmount,
        expectedRecipient: PAYMENT_NUMBER,
        apiKey: ANTHROPIC_API_KEY.value(),
      });

      const shortId = orderId.slice(-6).toUpperCase();
      const looksGood =
        analysis.transactionSuccessful === true &&
        analysis.amountMatch === true &&
        analysis.recipientMatch === true;

      let newStatus, messageBody;

      if (looksGood) {
        newStatus = "payment_pending_review";
        messageBody =
          `✅ إثبات دفع العربون لطلب #${shortId} — الـ AI شايف إنه سليم\n\n` +
          `وسيلة الدفع: ${paymentMethod}\n` +
          `إجمالي الطلب: ${order.totalPrice}\n` +
          `العربون المطلوب (50%): ${order.depositAmount}\n` +
          `المتبقي عند التسليم: ${order.remainingAmount}\n` +
          `المبلغ في الصورة: ${analysis.amountFound}\n` +
          `الثقة: ${analysis.confidence}\n` +
          `ملاحظات: ${analysis.notes}\n\n` +
          `لو موافق، رد على الرسالة دي بـ "Payment Done" عشان نأكد للعميل.`;
      } else {
        newStatus = "payment_flagged";
        messageBody =
          `⚠️ إثبات دفع عربون طلب #${shortId} — فيه حاجة مش متطابقة\n\n` +
          `وسيلة الدفع: ${paymentMethod}\n` +
          `العربون المطلوب (50%): ${order.depositAmount}\n` +
          `المبلغ في الصورة: ${analysis.amountFound}\n` +
          `مطابقة المبلغ: ${analysis.amountMatch ? "نعم" : "لأ"}\n` +
          `مطابقة المستلم: ${analysis.recipientMatch ? "نعم" : "لأ"}\n` +
          `ملاحظات: ${analysis.notes}\n\n` +
          `محتاج تراجعها بنفسك وتتواصل مع العميل لو لازم.`;
      }

      try {
        const mediaId = await uploadWhatsAppMedia({
          imageBase64,
          mediaType: mediaType || "image/jpeg",
          phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
          token: WHATSAPP_TOKEN.value(),
        });
        await sendWhatsAppImage({
          to: MAZEN_WHATSAPP_NUMBER.value(),
          mediaId,
          caption: `📷 إثبات دفع طلب #${shortId}`,
          phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
          token: WHATSAPP_TOKEN.value(),
        });
      } catch (imgErr) {
        logger.warn("Could not send proof screenshot to Mazen", imgErr.message);
      }

      const wamid = await sendWhatsAppText({
        to: MAZEN_WHATSAPP_NUMBER.value(),
        body: messageBody,
        phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
        token: WHATSAPP_TOKEN.value(),
      });

      await orderRef.update({
        paymentMethod,
        paymentAnalysis: analysis,
        mazenPaymentMessageId: wamid,
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ status: newStatus });
    } catch (err) {
      logger.error("analyzePaymentProof error", err);
      return res.status(500).json({ error: "حصل خطأ أثناء تحليل الصورة، جرّبي تاني" });
    }
  }
);

exports.submitAddress = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { orderId, address } = req.body || {};
    if (!orderId || !address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ error: "orderId و address مطلوبين" });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        return res.status(404).json({ error: "الطلب مش موجود" });
      }

      await orderRef.update({
        address: address.trim(),
        status: "address_submitted",
        estimatedDeliveryMinDays: 10,
        estimatedDeliveryMaxDays: 17,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      logger.error("submitAddress error", err);
      return res.status(500).json({ error: "حصل خطأ، جرّبي تاني" });
    }
  }
);

exports.confirmOrderDetails = onRequest(
  {
    secrets: [WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, MAZEN_WHATSAPP_NUMBER],
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { orderId } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ error: "orderId مطلوب" });
    }

    try {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        return res.status(404).json({ error: "الطلب مش موجود" });
      }
      const order = orderSnap.data();
      const shortId = orderId.slice(-6).toUpperCase();

      const messageBody =
        `📦 تأكيد نهائي لطلب #${shortId}\n\n` +
        `الاسم: ${order.customerName || "-"}\n` +
        `الموبايل: ${order.customerPhone || "-"}\n` +
        `العنوان: ${order.address || "-"}\n\n` +
        `الإجمالي: ${order.totalPrice}\n` +
        `العربون المدفوع: ${order.depositAmount} ✅\n` +
        `المتبقي عند التسليم: ${order.remainingAmount}\n\n` +
        `اللينك: ${order.cartLink}\n\n` +
        `رد على الرسالة دي بأي حاجة أول ما تطلب الأوردر فعليًا من شي إن. ` +
        `بعد كده ممكن تحدّث مرحلة التتبع بالرد على نفس الرسالة بكلمة "دبي"، "مصر"، "شركة التوصيل"، أو "تسليم".`;

      const wamid = await sendWhatsAppText({
        to: MAZEN_WHATSAPP_NUMBER.value(),
        body: messageBody,
        phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
        token: WHATSAPP_TOKEN.value(),
      });

      try {
        const customerMessage =
          `تم تأكيد طلبك بنجاح! 🎉\n\n` +
          `رقم الطلب: #${shortId}\n` +
          `هنطلبه فعليًا من شي إن، وهيوصلك خلال 10 لـ 17 يوم تقريبًا.\n` +
          `المتبقي عند التسليم: ${order.remainingAmount} ج.م\n\n` +
          `هنبعتلك تحديثات التتبع أول بأول هنا على واتساب.`;

        await sendWhatsAppText({
          to: formatEgyptPhone(order.customerPhone),
          body: customerMessage,
          phoneNumberId: WHATSAPP_PHONE_NUMBER_ID.value(),
          token: WHATSAPP_TOKEN.value(),
        });
      } catch (custErr) {
        logger.warn("Could not message customer directly (expected on test number)", custErr.message);
      }

      await orderRef.update({
        mazenOrderConfirmMessageId: wamid,
        status: "awaiting_order_placement",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      logger.error("confirmOrderDetails error", err);
      return res.status(500).json({ error: "حصل خطأ، جرّبي تاني" });
    }
  }
);

// -----------------------------------------------------------------------
// استخراج بيانات المنتج عبر Apify (مربوطة بـ زر "استخراج تلقائي" في الداشبورد)
// -----------------------------------------------------------------------
exports.extractProductInfo = onRequest({ cors: true, secrets: [APIFY_TOKEN_SECRET, ANTHROPIC_API_KEY] }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }
  const { url: rawUrl, productId } = req.body || {};
  if (!rawUrl || typeof rawUrl !== "string") {
    return res.status(400).json({ error: "url مطلوب" });
  }
  const urlMatch = rawUrl.match(/https?:\/\/\S+/);
  const url = urlMatch ? urlMatch[0] : rawUrl.trim();

  // استخراج الـ goodsId من لينك شي إن لو موجود
  const goodsIdMatch = url.match(/-p-(\d+)\.html/i) || url.match(/goods_id=(\d+)/i);
  const goodsId = goodsIdMatch ? goodsIdMatch[1] : null;

  const token = APIFY_TOKEN_SECRET.value();
  const actorId = "shahidirfan~shein-product-scraper";

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}&waitForFinish=120`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrl: url,
          proxyConfiguration: { useApifyProxy: true, apifyProxyCountry: "EG" },
        }),
      }
    );

    const runData = await runRes.json();
    if (!runRes.ok) {
      logger.error("Apify run request failed", { status: runRes.status, body: runData });
      throw new Error(`فشل تشغيل أداة الفحص من Apify (${runRes.status}): ${JSON.stringify(runData)}`);
    }

    const datasetId = runData.data?.defaultDatasetId;
    if (!datasetId) {
      logger.error("extractProductInfo: no defaultDatasetId in Apify run response", {
        url,
        goodsId,
        runStatus: runData.data?.status,
        runData,
      });
      if (productId) {
        db.collection("products").doc(productId).update({ available: false, priceCheckedAt: new Date().toISOString() }).catch(() => {});
      }
      return res.status(200).json({ available: false });
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`
    );
    const items = await itemsRes.json();

    if (!items || items.length === 0) {
      logger.error("extractProductInfo: Apify dataset returned no items", {
        url,
        goodsId,
        datasetId,
        runStatus: runData.data?.status,
        itemsResStatus: itemsRes.status,
      });
      if (productId) {
        db.collection("products").doc(productId).update({ available: false, priceCheckedAt: new Date().toISOString() }).catch(() => {});
      }
      return res.status(200).json({ available: false });
    }

    const product = items[0];

    // Apify actors often return price/color/size as nested objects rather
    // than plain values — this pulls a usable value out of common shapes.
    function extractValue(v) {
      if (v == null) return null;
      if (typeof v === "string" || typeof v === "number") return v;
      if (typeof v === "object") {
        return (
          v.amountWithSymbol ||
          v.amount ||
          v.value ||
          v.usdAmount ||
          v.text ||
          v.name ||
          null
        );
      }
      return null;
    }

    logger.info("extractProductInfo raw product sample", { product });

    function extractImage(product) {
      const candidates = [
        product.image,
        product.mainImage,
        product.thumbnail,
        product.images && product.images[0],
        product.pictures && product.pictures[0],
        product.goods_imgs && product.goods_imgs.main_image,
      ];
      for (const c of candidates) {
        if (!c) continue;
        if (typeof c === "string") return c;
        if (typeof c === "object") {
          const found = c.url || c.origin_image || c.src || c.large || c.original;
          if (found) return found;
        }
      }
      return null;
    }

    function extractList(v) {
      if (v == null) return [];
      if (Array.isArray(v)) return v.map(extractValue).filter(Boolean);
      const single = extractValue(v);
      return single ? [single] : [];
    }

    const longTitle = extractValue(product.title) || extractValue(product.name) || null;
    let suggestedShortName = null;
    if (longTitle) {
      try {
        suggestedShortName = await suggestShortNameWithClaude(longTitle, ANTHROPIC_API_KEY.value());
      } catch (e) {
        logger.error("suggestShortNameWithClaude failed", e);
      }
    }

    const livePrice = extractValue(product.price) || extractValue(product.retailPrice) || extractValue(product.salePrice) || null;
    const colors = extractList(product.colors || product.color);
    const sizes = extractList(product.sizes || product.size);

    // Best-effort availability signal: an explicit out-of-stock flag from the
    // scraper, or simply no price at all, both mean it's not purchasable.
    const explicitlyOutOfStock =
      product.available === false || product.inStock === false || product.is_on_sale === false;
    const available = !explicitlyOutOfStock && !!livePrice;

    // If a customer triggered this from a product card's "check price" button,
    // keep the catalog price fresh server-side (safe: Admin SDK, not client writes).
    if (productId) {
      try {
        await db.collection("products").doc(productId).update({
          price: livePrice,
          available,
          priceCheckedAt: new Date().toISOString(),
        });
      } catch (e) {
        logger.error("Failed to update product price from live check", e);
      }
    }

    return res.status(200).json({
      available,
      title: longTitle,
      suggestedShortName,
      description: extractValue(product.description) || null,
      image: extractImage(product),
      price: livePrice,
      currency: "EGP",
      color: colors[0] || null,
      colors,
      size: sizes.join(", ") || null,
      sizes
    });

  } catch (err) {
    logger.error("extractProductInfo Apify error", err);
    return res.status(500).json({ error: "حصل خطأ في الاستخراج: " + err.message });
  }
});

exports.whatsappWebhook = onRequest(
  { secrets: [WHATSAPP_VERIFY_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, MAZEN_WHATSAPP_NUMBER] },
  async (req, res) => {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN.value()) {
        return res.status(200).send(challenge);
      }
      return res.status(403).send("Verification failed");
    }

    if (req.method === "POST") {
      try {
        logger.info("Webhook POST received", { body: JSON.stringify(req.body) });

        const entry = req.body?.entry?.[0];
        const change = entry?.changes?.[0]?.value;
        const message = change?.messages?.[0];

        if (!message) {
          return res.status(200).send("ok");
        }

        const repliedToId = message.context?.id;
        const text = message.text?.body?.trim();

        if (!repliedToId || !text) {
          return res.status(200).send("ok");
        }

        const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID.value();
        const token = WHATSAPP_TOKEN.value();
        const mazenNumber = MAZEN_WHATSAPP_NUMBER.value();

        const addrChangeSnap = await db
          .collection("orders")
          .where("mazenAddressChangeMessageId", "==", repliedToId)
          .limit(1)
          .get();

        if (!addrChangeSnap.empty) {
          const order = addrChangeSnap.docs[0].data();
          const shortId = addrChangeSnap.docs[0].id.slice(-6).toUpperCase();
          const lower = text.toLowerCase();
          const isDone = /تم|ok|done/i.test(lower);
          const isOutForDelivery = /خرج|out/i.test(lower);

          if (isDone) {
            try {
              await sendWhatsAppText({
                to: formatEgyptPhone(order.customerPhone),
                body: `تم تحديث بياناتك مع شركة التوصيل بنجاح ✅ (طلب #${shortId})`,
                phoneNumberId,
                token,
              });
            } catch (e) {
              logger.warn("Could not confirm address change to customer", e.message);
            }
            await addrChangeSnap.docs[0].ref.update({
              addressChangeRequestText: null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else if (isOutForDelivery) {
            try {
              await sendWhatsAppText({
                to: formatEgyptPhone(order.customerPhone),
                body:
                  `طلبك #${shortId} طلع فعلاً للتوصيل ومقدرش نعدّل البيانات دلوقتي، ` +
                  `هيوصلك قريب جدًا 🚚`,
                phoneNumberId,
                token,
              });
            } catch (e) {
              logger.warn("Could not send out-for-delivery notice to customer", e.message);
            }
            await addrChangeSnap.docs[0].ref.update({
              trackingStage: "with_carrier",
              addressChangeRequestText: null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          return res.status(200).send("ok");
        }

        const egyptMsgSnap = await db
          .collection("orders")
          .where("customerEgyptMessageId", "==", repliedToId)
          .limit(1)
          .get();

        if (!egyptMsgSnap.empty) {
          const shortId = egyptMsgSnap.docs[0].id.slice(-6).toUpperCase();
          const forwardBody =
            `✏️ طلب تعديل بيانات توصيل — طلب #${shortId}\n\n` +
            `"${text}"\n\n` +
            `رد بـ "تم" لما تعدّل مع شركة التوصيل، أو "خرج للتوصيل" لو مش هينفع تتغير.`;

          const wamid = await sendWhatsAppText({
            to: mazenNumber,
            body: forwardBody,
            phoneNumberId,
            token,
          });

          await egyptMsgSnap.docs[0].ref.update({
            mazenAddressChangeMessageId: wamid,
            addressChangeRequestText: text,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return res.status(200).send("ok");
        }

        const orderPlacedSnap = await db
          .collection("orders")
          .where("mazenOrderConfirmMessageId", "==", repliedToId)
          .limit(1)
          .get();

        if (!orderPlacedSnap.empty) {
          const STAGE_KEYWORDS = [
            { stage: "delivered", words: ["تسليم", "استلمت", "وصلت للعميل", "delivered"] },
            { stage: "with_carrier", words: ["الشحن", "شركة الشحن", "شركة التوصيل", "التوصيل", "مندوب", "شيرأكس", "shareex"] },
            { stage: "egypt", words: ["مصر", "القاهرة", "egypt"] },
            { stage: "dubai", words: ["دبي", "الامارات", "dubai"] },
          ];

          const lowerText = text.toLowerCase();
          const matched = STAGE_KEYWORDS.find((s) => s.words.some((w) => lowerText.includes(w.toLowerCase())));

          const orderDataBefore = orderPlacedSnap.docs[0].data();
          const shortId = orderPlacedSnap.docs[0].id.slice(-6).toUpperCase();

          const updateData = {
            status: "ordered",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (!orderDataBefore.orderedAt) {
            updateData.orderedAt = admin.firestore.FieldValue.serverTimestamp();
          }
          if (matched) {
            updateData.trackingStage = matched.stage;
          } else if (!orderDataBefore.trackingStage) {
            updateData.trackingStage = "dubai";
          }

          await orderPlacedSnap.docs[0].ref.update(updateData);

          if (updateData.trackingStage === "egypt") {
            try {
              const customerEgyptMsgId = await sendWhatsAppText({
                to: formatEgyptPhone(orderDataBefore.customerPhone),
                body:
                  `📦 خبر كويس! طلبك #${shortId} وصل مصر ومتوقع يوصلك خلال يوم أو يومين.\n\n` +
                  `لو حابة تغيّري العنوان أو رقم الموبايل اللي هيستلم، ردي على الرسالة دي بالتفاصيل الجديدة.`,
                phoneNumberId,
                token,
              });
              await orderPlacedSnap.docs[0].ref.update({ customerEgyptMessageId: customerEgyptMsgId });
            } catch (custErr) {
              logger.warn("Could not send Egypt-arrival update to customer", custErr.message);
            }
          }

          return res.status(200).send("ok");
        }

        if (/^payment done$/i.test(text)) {
          const paySnap = await db
            .collection("orders")
            .where("mazenPaymentMessageId", "==", repliedToId)
            .limit(1)
            .get();

          if (!paySnap.empty) {
            await paySnap.docs[0].ref.update({
              status: "payment_confirmed",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return res.status(200).send("ok");
          }
          return res.status(200).send("ok");
        }

        const priceMatch = text.match(/[\d.]+/);
        if (!priceMatch) {
          return res.status(200).send("ok");
        }
        const totalPrice = parseFloat(priceMatch[0]);
        const depositAmount = Math.round(totalPrice * DEPOSIT_RATIO * 100) / 100;
        const remainingAmount = Math.round((totalPrice - depositAmount) * 100) / 100;

        const snap = await db
          .collection("orders")
          .where("mazenMessageId", "==", repliedToId)
          .limit(1)
          .get();

        if (snap.empty) {
          return res.status(200).send("ok");
        }

        await snap.docs[0].ref.update({
          totalPrice,
          depositAmount,
          remainingAmount,
          status: "priced",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).send("ok");
      } catch (err) {
        logger.error("whatsappWebhook error", err);
        return res.status(200).send("ok");
      }
    }

    return res.status(405).send("Method not allowed");
  }
);
