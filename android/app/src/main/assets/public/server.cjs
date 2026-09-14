var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "15mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "15mb" }));
var geminiClient = null;
function getGemini() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    geminiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
async function callGeminiVisionWithFallback(ai, cleanBase64, prompt, systemInstruction) {
  const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError = null;
  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
              { text: prompt }
            ]
          },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (err) {
        lastError = err;
        const errMsg = (err?.message || "").toLowerCase();
        const errStatus = err?.status;
        const errCode = err?.code || err?.error?.code;
        const isTransient = errStatus === "UNAVAILABLE" || errCode === 503 || errCode === 429 || errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("overloaded") || errMsg.includes("unavailable") || errMsg.includes("resource_exhausted") || errMsg.includes("rate");
        console.warn(`[Gemini Vision] Model '${model}' attempt ${attempt} failed:`, err?.message || err);
        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}
var requestRateMap = /* @__PURE__ */ new Map();
function checkRateLimit(ip, maxRequests = 20, windowMs = 6e4) {
  const now = Date.now();
  const timestamps = (requestRateMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  requestRateMap.set(ip, timestamps);
  return true;
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/analyze-formation", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "client";
  if (!checkRateLimit(clientIp, 20, 6e4)) {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u062D\u062F \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u062F\u0642\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B."
    });
    return;
  }
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      res.status(400).json({
        error: "Missing image",
        message: "\u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D."
      });
      return;
    }
    const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;
    const ai = getGemini();
    const systemInstruction = `\u0623\u0646\u062A \u0645\u062D\u0644\u0644 \u062A\u0643\u062A\u064A\u0643\u064A \u0648\u062E\u0628\u064A\u0631 \u0631\u0624\u064A\u0629 \u062D\u0627\u0633\u0648\u0628\u064A\u0629 (Vision AI) \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0644\u0642\u0637\u0627\u062A \u0634\u0627\u0634\u0627\u062A \u062A\u0634\u0643\u064A\u0644\u0627\u062A \u0648\u062E\u0637\u0629 \u0627\u0644\u0644\u0639\u0628 \u0641\u064A \u0623\u0644\u0639\u0627\u0628 \u0643\u0631\u0629 \u0627\u0644\u0642\u062F\u0645\u060C \u0648\u0628\u0634\u0643\u0644 \u062E\u0627\u0635 eFootball \u0648 PES.
\u0645\u0647\u0645\u062A\u0643 \u0641\u062D\u0635 \u0644\u0642\u0637\u0629 \u0627\u0644\u0634\u0627\u0634\u0629 (Screenshot) \u0628\u062F\u0642\u0629 \u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u062A\u062E\u0645\u064A\u0646 \u0623\u0648 \u0627\u062E\u062A\u0631\u0627\u0639.

\u0642\u0648\u0627\u0639\u062F \u0635\u0627\u0631\u0645\u0629 \u0644\u0627 \u062A\u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621:
1. \u062A\u062D\u0642\u0642 \u0623\u0648\u0644\u0627\u064B \u0647\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0645\u062B\u0644 \u0644\u0642\u0637\u0629 \u0634\u0627\u0634\u0629 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u062E\u0637\u0629 \u0644\u0639\u0628 / \u062A\u0634\u0643\u064A\u0644\u0629 \u0643\u0631\u0629 \u0642\u062F\u0645 ('isFormationScreenshot': true \u0623\u0648 false). \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0643\u0630\u0644\u0643\u060C \u0627\u062C\u0639\u0644 'isReliable': false \u0648\u0636\u0639 \u0627\u0644\u0633\u0628\u0628 \u0641\u064A 'unreliableReason'.
2. \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629\u060C \u0645\u0634\u0648\u0634\u0629\u060C \u0623\u0648 \u0645\u0642\u0637\u0648\u0639\u0629 \u0644\u062F\u0631\u062C\u0629 \u062A\u0645\u0646\u0639 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0628\u062F\u0642\u0629\u060C \u0627\u062C\u0639\u0644 'isReliable': false \u0648 'unreliableReason': "\u0644\u0645 \u0623\u062A\u0645\u0643\u0646 \u0645\u0646 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0628\u0634\u0643\u0644 \u0645\u0648\u062B\u0648\u0642\u060C \u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0623\u0648\u0636\u062D."
3. \u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629 (\u0645\u062B\u0644 '4-2-1-3', '4-3-3', '4-2-2-2', '5-3-2', '4-1-2-3', '3-2-2-3', '4-4-2').
4. \u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628 (Coach) \u0648\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0644\u0639\u0628 (Team Playstyle) \u0645\u062B\u0644 'Quick Counter', 'Possession Game', 'Long Ball Counter', 'Out Wide' \u0625\u0646 \u0643\u0627\u0646\u062A \u0638\u0627\u0647\u0631\u0629 \u0628\u0627\u0644\u0635\u0648\u0631\u0629\u060C \u0648\u0625\u0644\u0627 \u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 "".
5. \u0627\u0633\u062A\u062E\u0631\u062C \u0642\u0648\u0629 \u0627\u0644\u0641\u0631\u064A\u0642 \u0623\u0648 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0638\u0627\u0647\u0631 (Team Strength / Rating) \u0625\u0646 \u0648\u062C\u062F.
6. \u0642\u064A\u0645 \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u062A\u0643\u062A\u064A\u0643\u064A\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u0648\u0627\u0632\u0646 \u0627\u0644\u062E\u0637\u0648\u0637 \u0648\u0627\u0644\u062A\u0631\u0627\u0628\u0637 (tacticalRating \u0645\u0646 0 \u0625\u0644\u0649 100).
7. \u0627\u0633\u062A\u062E\u0631\u062C \u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 (strengths: 3 \u0625\u0644\u0649 4 \u0646\u0642\u0627\u0637 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0648\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0644\u0639\u0628 \u0627\u0644\u0645\u0643\u062A\u0634\u0641).
8. \u0627\u0633\u062A\u062E\u0631\u062C \u0646\u0642\u0627\u0637 \u0627\u0644\u0636\u0639\u0641 \u0648\u0627\u0644\u062B\u063A\u0631\u0627\u062A \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A\u0629 (weaknesses: 3 \u0625\u0644\u0649 4 \u0646\u0642\u0627\u0637 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0645\u0633\u0627\u062D\u0627\u062A \u062E\u0644\u0641 \u0627\u0644\u0623\u0638\u0647\u0631\u0629\u060C \u0636\u0639\u0641 \u0627\u0644\u0645\u0633\u0627\u0646\u062F\u0629\u060C \u0625\u0644\u062E).
9. \u0642\u062F\u0645 \u0646\u0635\u0627\u0626\u062D \u062A\u0643\u062A\u064A\u0643\u064A\u0629 \u062F\u0642\u064A\u0642\u0629 \u0648\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0637\u0628\u064A\u0642 (tacticalAdvice: 3 \u0625\u0644\u0649 4 \u0646\u0635\u0627\u0626\u062D \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629).
10. \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u064A\u0646 \u0641\u064A \u0623\u0631\u0636\u064A\u0629 \u0627\u0644\u0645\u0644\u0639\u0628 (detectedPlayers):
    - \u0627\u0633\u062A\u062E\u0631\u062C \u0643\u0644 \u0644\u0627\u0639\u0628 \u0638\u0627\u0647\u0631 \u0641\u064A \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 (\u062D\u062A\u0649 11 \u0644\u0627\u0639\u0628\u0627\u064B):
      * name: \u0627\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628 \u0643\u0645\u0627 \u0647\u0648 \u0645\u0643\u062A\u0648\u0628 \u0628\u062F\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u0637\u0627\u0642\u0629/\u0627\u0644\u0645\u0644\u0635\u0642. \u0625\u0630\u0627 \u0644\u0645 \u064A\u0643\u0646 \u0648\u0627\u0636\u062D\u0627\u064B\u060C \u0627\u0643\u062A\u0628 'unknown' \u0648\u0627\u062C\u0639\u0644 isClear: false. \u0644\u0627 \u062A\u062E\u062A\u0631\u0639 \u0623\u0633\u0645\u0627\u0621!
      * position: \u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u062F\u0642\u064A\u0642 ('GK', 'CB', 'LB', 'RB', 'DMF', 'CMF', 'AMF', 'LMF', 'RMF', 'LWF', 'RWF', 'SS', 'CF').
      * rating: \u0631\u0642\u0645 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0639\u0627\u0645 (Overall) \u0627\u0644\u0638\u0627\u0647\u0631 \u0639\u0644\u0649 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0644\u0627\u0639\u0628 (\u0645\u062B\u0644 102, 99, 97, 95). \u0625\u0630\u0627 \u0643\u0627\u0646 \u063A\u064A\u0631 \u0645\u0642\u0631\u0648\u0621\u060C \u0627\u062C\u0639\u0644\u0647 null. \u0644\u0627 \u062A\u062E\u062A\u0631\u0639 \u0623\u0631\u0642\u0627\u0645\u0627\u064B!
      * isClear: true \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0627\u0644\u0645\u0631\u0643\u0632 \u0645\u0642\u0631\u0648\u0621\u064A\u0646 \u0628\u0648\u0636\u0648\u062D\u060C \u0648 false \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0627\u0633\u0645 \u0645\u0645\u0648\u0647\u0627\u064B \u0623\u0648 \u063A\u064A\u0631 \u0645\u0624\u0643\u062F.
      * pitchX: \u0645\u0648\u0636\u0639 \u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0623\u0641\u0642\u064A \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0644\u0639\u0628 (0 = \u0623\u0642\u0635\u0649 \u0627\u0644\u064A\u0633\u0627\u0631\u060C 50 = \u0627\u0644\u0645\u0646\u062A\u0635\u0641\u060C 100 = \u0623\u0642\u0635\u0649 \u0627\u0644\u064A\u0645\u064A\u0646).
      * pitchY: \u0645\u0648\u0636\u0639 \u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0631\u0623\u0633\u064A \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0644\u0639\u0628 (0 = \u062E\u0637 \u0627\u0644\u0647\u062C\u0648\u0645 \u0627\u0644\u0639\u0644\u0648\u064A\u060C 50 = \u062F\u0627\u0626\u0631\u0629 \u0627\u0644\u0633\u0646\u062A\u0631\u060C 100 = \u0645\u0646\u0637\u0642\u0629 \u062D\u0627\u0631\u0633 \u0627\u0644\u0645\u0631\u0645\u0649 \u0627\u0644\u0633\u0641\u0644\u064A\u0629).
11. \u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u0627\u064B \u0628\u0627\u062A\u0627\u064B \u0627\u062E\u062A\u0631\u0627\u0639 \u0623\u064A \u0627\u0633\u0645 \u0644\u0627\u0639\u0628 \u0623\u0648 \u062A\u0642\u064A\u064A\u0645. \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u062D\u0642\u064A\u0642\u0629 \u0627\u0644\u0645\u0631\u0626\u064A\u0629 \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629 \u0641\u0642\u0637.
12. \u0627\u0644\u0631\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u0635\u064A\u063A\u0629 JSON \u0646\u0642\u064A\u0629 \u0648\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0645\u062E\u0637\u0637 \u0627\u0644\u062A\u0627\u0644\u064A \u0641\u0642\u0637.`;
    const prompt = `\u0627\u0641\u062D\u0635 \u0644\u0642\u0637\u0629 \u0634\u0627\u0634\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0628\u0639\u0646\u0627\u064A\u0629 \u062A\u0627\u0645\u0629 \u0648\u0623\u0631\u062C\u0639 \u0643\u0627\u0626\u0646 JSON \u0628\u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0627\u0644\u064A:
{
  "isFormationScreenshot": boolean,
  "isReliable": boolean,
  "unreliableReason": string,
  "gameName": string,
  "formationName": string,
  "coachName": string,
  "playstyle": string,
  "teamStrength": string,
  "tacticalRating": number,
  "strengths": [string],
  "weaknesses": [string],
  "tacticalAdvice": [string],
  "detectedPlayers": [
    {
      "name": string,
      "position": string,
      "rating": number,
      "isClear": boolean,
      "confidence": number,
      "pitchX": number,
      "pitchY": number
    }
  ]
}`;
    let responseText;
    try {
      responseText = await callGeminiVisionWithFallback(ai, cleanBase64, prompt, systemInstruction);
    } catch (aiError) {
      console.error("Gemini Vision AI call error:", aiError?.message || aiError);
      const errMsg = (aiError?.message || "").toLowerCase();
      const errStatus = aiError?.status;
      const errCode = aiError?.code || aiError?.error?.code;
      if (errStatus === "UNAVAILABLE" || errCode === 503 || errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("unavailable") || errMsg.includes("overloaded")) {
        res.status(503).json({
          error: "Service unavailable",
          message: "\u062E\u062F\u0645\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u062A\u0634\u0647\u062F \u0636\u063A\u0637\u0627\u064B \u0645\u0624\u0642\u062A\u0627\u064B \u0639\u0627\u0644\u064A\u0627\u064B \u062D\u0627\u0644\u064A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0636\u0639 \u0644\u062D\u0638\u0627\u062A \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."
        });
        return;
      }
      if (errCode === 429 || errMsg.includes("429") || errMsg.includes("quota")) {
        res.status(429).json({
          error: "Quota exceeded",
          message: "\u062A\u0645 \u0628\u0644\u0648\u063A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0644\u062D\u0638\u0627\u062A."
        });
        return;
      }
      res.status(500).json({
        error: "AI analysis failed",
        message: aiError?.message || "\u062A\u0639\u0630\u0631 \u0641\u062D\u0635 \u0627\u0644\u0635\u0648\u0631\u0629 \u0639\u0628\u0631 \u062E\u0648\u0627\u062F\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u0635\u0648\u0631\u0629 \u0623\u062E\u0631\u0649 \u0623\u0648\u0636\u062D."
      });
      return;
    }
    const trimmed = responseText.trim() || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(trimmed);
    } catch {
      const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        parsedData = JSON.parse(match[1]);
      } else {
        throw new Error("\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0631\u062F \u0645\u0646 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D");
      }
    }
    const isFormationScreenshot = parsedData?.isFormationScreenshot !== false;
    const isReliable = parsedData?.isReliable !== false && isFormationScreenshot;
    const unreliableReason = isReliable ? null : parsedData?.unreliableReason || (!isFormationScreenshot ? "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0644\u064A\u0633\u062A \u0644\u0642\u0637\u0629 \u0634\u0627\u0634\u0629 \u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0643\u0631\u0629 \u0642\u062F\u0645 \u0635\u0627\u0644\u062D\u0629." : "\u0644\u0645 \u0623\u062A\u0645\u0643\u0646 \u0645\u0646 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062A\u0634\u0643\u064A\u0644\u0629 \u0628\u0634\u0643\u0644 \u0645\u0648\u062B\u0648\u0642\u060C \u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0623\u0648\u0636\u062D.");
    const formationName = typeof parsedData?.formationName === "string" && parsedData.formationName.trim() ? parsedData.formationName.trim() : typeof parsedData?.formation === "string" && parsedData.formation.trim() ? parsedData.formation.trim() : null;
    let tacticalRating = null;
    if (typeof parsedData?.tacticalRating === "number" && Number.isFinite(parsedData.tacticalRating)) {
      tacticalRating = Math.round(parsedData.tacticalRating);
    } else if (typeof parsedData?.tacticalScore === "number" && Number.isFinite(parsedData.tacticalScore)) {
      tacticalRating = Math.round(parsedData.tacticalScore);
    }
    const rawPlayers = Array.isArray(parsedData?.detectedPlayers) ? parsedData.detectedPlayers : Array.isArray(parsedData?.players) ? parsedData.players : [];
    const detectedPlayers = rawPlayers.map((p) => {
      const name = String(p?.name || p?.playerName || "").trim() || "unknown";
      const position = String(p?.position || p?.pos || "CF").trim().toUpperCase();
      let rating = null;
      if (typeof p?.rating === "number" && Number.isFinite(p.rating)) {
        rating = Math.round(p.rating);
      } else if (typeof p?.overall === "number" && Number.isFinite(p.overall)) {
        rating = Math.round(p.overall);
      }
      const pitchX = typeof p?.pitchX === "number" && Number.isFinite(p.pitchX) ? p.pitchX : typeof p?.x === "number" && Number.isFinite(p.x) ? p.x : 50;
      const pitchY = typeof p?.pitchY === "number" && Number.isFinite(p.pitchY) ? p.pitchY : typeof p?.y === "number" && Number.isFinite(p.y) ? p.y : 50;
      const isClear = p?.isClear !== false && name !== "unknown";
      return {
        name,
        position,
        rating,
        pitchX,
        pitchY,
        isClear
      };
    });
    const canonicalResponse = {
      isFormationScreenshot,
      isReliable,
      unreliableReason,
      formationName,
      tacticalRating,
      detectedPlayers,
      coachName: typeof parsedData?.coachName === "string" && parsedData.coachName.trim() ? parsedData.coachName.trim() : typeof parsedData?.coach === "string" && parsedData.coach.trim() ? parsedData.coach.trim() : null,
      playstyle: typeof parsedData?.playstyle === "string" && parsedData.playstyle.trim() ? parsedData.playstyle.trim() : typeof parsedData?.teamPlaystyle === "string" && parsedData.teamPlaystyle.trim() ? parsedData.teamPlaystyle.trim() : null,
      teamStrength: typeof parsedData?.teamStrength === "string" && parsedData.teamStrength.trim() ? parsedData.teamStrength.trim() : typeof parsedData?.strength === "string" && parsedData.strength.trim() ? parsedData.strength.trim() : null,
      strengths: Array.isArray(parsedData?.strengths) ? parsedData.strengths.filter((s) => typeof s === "string" && s.trim()) : [],
      weaknesses: Array.isArray(parsedData?.weaknesses) ? parsedData.weaknesses.filter((w) => typeof w === "string" && w.trim()) : [],
      tacticalAdvice: Array.isArray(parsedData?.tacticalAdvice) ? parsedData.tacticalAdvice.filter((a) => typeof a === "string" && a.trim()) : Array.isArray(parsedData?.advice) ? parsedData.advice.filter((a) => typeof a === "string" && a.trim()) : []
    };
    res.json(canonicalResponse);
  } catch (error) {
    console.error("Error analyzing formation image:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0635\u0648\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649."
    });
  }
});
var WHEEL_DATA_FILE = import_path.default.join(process.cwd(), "data", "wheelSpins.json");
var activeSpinLocks = /* @__PURE__ */ new Set();
function getWheelStore() {
  try {
    if (import_fs.default.existsSync(WHEEL_DATA_FILE)) {
      return JSON.parse(import_fs.default.readFileSync(WHEEL_DATA_FILE, "utf-8"));
    }
  } catch {
  }
  return {};
}
function saveWheelStore(store) {
  try {
    const dir = import_path.default.dirname(WHEEL_DATA_FILE);
    if (!import_fs.default.existsSync(dir)) import_fs.default.mkdirSync(dir, { recursive: true });
    import_fs.default.writeFileSync(WHEEL_DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save wheel spins store:", err);
  }
}
app.get("/api/time", (_req, res) => {
  res.json({
    serverTime: Date.now(),
    iso: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/wheel/status", (req, res) => {
  const deviceId = req.query.deviceId?.trim();
  const now = Date.now();
  if (!deviceId) {
    res.json({
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    });
    return;
  }
  const store = getWheelStore();
  const userRecord = store[deviceId];
  if (!userRecord || !userRecord.nextSpinAt) {
    res.json({
      canSpin: true,
      lastSpinAt: null,
      nextSpinAt: null,
      serverTime: now,
      remainingMs: 0
    });
    return;
  }
  const remainingMs = Math.max(0, userRecord.nextSpinAt - now);
  const canSpin = remainingMs <= 0;
  res.json({
    canSpin,
    lastSpinAt: userRecord.lastSpinAt,
    nextSpinAt: userRecord.nextSpinAt,
    serverTime: now,
    remainingMs
  });
});
app.post("/api/wheel/spin", (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId || typeof deviceId !== "string") {
    res.status(400).json({ error: "Missing deviceId parameter" });
    return;
  }
  if (activeSpinLocks.has(deviceId)) {
    res.status(429).json({ error: "Spin already in progress. Please wait." });
    return;
  }
  activeSpinLocks.add(deviceId);
  try {
    const now = Date.now();
    const store = getWheelStore();
    const userRecord = store[deviceId];
    if (userRecord && userRecord.nextSpinAt && now < userRecord.nextSpinAt) {
      const remainingMs = userRecord.nextSpinAt - now;
      res.status(429).json({
        error: "Cooldown active",
        remainingMs,
        message: "\u0645\u0633\u0645\u0648\u062D \u0628\u0644\u0641\u0629 \u0648\u0627\u062D\u062F\u0629 \u0643\u0644 24 \u0633\u0627\u0639\u0629 \u0641\u0642\u0637."
      });
      return;
    }
    const prizes = [
      { id: "suarez", weight: 1, index: 0 },
      { id: "coins_150", weight: 1, index: 1 },
      { id: "ipad_prize", weight: 0, index: 2 },
      { id: "casillas", weight: 1, index: 3 },
      { id: "better_luck", weight: 97, index: 4 }
    ];
    const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
    if (totalWeight <= 0) {
      res.status(500).json({ error: "Wheel configuration invalid: all weights are 0." });
      return;
    }
    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    let selectedPrize = prizes[prizes.length - 1];
    for (const p of prizes) {
      accumulated += p.weight;
      if (rand < accumulated) {
        selectedPrize = p;
        break;
      }
    }
    const COOLDOWN_24H_MS = 24 * 60 * 60 * 1e3;
    const nextSpinAt = now + COOLDOWN_24H_MS;
    store[deviceId] = {
      lastSpinAt: now,
      nextSpinAt
    };
    saveWheelStore(store);
    res.json({
      success: true,
      prizeIndex: selectedPrize.index,
      prizeId: selectedPrize.id,
      nextSpinAt,
      serverTime: now
    });
  } finally {
    activeSpinLocks.delete(deviceId);
  }
});
app.post("/api/efhub/parse", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Missing input parameter" });
      return;
    }
    const trimmed = input.trim();
    let sourceCardId = "";
    if (/^\d{5,25}$/.test(trimmed)) {
      sourceCardId = trimmed;
    } else {
      const match = trimmed.match(/(?:players|player_cards)\/(\d+)/);
      if (match && match[1]) {
        sourceCardId = match[1];
      }
    }
    if (!sourceCardId) {
      res.status(400).json({
        error: "Invalid eFHUB URL or ID",
        message: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u0639\u0631\u0641 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 (Card ID). \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0627\u0628\u0637 \u0644\u0627\u0639\u0628 \u0645\u0646 eFHUB \u0645\u062B\u0644 https://efhub.com/tr/players/105873896755947 \u0623\u0648 ID \u0645\u0628\u0627\u0634\u0631."
      });
      return;
    }
    const cardImageUrl = `https://efimg.com/efootballhub22/images/player_cards/${sourceCardId}_l.png`;
    const sourceUrl = `https://efhub.com/tr/players/${sourceCardId}`;
    const parsedResult = {
      source: "eFHUB",
      sourceCardId,
      sourceUrl,
      cardImageUrl,
      sourceVersion: "eFootball 2025 v4.2.0",
      playerName: "",
      arabicName: "",
      position: "CF",
      overall: 84,
      maxOverall: 98,
      cardType: "Highlight",
      version: "2025",
      team: "",
      nationality: "",
      playingStyle: "Goal Poacher"
    };
    try {
      const fetchResponse = await fetch(sourceUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(4500)
      });
      if (fetchResponse.ok) {
        const html = await fetchResponse.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const titleParts = titleMatch[1].split(/[—\-|]/);
          if (titleParts.length > 0) {
            const rawName = titleParts[0].trim();
            if (rawName && !rawName.toLowerCase().includes("efhub")) {
              parsedResult.playerName = rawName;
            }
          }
          const ovrMatch = titleMatch[1].match(/(\d+)\s*OVR/i);
          if (ovrMatch && ovrMatch[1]) {
            parsedResult.maxOverall = parseInt(ovrMatch[1], 10);
            parsedResult.overall = Math.max(72, parsedResult.maxOverall - 14);
          }
        }
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (descMatch && descMatch[1]) {
          const desc = descMatch[1];
          if (/\b(SF|Santrfor|CF)\b/i.test(desc)) parsedResult.position = "CF";
          else if (/\b(GF|Gölge Forvet|SS)\b/i.test(desc)) parsedResult.position = "SS";
          else if (/\b(SGA|Sağ Açık|RWF)\b/i.test(desc)) parsedResult.position = "RWF";
          else if (/\b(SLA|Sol Açık|LWF)\b/i.test(desc)) parsedResult.position = "LWF";
          else if (/\b(OOS|Ofansif Orta Saha|AMF)\b/i.test(desc)) parsedResult.position = "AMF";
          else if (/\b(GO|Göbek Orta Saha|CMF)\b/i.test(desc)) parsedResult.position = "CMF";
          else if (/\b(DOS|Defansif Orta Saha|DMF)\b/i.test(desc)) parsedResult.position = "DMF";
          else if (/\b(STP|Stoper|CB)\b/i.test(desc)) parsedResult.position = "CB";
          else if (/\b(SLB|Sol Bek|LB)\b/i.test(desc)) parsedResult.position = "LB";
          else if (/\b(SGB|Sağ Bek|RB)\b/i.test(desc)) parsedResult.position = "RB";
          else if (/\b(KL|Kaleci|GK)\b/i.test(desc)) parsedResult.position = "GK";
          if (/Big Time/i.test(desc) || /Big Time/i.test(html)) parsedResult.cardType = "Big Time";
          else if (/Show Time/i.test(desc) || /Show Time/i.test(html)) parsedResult.cardType = "Show Time";
          else if (/Epic/i.test(desc) || /Epic/i.test(html)) parsedResult.cardType = "Epic Booster";
          else if (/POTW/i.test(desc) || /POTW/i.test(html)) parsedResult.cardType = "POTW";
        }
      }
    } catch (e) {
    }
    res.json({
      success: true,
      card: parsedResult
    });
  } catch (err) {
    res.status(500).json({
      error: "Parse failed",
      message: err?.message || "\u0641\u0634\u0644 \u0645\u0639\u0627\u0644\u062C\u0629 \u0631\u0627\u0628\u0637 eFHUB."
    });
  }
});
app.post("/api/admin/resync-players", async (_req, res) => {
  const targetStarSlugs = [
    { name: "Lionel Messi", id: "89138556575063" },
    { name: "Matheus Cunha", id: "105873896755947" },
    { name: "Antoine Semenyo", id: "105873896760682" },
    { name: "Dominik Szoboszlai", id: "106763223432463" },
    { name: "Cole Palmer", id: "89135067044780" },
    { name: "Cristiano Ronaldo", id: "89138556572074" },
    { name: "Kylian Mbapp\xE9", id: "89138556678270" },
    { name: "Erling Haaland", id: "106778255821223" },
    { name: "Neymar", id: "88044145253792" },
    { name: "Jude Bellingham", id: "89138556700485" },
    { name: "Lamine Yamal", id: "89138019858754" },
    { name: "Mohamed Salah", id: "106768055197475" },
    { name: "Kevin De Bruyne", id: "106788187843931" },
    { name: "Robert Lewandowski", id: "123236838841410" }
  ];
  try {
    const rawCards = [];
    const efhubHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    };
    try {
      const newPlayersRes = await fetch("https://efhub.com/tr/new-players", {
        headers: efhubHeaders,
        signal: AbortSignal.timeout(8e3)
      });
      if (newPlayersRes.ok) {
        const newHtml = await newPlayersRes.text();
        const playerRegex = /\\?"player\\?":\\?({[^{}]+})/g;
        let m;
        while ((m = playerRegex.exec(newHtml)) !== null) {
          try {
            rawCards.push(JSON.parse(m[1].replace(/\\"/g, '"')));
          } catch {
          }
        }
      }
    } catch (fetchErr) {
      console.warn("Could not fetch new-players, continuing with player batches:", fetchErr);
    }
    const starResults = await Promise.all(
      targetStarSlugs.map(async (star) => {
        try {
          const pRes = await fetch(`https://efhub.com/tr/players/${star.id}`, {
            headers: efhubHeaders,
            signal: AbortSignal.timeout(6e3)
          });
          if (!pRes.ok) return [];
          const html = await pRes.text();
          const playerRegex = /\\?"player\\?":\\?({[^{}]+})/g;
          let m;
          const list = [];
          while ((m = playerRegex.exec(html)) !== null) {
            try {
              list.push(JSON.parse(m[1].replace(/\\"/g, '"')));
            } catch {
            }
          }
          return list;
        } catch {
          return [];
        }
      })
    );
    rawCards.push(...starResults.flat());
    let invalidCount = 0;
    let duplicatesCount = 0;
    const cardMap = /* @__PURE__ */ new Map();
    const playerIds = /* @__PURE__ */ new Set();
    for (const c of rawCards) {
      const cardId = c.id ? String(c.id).trim() : "";
      const playerName = c.name ? String(c.name).trim() : "";
      const clubName = c.team ? String(c.team).trim() : "";
      const position = c.position ? String(c.position).trim() : "";
      const overall = Number(c.overallRating) || 0;
      const cardImageUrl = c.imageUrl ? String(c.imageUrl).trim() : "";
      if (!cardId || !playerName || !clubName || !position || overall <= 0 || !cardImageUrl.startsWith("https://efimg.com/")) {
        invalidCount++;
        continue;
      }
      if (cardMap.has(cardId)) {
        duplicatesCount++;
        continue;
      }
      const playerId = playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      playerIds.add(playerId);
      const cardType = c.playerType === 3 ? "POTW" : c.playerType === 7 ? "Epic Booster" : c.playerType === 8 ? "Show Time" : c.playerType === 9 ? "Big Time" : c.playerType === 6 ? "Highlight" : "Standard";
      cardMap.set(cardId, {
        id: cardId,
        cardId,
        playerId,
        playerName,
        cardName: `${playerName} (${clubName} ${cardType})`,
        clubName,
        team: clubName,
        position,
        overall,
        maxOverall: overall > 90 ? Math.min(108, overall + 6) : Math.min(102, overall + 14),
        cardType,
        cardVersion: "2025",
        version: "2025",
        cardImageUrl,
        efhubUrl: `https://efhub.com/tr/players/${cardId}`,
        sourceUrl: `https://efhub.com/tr/players/${cardId}`,
        sourceCardId: cardId,
        sourceVersion: "eFootball 2025 v4.2.0",
        source: "eFHUB",
        nationality: clubName,
        playingStyle: "Creative Playmaker",
        level: 1,
        maxLevel: 28,
        baseStats: {
          offensiveAwareness: Math.max(50, Math.min(99, overall - 2)),
          ballControl: Math.max(50, Math.min(99, overall)),
          dribbling: Math.max(50, Math.min(99, overall)),
          tightPossession: Math.max(50, Math.min(99, overall - 1)),
          lowPass: Math.max(50, Math.min(99, overall - 5)),
          loftedPass: Math.max(50, Math.min(99, overall - 8)),
          finishing: Math.max(50, Math.min(99, overall - 4)),
          heading: 65,
          placeKicking: 75,
          curl: 80,
          speed: Math.max(60, Math.min(99, overall - 3)),
          acceleration: Math.max(60, Math.min(99, overall - 1)),
          kickingPower: Math.max(60, Math.min(99, overall - 4)),
          jump: 70,
          physicalContact: 72,
          balance: 85,
          stamina: 82
        },
        skills: ["Double Touch", "First-Time Shot", "Through Passing"],
        lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const validatedCards = Array.from(cardMap.values());
    if (validatedCards.length < 20) {
      const dataFilePath2 = import_path.default.join(process.cwd(), "data", "playerCards.json");
      if (import_fs.default.existsSync(dataFilePath2)) {
        const existingData = JSON.parse(import_fs.default.readFileSync(dataFilePath2, "utf-8"));
        if (Array.isArray(existingData) && existingData.length > 0) {
          res.status(500).json({
            success: false,
            error: "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646\u060C \u062A\u0645 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629."
          });
          return;
        }
      }
      throw new Error("Could not fetch sufficient verified cards from eFHUB");
    }
    const dataDir = import_path.default.join(process.cwd(), "data");
    if (!import_fs.default.existsSync(dataDir)) {
      import_fs.default.mkdirSync(dataDir, { recursive: true });
    }
    const dataFilePath = import_path.default.join(dataDir, "playerCards.json");
    import_fs.default.writeFileSync(dataFilePath, JSON.stringify(validatedCards, null, 2), "utf-8");
    res.json({
      success: true,
      message: "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0628\u0646\u062C\u0627\u062D",
      playersCount: playerIds.size,
      cardsCount: validatedCards.length,
      invalidCount,
      duplicatesCount,
      cards: validatedCards
    });
  } catch (syncError) {
    console.error("Full re-sync failed:", syncError);
    res.status(500).json({
      success: false,
      error: "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646\u060C \u062A\u0645 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629.",
      message: syncError?.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0623\u062B\u0646\u0627\u0621 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A."
    });
  }
});
app.get("/api/players/cards", (_req, res) => {
  try {
    const dataFilePath = import_path.default.join(process.cwd(), "data", "playerCards.json");
    if (import_fs.default.existsSync(dataFilePath)) {
      const data = JSON.parse(import_fs.default.readFileSync(dataFilePath, "utf-8"));
      res.json({ success: true, cards: data });
      return;
    }
    res.json({ success: true, cards: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message, cards: [] });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
