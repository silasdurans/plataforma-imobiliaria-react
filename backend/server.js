require("dotenv").config();
/**
 * Servidor Express da aplicação. Inicializa o banco SQLite, normaliza os dados e expõe a API usada pelo frontend.
 */
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";
const dbPath = path.join(__dirname, "properties.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }

  console.log("Connected to SQLite database.");
  // Assim que a conexão abre, garantimos schema e dados mínimos para uso imediato.
  initializeDatabase();
});

app.use(cors());
app.use(express.json());

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
    date: "2026-04-16",
    time: "11:00",
    status: "agendado",
    notes: "Visita criada no seed inicial.",
  },
];

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

const normalizeSchedule = (schedule = {}) => ({
  id: Number(schedule.id || 0),
  propertyTitle: String(schedule.propertyTitle || "").trim(),
  clientName: String(schedule.clientName || "").trim(),
  clientEmail: String(schedule.clientEmail || "").trim().toLowerCase(),
  clientId: schedule.clientId ? String(schedule.clientId) : null,
  date: String(schedule.date || "").trim(),
  time: String(schedule.time || "").trim(),
  status: ["agendado", "confirmado", "cancelado"].includes(schedule.status) ? schedule.status : "agendado",
  notes: schedule.notes ? String(schedule.notes) : "",
  createdAt: schedule.createdAt || new Date().toISOString(),
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
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'agendado',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
        propertyTitle, clientName, clientEmail, clientId, date, time, status, notes, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      normalized.propertyTitle,
      normalized.clientName,
      normalized.clientEmail,
      normalized.clientId,
      normalized.date,
      normalized.time,
      normalized.status,
      normalized.notes,
      normalized.createdAt,
    ],
  );

  return { ...normalized, id: result.lastID };
}

async function findScheduleConflict({ propertyTitle, date, time, excludeId = null }) {
  const query = `
    SELECT * FROM schedules
    WHERE propertyTitle = ?
      AND date = ?
      AND time = ?
      AND status != 'cancelado'
      ${excludeId !== null ? "AND id != ?" : ""}
    LIMIT 1
  `;

  const params = excludeId !== null
    ? [propertyTitle, date, time, excludeId]
    : [propertyTitle, date, time];

  return get(query, params);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
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

    if (!normalized.propertyTitle || !normalized.clientName || !normalized.clientEmail || !normalized.date || !normalized.time) {
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

    const conflict = await findScheduleConflict({
      propertyTitle: normalized.propertyTitle,
      date: normalized.date,
      time: normalized.time,
      excludeId: normalized.id,
    });

    if (conflict) {
      res.status(409).json({ error: "Time slot already booked for this property" });
      return;
    }

    await run(
      `
        UPDATE schedules
        SET propertyTitle = ?, clientName = ?, clientEmail = ?, clientId = ?, date = ?, time = ?,
            status = ?, notes = ?
        WHERE id = ?
      `,
      [
        normalized.propertyTitle,
        normalized.clientName,
        normalized.clientEmail,
        normalized.clientId,
        normalized.date,
        normalized.time,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
