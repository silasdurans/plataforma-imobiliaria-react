require("dotenv").config();
/**
 * Servidor Express da aplicação. Inicializa o banco SQLite, normaliza os dados e expõe a API usada pelo frontend.
 */
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "properties.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }

  console.log("Connected to SQLite database.");
  // Assim que a conexão abre, garantimos schema e dados mínimos para uso imediato.
  initializeDatabase();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

const CLIENT_SESSION_COOKIE = "grupo_sp_client_session";
const ADMIN_SESSION_COOKIE = "grupo_sp_admin_session";
const ADMIN_EMAIL = "admin@saopauloparticipacoes.com.br";
const ADMIN_PASSWORD = "admin123";

const officeImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80",
];

const featureSets = [
  ["Wi-Fi empresarial", "Portaria 24h", "Ar condicionado central", "2 vagas", "Sala de reuniao", "CFTV"],
  ["Internet incluida", "Copa compartilhada", "Recepcao premium", "Elevador", "Gerador", "Estacionamento rotativo"],
  ["Mobiliado", "Iluminacao LED", "Piso em porcelanato", "Banheiro privativo", "Auditorio no edificio", "Controle de acesso"],
  ["Wi-Fi Gigabit", "Sala de reuniao privativa", "Cafe livre", "Ar condicionado split", "3 vagas", "Hall corporativo"],
  ["Recepcao compartilhada", "Seguranca 24h", "Forro modular", "Vista para o mar", "Banheiro no andar", "Estacionamento"],
];

const propertiesSeed = [
  { id: "sl-01", title: "Sala Corporativa Atlante", location: "Ponta d'Areia, Sao Luis - MA", price: 4200, size: 52, capacity: 8, rating: 4.9, lat: -2.4908, lng: -44.2938 },
  { id: "sl-02", title: "Sala Prime Renascenca One", location: "Renascenca, Sao Luis - MA", price: 3900, size: 48, capacity: 7, rating: 4.8, lat: -2.5042, lng: -44.2925 },
  { id: "sl-03", title: "Sala Vista Mar Calhau", location: "Calhau, Sao Luis - MA", price: 4600, size: 58, capacity: 9, rating: 4.8, lat: -2.4862, lng: -44.2859 },
  { id: "sl-04", title: "Sala Boutique Peninsula", location: "Peninsula da Ponta d'Areia, Sao Luis - MA", price: 6100, size: 63, capacity: 10, rating: 4.9, lat: -2.4926, lng: -44.2898 },
  { id: "sl-05", title: "Sala Executiva Sao Marcos", location: "Sao Marcos, Sao Luis - MA", price: 3400, size: 44, capacity: 6, rating: 4.7, lat: -2.4944, lng: -44.2834 },
  { id: "sl-06", title: "Sala Medica Jardim Renascenca", location: "Jardim Renascenca, Sao Luis - MA", price: 3700, size: 46, capacity: 7, rating: 4.8, lat: -2.5005, lng: -44.2891 },
  { id: "sl-07", title: "Sala Empresarial Cohafuma Center", location: "Cohafuma, Sao Luis - MA", price: 3200, size: 40, capacity: 6, rating: 4.7, lat: -2.5171, lng: -44.2647 },
  { id: "sl-08", title: "Sala Heritage Quintas", location: "Quintas do Calhau, Sao Luis - MA", price: 4900, size: 62, capacity: 10, rating: 4.8, lat: -2.4682, lng: -44.2562 },
  { id: "sl-09", title: "Sala Strategic Holandeses", location: "Calhau, Sao Luis - MA", price: 4300, size: 54, capacity: 8, rating: 4.7, lat: -2.4783, lng: -44.2664 },
  { id: "sl-10", title: "Sala Nobile Renascenca II", location: "Renascenca II, Sao Luis - MA", price: 3600, size: 43, capacity: 6, rating: 4.7, lat: -2.5061, lng: -44.2875 },
  { id: "sl-11", title: "Sala Prime Olho d'Agua", location: "Olho d'Agua, Sao Luis - MA", price: 4100, size: 50, capacity: 8, rating: 4.8, lat: -2.4635, lng: -44.2458 },
  { id: "sl-12", title: "Sala Corporate Jaracaty", location: "Jaracaty, Sao Luis - MA", price: 3000, size: 38, capacity: 5, rating: 4.6, lat: -2.5018, lng: -44.2752 },
  { id: "sl-13", title: "Sala Premium Ponta do Farol", location: "Ponta do Farol, Sao Luis - MA", price: 5200, size: 60, capacity: 10, rating: 4.9, lat: -2.4881, lng: -44.2872 },
  { id: "sl-14", title: "Sala Select Sao Francisco", location: "Sao Francisco, Sao Luis - MA", price: 2800, size: 36, capacity: 5, rating: 4.6, lat: -2.5156, lng: -44.2923 },
  { id: "sl-15", title: "Sala Garden Eldorado", location: "Jardim Eldorado, Sao Luis - MA", price: 3350, size: 41, capacity: 6, rating: 4.7, lat: -2.5114, lng: -44.2682 },
  { id: "sl-16", title: "Sala Imperial Calhau Tower", location: "Calhau, Sao Luis - MA", price: 5800, size: 68, capacity: 11, rating: 4.9, lat: -2.4821, lng: -44.2817 },
  { id: "sl-17", title: "Sala Costa Atlantica", location: "Quintas do Calhau, Sao Luis - MA", price: 4700, size: 56, capacity: 9, rating: 4.8, lat: -2.4705, lng: -44.2504 },
  { id: "sl-18", title: "Sala Smart Peninsula Office", location: "Peninsula da Ponta d'Areia, Sao Luis - MA", price: 6400, size: 70, capacity: 12, rating: 5.0, lat: -2.4917, lng: -44.291 },
  { id: "sl-19", title: "Sala Office Center Renascenca", location: "Renascenca, Sao Luis - MA", price: 3550, size: 42, capacity: 6, rating: 4.7, lat: -2.5031, lng: -44.2909 },
  { id: "sl-20", title: "Sala Blue Tower Cohafuma", location: "Cohafuma, Sao Luis - MA", price: 3450, size: 44, capacity: 6, rating: 4.7, lat: -2.5158, lng: -44.2611 },
  { id: "sl-21", title: "Sala Brisa Mar Olho d'Agua", location: "Olho d'Agua, Sao Luis - MA", price: 3950, size: 49, capacity: 7, rating: 4.8, lat: -2.4588, lng: -44.2423 },
  { id: "sl-22", title: "Sala Prime Park Sao Marcos", location: "Sao Marcos, Sao Luis - MA", price: 3650, size: 45, capacity: 6, rating: 4.7, lat: -2.4923, lng: -44.2812 },
];

