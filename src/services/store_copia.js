// src/services/store.js

const LS_KEYS = {
  oportunidades: 'crm_avk_oportunidades',
  visitasOportunidad: 'crm_avk_visitas_oportunidad',
  visitasClientes: 'crm_avk_visitas_clientes',
  consecutivoOportunidad: 'crm_avk_consecutivo_oportunidad',
};

function load(key, defaultValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function save(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nextConsecutivo() {
  let actual = load(LS_KEYS.consecutivoOportunidad, 10991); // arranco cerca al ejemplo 0010992
  actual += 1;
  save(LS_KEYS.consecutivoOportunidad, actual);
  return actual;
}

// ===== OPORTUNIDADES =====

export function listOportunidades() {
  const ops = load(LS_KEYS.oportunidades, []);
  // ordenar por fecha de actualización descendente
  return ops.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));
}

export function getOportunidad(id) {
  const ops = listOportunidades();
  return ops.find((o) => o.id === id) || null;
}

export function createOportunidad(data) {
  const ops = listOportunidades();
  const consecutivo = nextConsecutivo();
  const numero = `OP#${String(consecutivo).padStart(7, '0')}`;
  const now = new Date().toISOString();

  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());

  const nueva = {
    ...data,
    id,
    numero_oportunidad: numero,
    created_at: now,
    updated_at: now,
  };

  ops.push(nueva);
  save(LS_KEYS.oportunidades, ops);
  return nueva;
}

export function updateOportunidad(id, data) {
  const ops = listOportunidades();
  const idx = ops.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const updated = {
    ...ops[idx],
    ...data,
    updated_at: now,
  };

  ops[idx] = updated;
  save(LS_KEYS.oportunidades, ops);
  return updated;
}

export function upsertOportunidad(data) {
  if (data.id) {
    return updateOportunidad(data.id, data);
  }
  return createOportunidad(data);
}

// ===== VISITAS ASOCIADAS A OPORTUNIDADES =====

const ESTADOS_CIERRE_VISITA = ['Completado', 'Aplazado', 'Cancelado'];

export function listVisitasOportunidad(oportunidadId) {
  const visitas = load(LS_KEYS.visitasOportunidad, []);
  return visitas
    .filter((v) => v.oportunidadId === oportunidadId)
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

export function listVisitasOportunidadGlobal() {
  const visitas = load(LS_KEYS.visitasOportunidad, []);
  return visitas.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

export function upsertVisitaOportunidad(visita) {
  const visitas = load(LS_KEYS.visitasOportunidad, []);
  let now = new Date().toISOString();

  if (!visita.id) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    visita.id = id;
    visita.created_at = now;
  }

  const idx = visitas.findIndex((v) => v.id === visita.id);
  const existente = idx !== -1 ? visitas[idx] : null;

  // lógica de fecha_cierre_real
  if (
    ESTADOS_CIERRE_VISITA.includes(visita.estado) &&
    (!existente || !existente.fecha_cierre_real)
  ) {
    visita.fecha_cierre_real = now;
  } else if (!ESTADOS_CIERRE_VISITA.includes(visita.estado)) {
    visita.fecha_cierre_real = null;
  }

  visita.updated_at = now;

  if (idx === -1) {
    visitas.push(visita);
  } else {
    visitas[idx] = { ...existente, ...visita };
  }

  save(LS_KEYS.visitasOportunidad, visitas);
  return visita;
}

// ===== VISITAS CLIENTES =====

export function listVisitasCliente() {
  const visitas = load(LS_KEYS.visitasClientes, []);
  return visitas.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

export function upsertVisitaCliente(visita) {
  const visitas = load(LS_KEYS.visitasClientes, []);
  let now = new Date().toISOString();

  if (!visita.id) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    visita.id = id;
    visita.created_at = now;
  }

  const idx = visitas.findIndex((v) => v.id === visita.id);
  const existente = idx !== -1 ? visitas[idx] : null;

  if (
    ESTADOS_CIERRE_VISITA.includes(visita.estado) &&
    (!existente || !existente.fecha_cierre_real)
  ) {
    visita.fecha_cierre_real = now;
  } else if (!ESTADOS_CIERRE_VISITA.includes(visita.estado)) {
    visita.fecha_cierre_real = null;
  }

  visita.updated_at = now;

  if (idx === -1) {
    visitas.push(visita);
  } else {
    visitas[idx] = { ...existente, ...visita };
  }

  save(LS_KEYS.visitasClientes, visitas);
  return visita;
}
