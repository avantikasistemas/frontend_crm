<!-- src/pages/VisitasOportunidadLista.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Visitas (Oportunidades)</h1>
        <p>Visitas asociadas a oportunidades, vista global.</p>
      </div>
    </header>

    <section class="card">
      <div class="filters">
        <div class="field">
          <label>Búsqueda</label>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por asunto, tipo, oportunidad..."
          />
        </div>
        <div class="field">
          <label>Estado</label>
          <select v-model="filtroEstado">
            <option value="">Todos</option>
            <option v-for="opt in estadosVisita" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Oportunidad</th>
            <th>Asunto</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Cierre real</th>
            <th style="width: 90px;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginadas.length === 0">
            <td colspan="8" class="empty">
              No hay visitas registradas.
            </td>
          </tr>
          <tr v-for="v in paginadas" :key="v.id">
            <td>
              <span class="op-num">{{ v.opNumero || '—' }}</span>
              <span class="op-nombre">{{ v.opNombre || '' }}</span>
            </td>
            <td>{{ v.asunto }}</td>
            <td>{{ v.tipo }}</td>
            <td>{{ v.fecha }}</td>
            <td>{{ v.hora }}</td>
            <td>{{ v.estado }}</td>
            <td>{{ v.fecha_cierre_real ? formatDateTime(v.fecha_cierre_real) : '—' }}</td>
            <td class="actions-cell">
              <button class="btn-mini" type="button" @click="abrirEditar(v)">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPaginas > 1">
        <button type="button" @click="paginaAnterior" :disabled="pagina === 1">
          «
        </button>
        <span>Página {{ pagina }} de {{ totalPaginas }}</span>
        <button
          type="button"
          @click="paginaSiguiente"
          :disabled="pagina === totalPaginas"
        >
          »
        </button>
      </div>
    </section>

    <!-- MODAL EDITAR -->
    <div v-if="showModal" class="modal-backdrop" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Editar visita</h2>
            <p>{{ modalDraft.opNumero }} · {{ modalDraft.opNombre }}</p>
          </div>
          <button class="x" type="button" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Asunto</label>
              <input v-model="modalDraft.asunto" type="text" />
            </div>

            <div class="field">
              <label>Tipo</label>
              <select v-model="modalDraft.tipo">
                <option value="">-- Seleccione --</option>
                <option v-for="opt in tiposVisita" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>

            <div class="field full">
              <label>Objetivo</label>
              <input v-model="modalDraft.objetivo" type="text" />
            </div>

            <div class="field">
              <label>Fecha</label>
              <input v-model="modalDraft.fecha" type="date" />
            </div>

            <div class="field">
              <label>Hora</label>
              <input v-model="modalDraft.hora" type="time" />
            </div>

            <div class="field">
              <label>Estado</label>
              <select v-model="modalDraft.estado">
                <option v-for="opt in estadosVisita" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <p class="hint">
                Al pasar de <b>Abierto</b> a <b>Completado/Aplazado/Cancelado</b>,
                se registra el cierre real automáticamente.
              </p>
            </div>

            <div class="field full">
              <label>Cierre real (automático)</label>
              <input
                type="text"
                :value="modalDraft.fecha_cierre_real ? formatDateTime(modalDraft.fecha_cierre_real) : '—'"
                disabled
              />
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-outline" type="button" @click="cerrarModal">Cancelar</button>
          <button class="btn-primary" type="button" @click="guardarEdicion">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { listVisitasOportunidadGlobal, listOportunidades, upsertVisitaOportunidad } from '../services/store';

const visitas = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 10;

const estadosVisita = ['Abierto', 'Completado', 'Aplazado', 'Cancelado'];

const tiposVisita = [
  'Visita de Prospección',
  'Visita de Seguimiento y Cierre de Negocios',
  'Visita de Ejecución de Proyectos y Contratos',
  'Seguimiento a Cotización por Medios Electrónicos',
  'Llamada de Prospección',
  'Llamada de Seguimiento y Cierre de Negocios',
  'Llamada de Ejecución de Proyectos y Contratos',
  'Visita de seguimiento Postventa',
  'Llamada de seguimiento Postventa',
];

// Modal
const showModal = ref(false);
const modalDraft = ref({});

function cargar() {
  const todasVisitas = listVisitasOportunidadGlobal();
  const ops = listOportunidades();
  const mapOps = new Map();
  ops.forEach((o) => {
    mapOps.set(o.id, {
      numero: o.numero_oportunidad,
      nombre: o.nombre_oportunidad,
    });
  });

  visitas.value = todasVisitas.map((v) => {
    const op = mapOps.get(v.oportunidadId);
    return {
      ...v,
      opNumero: op ? op.numero : null,
      opNombre: op ? op.nombre : null,
    };
  });
}