const defaultProperties = propertiesSeed.map((item, index) => {
  const image = officeImages[index % officeImages.length];
  const secondaryImage = officeImages[(index + 2) % officeImages.length];
  const tertiaryImage = officeImages[(index + 4) % officeImages.length];

  return {
    id: item.id,
    title: item.title,
    description:
      `${item.title} em localizacao nobre de Sao Luis, ideal para operacoes administrativas, atendimento premium e equipes que precisam de presenca corporativa forte. ` +
      `A sala entrega infraestrutura pronta para uso, facil acesso e perfil executivo valorizado na regiao.`,
    price: item.price,
    location: item.location,
    size: item.size,
    capacity: item.capacity,
    rating: item.rating,
    image,
    images: [image, secondaryImage, tertiaryImage],
    features: featureSets[index % featureSets.length],
    lat: item.lat,
    lng: item.lng,
    bedrooms: Math.max(1, Math.round(item.capacity / 4)),
    bathrooms: item.size >= 55 ? 2 : 1,
    area: item.size,
    type: "Sala Comercial",
    status: "disponivel",
  };
});

const defaultSchedules = [
  {
    propertyTitle: "Escritorio Premium no Renascenca",
    clientName: "Ana Clara",
    clientEmail: "ana@email.com",
    clientId: "seed-client-1",
    clientPhone: "(98) 98888-1234",
    date: "2026-04-16",
    time: "11:00",
    status: "agendado",
    notes: "Visita criada no seed inicial.",
  },
];

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const separatorIndex = item.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

const getCookie = (req, name) => parseCookies(req.headers.cookie || "")[name] || null;

const buildCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly !== false) parts.push("HttpOnly");
  parts.push(`Path=${options.path || "/"}`);

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");

  return parts.join("; ");
};

const setSessionCookie = (res, name, value) => {
  res.setHeader(
    "Set-Cookie",
    buildCookie(name, value, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30,
    }),
  );
};

const clearSessionCookie = (res, name) => {
  res.setHeader(
    "Set-Cookie",
    buildCookie(name, "", {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      maxAge: 0,
    }),
  );
};

