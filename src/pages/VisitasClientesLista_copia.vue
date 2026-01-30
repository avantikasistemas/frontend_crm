<!-- src/pages/VisitasClientesLista.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Visitas (Clientes)</h1>
        <p>Registro de visitas no asociadas a oportunidad.</p>
      </div>
    </header>

    <section class="card form-card">
      <h2>Nueva visita a cliente</h2>
      <div class="form-grid">
        <div class="field">
          <label>Cliente</label>
          <input v-model="draft.cliente_nombre" type="text" />
        </div>

        <div class="field">
          <label>Asunto</label>
          <input v-model="draft.asunto" type="text" />
        </div>

        <div class="field">
          <label>Tipo</label>
          <select v-model="draft.tipo">
            <option value="">-- Seleccione --</option>
            <option v-for="opt in tiposVisita" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Fecha</label>
          <input v-model="draft.fecha" type="date" />
        </div>

        <div class="field">
          <label>Hora</label>
          <input v-model="draft.hora" type="time" />
        </div>

        <div class="field">
          <label>Estado</label>
          <select v-model="draft.estado">
            <option v-for="opt in estadosVisita" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="field full">
          <label>Objetivo</label>
          <input v-model="draft.objetivo" type="text" />
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn-primary" @click="guardarVisita">
          Guardar visita
        </button>
      </div>
    </section>

    <section class="card">
      <div class="filters">
        <div class="field">
          <label>Búsqueda</label>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por cliente, asunto o tipo..."
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
            <th>Cliente</th>
            <th>Asunto</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Cierre real</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginadas.length === 0">
            <td colspan="7" class="empty">No hay visitas registradas.</td>
          </tr>
          <tr v-for="v in paginadas" :key="v.id">
            <td>{{ v.cliente_nombre }}</td>
            <td>{{ v.asunto }}</td>
            <td>{{ v.tipo }}</td>
            <td>{{ v.fecha }}</td>
            <td>{{ v.hora }}</td>
            <td>{{ v.estado }}</td>
            <td>{{ v.fecha_cierre_real ? formatDateTime(v.fecha_cierre_real) : '—' }}</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { listVisitasCliente, upsertVisitaCliente } from '../services/store';

const visitas = ref([]);
const draft = ref(crearDraft());
const busqueda = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 10;

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

const estadosVisita = ['Abierto', 'Completado', 'Aplazado', 'Cancelado'];

function crearDraft() {
  return {
    id: null,
    cliente_nombre: '',
    asunto: '',
    tipo: '',
    objetivo: '',
    fecha: '',
    hora: '',
    estado: 'Abierto',
    fecha_cierre_real: null,
  };
}

function cargar() {
  visitas.value = listVisitasCliente();
}

function guardarVisita() {
  if (!draft.value.cliente_nombre || !draft.value.asunto || !draft.value.fecha) {
    alert('Cliente, asunto y fecha son obligatorios.');
    return;
  }

  upsertVisitaCliente({ ...draft.value });
  draft.value = crearDraft();
  cargar();
}

const filtradas = computed(() => {
  const term = busqueda.value.trim().toLowerCase();
  const estado = filtroEstado.value;

  return visitas.value.filter((v) => {
    let ok = true;

    if (term) {
      const txt =
        (v.cliente_nombre || '') +
        ' ' +
        (v.asunto || '') +
        ' ' +
        (v.tipo || '');
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

.form-card h2 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #2c425c;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
}

.field.full {
  grid-column: span 3;
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

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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

.btn-primary:hover {
  filter: brightness(1.05);
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 8px 16px;
  margin-bottom: 8px;
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
</style>