function abrirEditar(v) {
  modalDraft.value = { ...v }; // copia completa para editar
  showModal.value = true;
}

function cerrarModal() {
  showModal.value = false;
  modalDraft.value = {};
}

function guardarEdicion() {
  if (!modalDraft.value.asunto || !modalDraft.value.tipo || !modalDraft.value.fecha) {
    alert('Asunto, tipo y fecha son obligatorios.');
    return;
  }

  // Guardamos SOLO lo que pertenece al modelo de visita (sin opNumero/opNombre)
  const { opNumero, opNombre, ...toSave } = modalDraft.value;
  upsertVisitaOportunidad({ ...toSave });

  cerrarModal();
  cargar();
}

const filtradas = computed(() => {
  const term = busqueda.value.trim().toLowerCase();
  const estado = filtroEstado.value;

  return visitas.value.filter((v) => {
    let ok = true;

    if (term) {
      const txt =
        (v.asunto || '') +
        ' ' +
        (v.tipo || '') +
        ' ' +
        (v.opNumero || '') +
        ' ' +
        (v.opNombre || '');
      if (!txt.toLowerCase().includes(term)) ok = false;
    }

    if (estado && v.estado !== estado) ok = false;

    return ok;
  });
});

const totalPaginas = computed(() =>
  filtradas.value.length === 0 ? 1 : Math.ceil(filtradas.value.length / pageSize)
);

const paginadas = computed(() => {
  const start = (pagina.value - 1) * pageSize;
  return filtradas.value.slice(start, start + pageSize);
});

function paginaAnterior() {
  if (pagina.value > 1) pagina.value -= 1;
}

function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) pagina.value += 1;
}

function formatDateTime(str) {
  try {
    const d = new Date(str);
    return d.toLocaleString();
  } catch {
    return str;
  }
}

watch([busqueda, filtroEstado], () => {
  pagina.value = 1;
});

onMounted(() => {
  cargar();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  color: #2c425c;
}

.page-header p {
  margin: 0;
  font-size: 12px;
  color: #7a7f8a;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px 14px;
  box-shadow: 0 6px 16px rgba(34, 46, 80, 0.05);
  border: 1px solid #e0e3ec;
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 8px 16px;
  margin-bottom: 8px;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #404858;
  margin-bottom: 3px;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #d3d7e4;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
}

input:focus,
select:focus {
  border-color: #2c425c;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th,
td {
  padding: 6px 8px;
  border-bottom: 1px solid #e3e6f0;
  text-align: left;
}

th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #7a7f8a;
}

tr:hover td {
  background: #f7f8fc;
}

.empty {
  text-align: center;
  color: #7a7f8a;
  padding: 10px 0;
}

.op-num {
  display: block;
  font-weight: 600;
  color: #2c425c;
}
.op-nombre {
  display: block;
  font-size: 11px;
  color: #7a7f8a;
}

.actions-cell {
  text-align: right;
}

.btn-mini {
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid #c6ccd8;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
}
.btn-mini:hover {
  background: #f4f6fb;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.pagination button {
  border-radius: 999px;
  border: 1px solid #c6ccd8;
  background: #ffffff;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 22, 33, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 50;
}

.modal {
  width: min(820px, 100%);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e0e3ec;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 12px 14px;
  background: #f6f7fb;
  border-bottom: 1px solid #e0e3ec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.modal-header h2 {
  margin: 0;
  font-size: 15px;
  color: #2c425c;
}

.modal-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #7a7f8a;
}

.x {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  padding: 6px 10px;
  border-radius: 10px;
}
.x:hover {
  background: rgba(44, 66, 92, 0.08);
}

.modal-body {
  padding: 12px 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.field.full {
  grid-column: span 2;
}

.hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #7a7f8a;
}

.modal-actions {
  padding: 12px 14px;
  border-top: 1px solid #e0e3ec;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  border-radius: 999px;
  padding: 6px 16px;
  border: none;
  background: #2c425c;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
}
.btn-primary:hover { filter: brightness(1.05); }

.btn-outline {
  border-radius: 999px;
  padding: 6px 14px;
  border: 1px solid #2c425c;
  background: transparent;
  color: #2c425c;
  cursor: pointer;
  font-size: 13px;
}
.btn-outline:hover { background: #f4f6fb; }
</style>