const normalizeProperty = (property = {}) => {
  // Normaliza dados vindos do banco ou do cliente para manter o contrato da API estável.
  const mainImage = property.image || (Array.isArray(property.images) ? property.images[0] : "") || "";
  const size = Number(property.size ?? property.area ?? 60);
  const capacity = Number(property.capacity ?? Math.max(4, Number(property.bedrooms ?? 2) * 2));
  const bedrooms = Number(property.bedrooms ?? Math.max(1, Math.round(capacity / 2)));
  const bathrooms = Number(property.bathrooms ?? Math.max(1, Math.round(size / 40)));
  const createdAt = property.created_at || new Date().toISOString();

  return {
    id: String(property.id || crypto.randomUUID()),
    title: String(property.title || "").trim(),
    description: String(property.description || "").trim(),
    price: Number(property.price || 0),
    location: String(property.location || "").trim(),
    size,
    capacity,
    rating: Number(property.rating ?? 4.7),
    image: mainImage,
    images:
      Array.isArray(property.images) && property.images.length > 0
        ? property.images
        : mainImage
        ? [mainImage]
        : [],
    features:
      Array.isArray(property.features) && property.features.length > 0
        ? property.features
        : ["Imagem principal cadastrada", "Disponivel para consulta"],
    lat: Number(property.lat ?? -2.5297),
    lng: Number(property.lng ?? -44.3028),
    bedrooms,
    bathrooms,
    area: Number(property.area ?? size),
    type: String(property.type || "Imovel").trim(),
    status: ["disponivel", "vendido", "alugado"].includes(property.status) ? property.status : "disponivel",
    created_at: createdAt,
    updated_at: property.updated_at || createdAt,
  };
};

const normalizeTimeValue = (value) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return "";
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const normalizeSchedule = (schedule = {}) => {
  const isAllDay = Boolean(
    schedule.isAllDay === true ||
    schedule.isAllDay === 1 ||
    schedule.isAllDay === "1" ||
    schedule.time === "dia-inteiro",
  );
  const legacyTime = normalizeTimeValue(schedule.time);
  const startTime = isAllDay
    ? ""
    : normalizeTimeValue(schedule.startTime || schedule.time);
  const endTime = isAllDay
    ? ""
    : normalizeTimeValue(schedule.endTime || "");

  return {
    id: Number(schedule.id || 0),
    propertyTitle: String(schedule.propertyTitle || "").trim(),
    clientName: String(schedule.clientName || "").trim(),
    clientEmail: String(schedule.clientEmail || "").trim().toLowerCase(),
    clientId: schedule.clientId ? String(schedule.clientId) : null,
    clientPhone: schedule.clientPhone ? String(schedule.clientPhone).trim() : "",
    date: String(schedule.date || "").trim(),
    time: isAllDay ? "dia-inteiro" : legacyTime || startTime,
    startTime,
    endTime,
    isAllDay,
    status: ["agendado", "confirmado", "cancelado"].includes(schedule.status) ? schedule.status : "agendado",
    notes: schedule.notes ? String(schedule.notes) : "",
    createdAt: schedule.createdAt || new Date().toISOString(),
  };
};

const normalizeClientUser = (user = {}) => ({
  id: String(user.id || crypto.randomUUID()),
  name: String(user.name || "").trim(),
  email: String(user.email || "").trim().toLowerCase(),
  password: String(user.password || ""),
  phone: user.phone ? String(user.phone).trim() : "",
  bio: user.bio ? String(user.bio).trim() : "",
  location: user.location ? String(user.location).trim() : "São Luís, Maranhão",
  createdAt: user.createdAt || new Date().toISOString(),
});

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });

const safeJsonParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    // Evita falha total quando o JSON armazenado estiver inválido.
    return fallback;
  }
};

const mapPropertyRow = (row) =>
  normalizeProperty({
    ...row,
    images: safeJsonParse(row.images, row.image ? [row.image] : []),
    features: safeJsonParse(row.features, []),
  });

const mapScheduleRow = (row) => normalizeSchedule(row);
const mapClientUserRow = (row) => ({
  id: String(row.id),
  name: row.name || "",
  email: row.email || "",
  phone: row.phone || "",
  bio: row.bio || "",
  location: row.location || "São Luís, Maranhão",
  createdAt: row.createdAt,
});
const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const buildPropertySearchContext = (property) => ({
  id: property.id,
  title: property.title,
  type: property.type,
  price: property.price,
  location: property.location,
  size: property.size,
  capacity: property.capacity,
  features: property.features,
  description: property.description,
});

const summarizeHealthError = (error) => {
  if (!error) {
    return "Ollama indisponivel.";
  }

  if (error.cause?.code === "ECONNREFUSED" || error.code === "ECONNREFUSED") {
    return "Ollama nao respondeu em http://127.0.0.1:11434.";
  }

  return error.message || "Ollama indisponivel.";
};

async function getOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

    if (!response.ok) {
      return {
        available: false,
        provider: "ollama",
        model: OLLAMA_MODEL,
        message: `Ollama respondeu com status ${response.status}.`,
      };
    }

    const payload = await response.json();
    const models = Array.isArray(payload?.models) ? payload.models : [];
    const installed = models.some((item) => item?.name === OLLAMA_MODEL);

    return {
      available: installed,
      provider: "ollama",
      model: OLLAMA_MODEL,
      message: installed
        ? `Ollama pronto com o modelo ${OLLAMA_MODEL}.`
        : `Ollama esta online, mas o modelo ${OLLAMA_MODEL} ainda nao foi baixado.`,
    };
  } catch (error) {
    return {
      available: false,
      provider: "ollama",
      model: OLLAMA_MODEL,
      message: summarizeHealthError(error),
    };
  }
}

