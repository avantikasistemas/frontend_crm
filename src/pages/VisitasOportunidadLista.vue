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
            <option v-for="opt in estadosVisita" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
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
            <th>Contacto</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Cierre real</th>
            <th style="width: 90px;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginadas.length === 0">
            <td colspan="9" class="empty">
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
            <td>{{ v.contacto || '-' }}</td>
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
              <input v-model="modalDraft.asunto" type="text" :disabled="esCompletada" />
            </div>

            <div class="field">
              <label>Tipo</label>
              <select v-model="modalDraft.tipo_id" :disabled="esCompletada">
                <option value="">-- Seleccione --</option>
                <option v-for="opt in tiposVisita" :key="opt.id" :value="opt.id">
                  {{ opt.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Contacto</label>
              <input v-model="modalDraft.contacto" type="text" :disabled="esCompletada" />
            </div>

            <div class="field full">
              <label>Objetivo</label>
              <input v-model="modalDraft.objetivo" type="text" :disabled="esCompletada" />
            </div>

            <div class="field">
              <label>Fecha</label>
              <input v-model="modalDraft.fecha" type="date" :disabled="esCompletada" />
            </div>

            <div class="field">
              <label>Hora</label>
              <input v-model="modalDraft.hora" type="time" :disabled="esCompletada" />
            </div>

            <div class="field">
              <label>Estado</label>
              <select v-model="modalDraft.estado_id" :disabled="esCompletada">
                <option v-for="opt in estadosVisita" :key="opt.id" :value="opt.id">
                  {{ opt.nombre }}
                </option>
              </select>
              <p class="hint" v-if="!esCompletada">
                Al pasar de <b>Abierto</b> a <b>Completado/Aplazado/Cancelado</b>,
                se registra el cierre real automáticamente.
              </p>
              <p class="hint" v-else style="color: #d97706;">
                <b>Esta visita está completada y no puede ser modificada.</b>
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
          <button class="btn-outline" type="button" @click="cerrarModal">{{ esCompletada ? 'Cerrar' : 'Cancelar' }}</button>
          <button v-if="!esCompletada" class="btn-primary" type="button" @click="guardarEdicion">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import apiUrl from '../../config.js';

const visitas = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 30;
const totalRegistros = ref(0);
const totalPaginas = ref(1);
const cargando = ref(false);

const estadosVisita = [
  { id: 1, nombre: 'Abierto' },
  { id: 2, nombre: 'Completado' },
  { id: 3, nombre: 'Aplazado' },
  { id: 4, nombre: 'Cancelado' }
];

const tiposVisita = [
  { id: 1, nombre: 'Visita de Prospección' },
  { id: 2, nombre: 'Visita de Seguimiento y Cierre de Negocios' },
  { id: 3, nombre: 'Visita de Ejecución de Proyectos y Contratos' },
  { id: 4, nombre: 'Seguimiento a Cotización por Medios Electrónicos' },
  { id: 5, nombre: 'Llamada de Prospección' },
  { id: 6, nombre: 'Llamada de Seguimiento y Cierre de Negocios' },
  { id: 7, nombre: 'Llamada de Ejecución de Proyectos y Contratos' },
  { id: 8, nombre: 'Visita de seguimiento Postventa' },
  { id: 9, nombre: 'Llamada de seguimiento Postventa' }
];

// Modal
const showModal = ref(false);
const modalDraft = ref({});
const estadoOriginal = ref(null); // Estado original de la visita desde BD

// Computed para determinar si la visita está completada y debe ser solo lectura
const esCompletada = computed(() => {
  return estadoOriginal.value === 2; // 2 = Completado
});

async function cargar() {
  cargando.value = true;
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas/listar-global`,
      {
        pagina: pagina.value,
        limite: pageSize,
        busqueda: busqueda.value,
        estado_id: filtroEstado.value !== '' ? parseInt(filtroEstado.value) : null
      },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );

    if (response.data.code === 200) {
      const data = response.data.data;
      visitas.value = data.visitas.map(v => ({
        id: v.id,
        oportunidadId: v.oportunidad_id,
        opNumero: v.op_numero,
        opNombre: v.op_nombre,
        asunto: v.asunto,
        tipo: v.tipo_nombre,
        tipo_id: v.tipo_id,
        fecha: v.fecha_hora ? v.fecha_hora.split('T')[0] : '',
        hora: v.fecha_hora ? v.fecha_hora.split('T')[1]?.substring(0, 5) : '',
        estado: v.estado_nombre,
        estado_id: v.estado_id,
        objetivo: v.objetivo,
        contacto: v.contacto,
        fecha_cierre_real: v.fecha_cierre_real,
        fecha_hora_original: v.fecha_hora
      }));
      totalRegistros.value = data.total;
      totalPaginas.value = data.total_paginas;
    }
  } catch (error) {
    console.error('Error cargando visitas:', error);
  } finally {
    cargando.value = false;
  }
}

function abrirEditar(v) {
  // Guardar el estado original para determinar si está completada
  estadoOriginal.value = v.estado_id;
  
  modalDraft.value = { ...v };
  showModal.value = true;
}

function cerrarModal() {
  showModal.value = false;
  modalDraft.value = {};
  estadoOriginal.value = null;
}

async function guardarEdicion() {
  if (!modalDraft.value.asunto || !modalDraft.value.tipo_id || !modalDraft.value.fecha) {
    alert('Asunto, tipo y fecha son obligatorios.');
    return;
  }

  // Obtener nombres basados en los IDs seleccionados
  const tipoSeleccionado = tiposVisita.find(t => t.id === modalDraft.value.tipo_id);
  const estadoSeleccionado = estadosVisita.find(e => e.id === modalDraft.value.estado_id);

  // Preparar datos para enviar al backend
  const fechaHora = `${modalDraft.value.fecha}T${modalDraft.value.hora || '00:00'}`;
  
  const dataToSave = {
    id: modalDraft.value.id,
    oportunidad_id: modalDraft.value.oportunidadId,
    asunto: modalDraft.value.asunto,
    tipo_id: modalDraft.value.tipo_id,
    tipo_nombre: tipoSeleccionado?.nombre || '',
    objetivo: modalDraft.value.objetivo || '',
    contacto: modalDraft.value.contacto || '',
    fecha_hora: fechaHora,
    estado_id: modalDraft.value.estado_id,
    estado_nombre: estadoSeleccionado?.nombre || ''
  };

  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas/guardar`,
      dataToSave,
      {
        headers: {
          Accept: "application/json",
        }
      }
    );

    if (response.data.code === 200 || response.data.code === 201) {
      cerrarModal();
      cargar();
    } else {
      alert('Error al guardar la visita');
    }
  } catch (error) {
    console.error('Error guardando visita:', error);
    alert('Error al guardar la visita');
  }
}

const paginadas = computed(() => visitas.value);

function paginaAnterior() {
  if (pagina.value > 1) {
    pagina.value -= 1;
  }
}

function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) {
    pagina.value += 1;
  }
}

function formatDateTime(str) {
  try {
    const d = new Date(str);
    return d.toLocaleString();
  } catch {
    return str;
  }
}

watch([pagina], () => {
  cargar();
});

watch([busqueda, filtroEstado], () => {
  pagina.value = 1;
  cargar();
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