const applyAIPropertySelection = (properties, selection) => {
  const propertyMap = new Map(properties.map((property) => [property.id, property]));
  const selectedIds = Array.isArray(selection?.property_ids)
    ? selection.property_ids.filter((id) => propertyMap.has(id))
    : [];

  if (selectedIds.length > 0) {
    return selectedIds;
  }

  const normalizedKeywords = Array.isArray(selection?.keywords)
    ? selection.keywords.map((keyword) => normalizeText(keyword)).filter(Boolean)
    : [];

  if (normalizedKeywords.length === 0) {
    return properties.slice(0, 8).map((property) => property.id);
  }

  return properties
    .map((property) => {
      const searchableText = normalizeText(
        [
          property.title,
          property.type,
          property.location,
          property.description,
          property.features.join(" "),
        ].join(" "),
      );

      const score = normalizedKeywords.reduce(
        (total, keyword) => total + (searchableText.includes(keyword) ? 1 : 0),
        0,
      );

      return { id: property.id, score };
    })
    .filter((property) => property.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 8)
    .map((property) => property.id);
};

const buildFallbackMatchReasons = (properties, selection) => {
  const byId = new Map();
  const labels = Array.isArray(selection?.labels) ? selection.labels : [];

  properties.forEach((property) => {
    const searchableText = normalizeText(
      [property.title, property.location, property.description, property.features.join(" ")].join(" "),
    );

    const reasons = labels.filter((label) => searchableText.includes(normalizeText(label))).slice(0, 3);
    byId.set(property.id, reasons);
  });

  return byId;
};

const extractJsonObject = (value = "") => {
  const trimmed = String(value).trim();
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  const content = fencedMatch ? fencedMatch[1].trim() : trimmed;
  const firstBraceIndex = content.indexOf("{");
  const lastBraceIndex = content.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    throw new Error("Ollama response did not contain valid JSON");
  }

  return content.slice(firstBraceIndex, lastBraceIndex + 1);
};

async function runOllamaSearch(query, properties) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        {
          role: "system",
          content:
            "Voce interpreta buscas de imoveis comerciais em portugues do Brasil. " +
            "Analise a frase do usuario e devolva apenas JSON valido, sem markdown e sem texto adicional. " +
            'Formato esperado: {"summary":"string","labels":["string"],"keywords":["string"],"property_ids":["string"],"match_reasons":[{"property_id":"string","reasons":["string"]}]}. ' +
            "Nao invente ids. Use somente ids presentes na lista de imoveis recebida. " +
            "Mantenha labels curtas e legiveis. " +
            "Em match_reasons, explique em ate 3 motivos curtos por imovel, como bairro, faixa de preco, capacidade ou comodidade.",
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            properties: properties.map(buildPropertySearchContext),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.message?.content || "";
  const parsed = JSON.parse(extractJsonObject(content));
  const propertyIds = applyAIPropertySelection(properties, parsed);
  const fallbackReasons = buildFallbackMatchReasons(properties, parsed);
  const matchReasons = Array.isArray(parsed.match_reasons)
    ? parsed.match_reasons
        .filter((item) => typeof item?.property_id === "string")
        .map((item) => ({
          propertyId: item.property_id,
          reasons: Array.isArray(item.reasons)
            ? item.reasons.filter((reason) => typeof reason === "string").slice(0, 3)
            : [],
        }))
    : [];

  return {
    provider: "ollama",
    model: OLLAMA_MODEL,
    labels: Array.isArray(parsed.labels) ? parsed.labels.slice(0, 6) : [],
    propertyIds,
    matchReasons: propertyIds.map((propertyId) => {
      const explicitReasons = matchReasons.find((item) => item.propertyId === propertyId)?.reasons ?? [];

      return {
        propertyId,
        reasons: explicitReasons.length ? explicitReasons : fallbackReasons.get(propertyId) ?? [],
      };
    }),
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Busca interpretada com IA.",
  };
}

async function insertClientUser(user) {
  const normalized = normalizeClientUser(user);

  await run(
    `
      INSERT INTO client_users (id, name, email, password, phone, bio, location, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      normalized.id,
      normalized.name,
      normalized.email,
      normalized.password,
      normalized.phone,
      normalized.bio,
      normalized.location,
      normalized.createdAt,
    ],
  );

  return normalized;
}

async function createClientSession(clientId) {
  const token = crypto.randomUUID();
  await run(
    `
      INSERT INTO client_sessions (token, clientId, createdAt)
      VALUES (?, ?, ?)
    `,
    [token, clientId, new Date().toISOString()],
  );
  return token;
}

async function destroyClientSession(token) {
  if (!token) {
    return;
  }

  await run("DELETE FROM client_sessions WHERE token = ?", [token]);
}

async function getClientUserFromRequest(req) {
  const token = getCookie(req, CLIENT_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  const row = await get(
    `
      SELECT client_users.*
      FROM client_sessions
      JOIN client_users ON client_users.id = client_sessions.clientId
      WHERE client_sessions.token = ?
      LIMIT 1
    `,
    [token],
  );

  return row ? mapClientUserRow(row) : null;
}

async function createAdminSession() {
  const token = crypto.randomUUID();
  await run("INSERT INTO admin_sessions (token, createdAt) VALUES (?, ?)", [
    token,
    new Date().toISOString(),
  ]);
  return token;
}

async function destroyAdminSession(token) {
  if (!token) {
    return;
  }

  await run("DELETE FROM admin_sessions WHERE token = ?", [token]);
}

async function isAdminAuthenticated(req) {
  const token = getCookie(req, ADMIN_SESSION_COOKIE);

  if (!token) {
    return false;
  }

  const row = await get("SELECT token FROM admin_sessions WHERE token = ? LIMIT 1", [token]);
  return !!row;
}

async function initializeDatabase() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS properties_v2 (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        location TEXT NOT NULL,
        size REAL DEFAULT 60,
        capacity INTEGER DEFAULT 4,
        rating REAL DEFAULT 4.7,
        image TEXT,
        images TEXT,
        features TEXT,
        lat REAL DEFAULT -2.5297,
        lng REAL DEFAULT -44.3028,
        bedrooms INTEGER DEFAULT 1,
        bathrooms INTEGER DEFAULT 1,
        area REAL DEFAULT 60,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'disponivel',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        propertyTitle TEXT NOT NULL,
        clientName TEXT NOT NULL,
        clientEmail TEXT NOT NULL,
        clientId TEXT,
        clientPhone TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        startTime TEXT,
        endTime TEXT,
        isAllDay INTEGER DEFAULT 0,
        status TEXT DEFAULT 'agendado',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS client_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        bio TEXT,
        location TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS client_sessions (
        token TEXT PRIMARY KEY,
        clientId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS client_favorites (
        clientId TEXT NOT NULL,
        propertyId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (clientId, propertyId)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureSchedulesSchema();

    const propertyCount = await get("SELECT COUNT(*) as count FROM properties_v2");
    if (!propertyCount || propertyCount.count === 0) {
      await migrateLegacyProperties();
    }

    await ensureDefaultProperties();

    const scheduleCount = await get("SELECT COUNT(*) as count FROM schedules");
    if (!scheduleCount || scheduleCount.count === 0) {
      for (const schedule of defaultSchedules) {
        await insertSchedule(schedule);
      }
    }

    console.log("Database initialized.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

async function ensureDefaultProperties() {
  const currentRows = await all("SELECT id FROM properties_v2");
  const currentIds = new Set(currentRows.map((row) => String(row.id)));

  for (const property of defaultProperties) {
    if (!currentIds.has(property.id)) {
      await insertProperty(property);
    }
  }
}

async function migrateLegacyProperties() {
  let legacyRows = [];

  try {
    legacyRows = await all("SELECT * FROM properties");
  } catch {
    legacyRows = [];
  }

  const sourceRows =
    legacyRows.length > 0
      ? legacyRows.map((row) =>
          normalizeProperty({
            id: row.id ? String(row.id) : crypto.randomUUID(),
            title: row.title,
            description: row.description,
            price: row.price,
            location: row.location,
            size: row.area,
            capacity: row.bedrooms ? row.bedrooms * 2 : 4,
            image: safeJsonParse(row.images, [])[0] || "",
            images: safeJsonParse(row.images, []),
            features: ["Migrado do banco legado"],
            lat: -2.5297,
            lng: -44.3028,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            area: row.area,
            type: row.type || "Imovel",
            status: row.status || "disponivel",
            created_at: row.created_at,
            updated_at: row.updated_at,
          }),
        )
      : defaultProperties.map((property) => normalizeProperty(property));

  for (const property of sourceRows) {
    await insertProperty(property);
  }
}

async function insertProperty(property) {
  const normalized = normalizeProperty(property);
  await run(
    `
      INSERT INTO properties_v2 (
        id, title, description, price, location, size, capacity, rating, image, images, features,
        lat, lng, bedrooms, bathrooms, area, type, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      normalized.id,
      normalized.title,
      normalized.description,
      normalized.price,
      normalized.location,
      normalized.size,
      normalized.capacity,
      normalized.rating,
      normalized.image,
      JSON.stringify(normalized.images),
      JSON.stringify(normalized.features),
      normalized.lat,
      normalized.lng,
      normalized.bedrooms,
      normalized.bathrooms,
      normalized.area,
      normalized.type,
      normalized.status,
      normalized.created_at,
      normalized.updated_at,
    ],
  );

  return normalized;
}

async function insertSchedule(schedule) {
  const normalized = normalizeSchedule(schedule);
  const result = await run(
    `
      INSERT INTO schedules (
        propertyTitle, clientName, clientEmail, clientId, clientPhone, date, time, startTime, endTime, isAllDay, status, notes, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      normalized.propertyTitle,
      normalized.clientName,
      normalized.clientEmail,
      normalized.clientId,
      normalized.clientPhone,
      normalized.date,
      normalized.time,
      normalized.startTime,
      normalized.endTime,
      normalized.isAllDay ? 1 : 0,
      normalized.status,
      normalized.notes,
      normalized.createdAt,
    ],
  );

  return { ...normalized, id: result.lastID };
}

const timeToMinutes = (value) => {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
};

const schedulesOverlap = (first, second) => {
  if (first.date !== second.date || first.propertyTitle !== second.propertyTitle) {
    return false;
  }

  if (first.status === "cancelado" || second.status === "cancelado") {
    return false;
  }

  if (first.isAllDay || second.isAllDay) {
    return true;
  }

  const firstStart = timeToMinutes(first.startTime || first.time);
  const firstEnd = timeToMinutes(first.endTime || first.time);
  const secondStart = timeToMinutes(second.startTime || second.time);
  const secondEnd = timeToMinutes(second.endTime || second.time);

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null ||
    firstStart >= firstEnd ||
    secondStart >= secondEnd
  ) {
    return (first.startTime || first.time) === (second.startTime || second.time);
  }

  return firstStart < secondEnd && secondStart < firstEnd;
};

async function findScheduleConflict(schedule, excludeId = null) {
  const rows = await all(
    `
      SELECT *
      FROM schedules
      WHERE propertyTitle = ?
        AND date = ?
        AND status != 'cancelado'
        ${excludeId !== null ? "AND id != ?" : ""}
    `,
    excludeId !== null
      ? [schedule.propertyTitle, schedule.date, excludeId]
      : [schedule.propertyTitle, schedule.date],
  );

  const normalizedTarget = normalizeSchedule(schedule);
  return rows.map(mapScheduleRow).find((row) => schedulesOverlap(normalizedTarget, row)) || null;
}

async function ensureSchedulesSchema() {
  const columns = await all("PRAGMA table_info(schedules)");
  const columnNames = new Set(columns.map((column) => String(column.name)));

  if (!columnNames.has("clientPhone")) {
    await run("ALTER TABLE schedules ADD COLUMN clientPhone TEXT");
  }
  if (!columnNames.has("startTime")) {
    await run("ALTER TABLE schedules ADD COLUMN startTime TEXT");
  }
  if (!columnNames.has("endTime")) {
    await run("ALTER TABLE schedules ADD COLUMN endTime TEXT");
  }
  if (!columnNames.has("isAllDay")) {
    await run("ALTER TABLE schedules ADD COLUMN isAllDay INTEGER DEFAULT 0");
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/internal/db-inspector-7f3a9c", async (_req, res) => {
  try {
    const tables = await all(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name ASC
      `,
    );

    const payload = await Promise.all(
      tables.map(async ({ name }) => {
        const columns = await all(`PRAGMA table_info(${name})`);
        const countRow = await get(`SELECT COUNT(*) as count FROM ${name}`);
        const preview = await all(`SELECT * FROM ${name} LIMIT 10`);

        return {
          name,
          columns: columns.map((column) => ({
            name: column.name,
            type: column.type,
            nullable: column.notnull === 0,
            primaryKey: column.pk === 1,
          })),
          rowCount: Number(countRow?.count || 0),
          preview,
        };
      }),
    );

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/client/session", async (req, res) => {
  try {
    const user = await getClientUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Client session not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/client/register", async (req, res) => {
  try {
    const normalized = normalizeClientUser(req.body);

    if (!normalized.name || !normalized.email || !normalized.password || !normalized.phone) {
      res.status(400).json({ error: "Missing required client fields" });
      return;
    }

    if (normalized.password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await get("SELECT id FROM client_users WHERE email = ? LIMIT 1", [normalized.email]);
    if (existing) {
      res.status(409).json({ error: "Client already registered with this email" });
      return;
    }

    await insertClientUser(normalized);
    const sessionToken = await createClientSession(normalized.id);
    setSessionCookie(res, CLIENT_SESSION_COOKIE, sessionToken);
    res.status(201).json(mapClientUserRow(normalized));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/client/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const row = await get("SELECT * FROM client_users WHERE email = ? AND password = ? LIMIT 1", [
      email,
      password,
    ]);

    if (!row) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const sessionToken = await createClientSession(String(row.id));
    setSessionCookie(res, CLIENT_SESSION_COOKIE, sessionToken);
    res.json(mapClientUserRow(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/client/logout", async (req, res) => {
  try {
    await destroyClientSession(getCookie(req, CLIENT_SESSION_COOKIE));
    clearSessionCookie(res, CLIENT_SESSION_COOKIE);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/client/profile", async (req, res) => {
  try {
    const currentUser = await getClientUserFromRequest(req);

    if (!currentUser) {
      res.status(401).json({ error: "Client session not found" });
      return;
    }

    const existingUser = await get("SELECT * FROM client_users WHERE id = ? LIMIT 1", [currentUser.id]);
    const normalized = normalizeClientUser({
      ...existingUser,
      ...req.body,
      id: currentUser.id,
      password: existingUser?.password || "",
      createdAt: currentUser.createdAt,
    });

    const emailInUse = await get(
      "SELECT id FROM client_users WHERE email = ? AND id != ? LIMIT 1",
      [normalized.email, currentUser.id],
    );

    if (emailInUse) {
      res.status(409).json({ error: "Another client already uses this email" });
      return;
    }

    await run(
      `
        UPDATE client_users
        SET name = ?, email = ?, phone = ?, bio = ?, location = ?
        WHERE id = ?
      `,
      [
        normalized.name,
        normalized.email,
        normalized.phone,
        normalized.bio,
        normalized.location,
        currentUser.id,
      ],
    );

    const updatedUser = await get("SELECT * FROM client_users WHERE id = ? LIMIT 1", [currentUser.id]);
    res.json(mapClientUserRow(updatedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/client/favorites", async (req, res) => {
  try {
    const currentUser = await getClientUserFromRequest(req);

    if (!currentUser) {
      res.status(401).json({ error: "Client session not found" });
      return;
    }

    const rows = await all(
      "SELECT propertyId FROM client_favorites WHERE clientId = ? ORDER BY datetime(createdAt) DESC",
      [currentUser.id],
    );

    res.json(rows.map((row) => String(row.propertyId)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/client/favorites/:propertyId", async (req, res) => {
  try {
    const currentUser = await getClientUserFromRequest(req);

    if (!currentUser) {
      res.status(401).json({ error: "Client session not found" });
      return;
    }

    const propertyId = String(req.params.propertyId || "").trim();
    const existing = await get(
      "SELECT propertyId FROM client_favorites WHERE clientId = ? AND propertyId = ? LIMIT 1",
      [currentUser.id, propertyId],
    );

    if (existing) {
      await run("DELETE FROM client_favorites WHERE clientId = ? AND propertyId = ?", [
        currentUser.id,
        propertyId,
      ]);
      res.json({ favorite: false });
      return;
    }

    await run(
      "INSERT INTO client_favorites (clientId, propertyId, createdAt) VALUES (?, ?, ?)",
      [currentUser.id, propertyId, new Date().toISOString()],
    );
    res.json({ favorite: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/client/favorites/:propertyId", async (req, res) => {
  try {
    const currentUser = await getClientUserFromRequest(req);

    if (!currentUser) {
      res.status(401).json({ error: "Client session not found" });
      return;
    }

    await run("DELETE FROM client_favorites WHERE clientId = ? AND propertyId = ?", [
      currentUser.id,
      String(req.params.propertyId || "").trim(),
    ]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/session", async (req, res) => {
  try {
    res.json({ authenticated: await isAdminAuthenticated(req) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }

    const token = await createAdminSession();
    setSessionCookie(res, ADMIN_SESSION_COOKIE, token);
    res.json({ authenticated: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/logout", async (req, res) => {
  try {
    await destroyAdminSession(getCookie(req, ADMIN_SESSION_COOKIE));
    clearSessionCookie(res, ADMIN_SESSION_COOKIE);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health/ai", async (_req, res) => {
  const status = await getOllamaStatus();
  res.status(status.available ? 200 : 503).json(status);
});

app.post("/api/ai-search", async (req, res) => {
  try {
    const query = String(req.body?.query || "").trim();

    if (!query) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const ollamaStatus = await getOllamaStatus();
    if (!ollamaStatus.available) {
      res.status(503).json({ error: ollamaStatus.message });
      return;
    }

    const rows = await all("SELECT * FROM properties_v2 ORDER BY datetime(created_at) DESC, title ASC");
    const properties = rows.map(mapPropertyRow);
    const result = await runOllamaSearch(query, properties);

    res.json(result);
  } catch (error) {
    console.error("AI search failed:", error.message);
    res.status(503).json({ error: "AI search unavailable" });
  }
});

app.get("/api/properties", async (_req, res) => {
  try {
    const rows = await all("SELECT * FROM properties_v2 ORDER BY datetime(created_at) DESC, title ASC");
    res.json(rows.map(mapPropertyRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
    const row = await get("SELECT * FROM properties_v2 WHERE id = ?", [req.params.id]);

    if (!row) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.json(mapPropertyRow(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/properties", async (req, res) => {
  try {
    const normalized = normalizeProperty(req.body);

    if (!normalized.title || !normalized.location || normalized.price <= 0) {
      res.status(400).json({ error: "Title, price and location are required" });
      return;
    }

    await insertProperty(normalized);
    res.status(201).json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const existing = await get("SELECT * FROM properties_v2 WHERE id = ?", [req.params.id]);

    if (!existing) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const normalized = normalizeProperty({
      ...mapPropertyRow(existing),
      ...req.body,
      id: req.params.id,
      updated_at: new Date().toISOString(),
    });

    await run(
      `
        UPDATE properties_v2
        SET title = ?, description = ?, price = ?, location = ?, size = ?, capacity = ?, rating = ?, image = ?,
            images = ?, features = ?, lat = ?, lng = ?, bedrooms = ?, bathrooms = ?, area = ?, type = ?,
            status = ?, updated_at = ?
        WHERE id = ?
      `,
      [
        normalized.title,
        normalized.description,
        normalized.price,
        normalized.location,
        normalized.size,
        normalized.capacity,
        normalized.rating,
        normalized.image,
        JSON.stringify(normalized.images),
        JSON.stringify(normalized.features),
        normalized.lat,
        normalized.lng,
        normalized.bedrooms,
        normalized.bathrooms,
        normalized.area,
        normalized.type,
        normalized.status,
        normalized.updated_at,
        normalized.id,
      ],
    );

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const result = await run("DELETE FROM properties_v2 WHERE id = ?", [req.params.id]);

    if (result.changes === 0) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/schedules", async (_req, res) => {
  try {
    const rows = await all("SELECT * FROM schedules ORDER BY datetime(createdAt) DESC, id DESC");
    res.json(rows.map(mapScheduleRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/schedules", async (req, res) => {
  try {
    const normalized = normalizeSchedule(req.body);

    const hasValidPeriod =
      normalized.isAllDay ||
      (normalized.startTime &&
        normalized.endTime &&
        timeToMinutes(normalized.startTime) !== null &&
        timeToMinutes(normalized.endTime) !== null &&
        timeToMinutes(normalized.startTime) < timeToMinutes(normalized.endTime));

    if (
      !normalized.propertyTitle ||
      !normalized.clientName ||
      !normalized.clientEmail ||
      !normalized.date ||
      !hasValidPeriod
    ) {
      res.status(400).json({ error: "Missing required schedule fields" });
      return;
    }

    const conflict = await findScheduleConflict(normalized);
    if (conflict) {
      res.status(409).json({ error: "Time slot already booked for this property" });
      return;
    }

    const created = await insertSchedule(normalized);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/schedules/:id", async (req, res) => {
  try {
    const existing = await get("SELECT * FROM schedules WHERE id = ?", [req.params.id]);

    if (!existing) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const normalized = normalizeSchedule({
      ...mapScheduleRow(existing),
      ...req.body,
      id: Number(req.params.id),
    });

    const hasValidPeriod =
      normalized.isAllDay ||
      (normalized.startTime &&
        normalized.endTime &&
        timeToMinutes(normalized.startTime) !== null &&
        timeToMinutes(normalized.endTime) !== null &&
        timeToMinutes(normalized.startTime) < timeToMinutes(normalized.endTime));

    if (
      !normalized.propertyTitle ||
      !normalized.clientName ||
      !normalized.clientEmail ||
      !normalized.date ||
      !hasValidPeriod
    ) {
      res.status(400).json({ error: "Missing required schedule fields" });
      return;
    }

    const conflict = await findScheduleConflict(normalized, normalized.id);

    if (conflict) {
      res.status(409).json({ error: "Time slot already booked for this property" });
      return;
    }

    await run(
      `
        UPDATE schedules
        SET propertyTitle = ?, clientName = ?, clientEmail = ?, clientId = ?, clientPhone = ?, date = ?, time = ?,
            startTime = ?, endTime = ?, isAllDay = ?, status = ?, notes = ?
        WHERE id = ?
      `,
      [
        normalized.propertyTitle,
        normalized.clientName,
        normalized.clientEmail,
        normalized.clientId,
        normalized.clientPhone,
        normalized.date,
        normalized.time,
        normalized.startTime,
        normalized.endTime,
        normalized.isAllDay ? 1 : 0,
        normalized.status,
        normalized.notes,
        normalized.id,
      ],
    );

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const result = await run("DELETE FROM schedules WHERE id = ?", [req.params.id]);

    if (result.changes === 0) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const frontendDistPath = path.join(__dirname, "..", "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});
