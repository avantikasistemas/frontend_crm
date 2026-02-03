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
      <div class="form-head">
        <h2>{{ editando ? 'Editar visita a cliente' : 'Nueva visita a cliente' }}</h2>
        <button v-if="editando" class="btn-outline" type="button" @click="cancelarEdicion">
          Cancelar edición
        </button>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Cliente</label>
          <div class="search-input-wrapper">
            <input 
              v-model="clienteDisplay" 
              type="text" 
              placeholder="Buscar por NIT o nombre..."
              @input="onSearchCliente"
              @focus="showSuggestions = true"
              @blur="onBlurCliente"
              :disabled="esCompletada"
            />
            <div v-if="showSuggestions && filteredTerceros.length > 0" class="suggestions">
              <div 
                v-for="tercero in filteredTerceros" 
                :key="tercero.nit"
                class="suggestion-item"
                @mousedown.prevent="selectTercero(tercero)"
              >
                <div class="suggestion-title">{{ tercero.nombres }}</div>
                <div class="suggestion-subtitle">NIT: {{ tercero.nit }} • {{ tercero.ciudad }} • {{ tercero.ejecutivo }} • {{ tercero.zona }}</div>
              </div>
            </div>
            <div v-if="isSearching" class="loading-indicator">Buscando...</div>
          </div>
        </div>

        <div class="field">
          <label>Asunto</label>
          <input v-model="draft.asunto" type="text" :disabled="esCompletada" />
        </div>

        <div class="field">
          <label>Tipo</label>
          <select v-model="draft.tipo_id" @change="onTipoChange" :disabled="esCompletada">
            <option value="">-- Seleccione --</option>
            <option v-for="opt in tiposVisita" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Contacto</label>
          <div style="display: flex; gap: 8px; align-items: start;">
            <select v-model="draft.contacto" :disabled="esCompletada" style="flex: 1;">
              <option value="">-- Seleccione --</option>
              <option v-for="c in contactos" :key="c.nombre" :value="c.nombre">
                {{ c.nit }} - {{ c.nombre }} - {{ c.tel_celular }}
              </option>
            </select>
            <button 
              v-if="!esCompletada && draft.cliente_nit"
              type="button" 
              class="btn-icon" 
              @click="mostrarFormContacto = !mostrarFormContacto"
              title="Agregar nuevo contacto"
            >
              +
            </button>
          </div>
          <p class="hint" v-if="contactos.length === 0">No hay contactos disponibles</p>
          
          <!-- Formulario inline para crear contacto -->
          <div v-if="mostrarFormContacto" style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 4px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <input 
                v-model="nuevoContacto.nombre" 
                type="text" 
                placeholder="Nombre del contacto"
                style="width: 100%;"
              />
              <input 
                v-model="nuevoContacto.telefono" 
                type="text" 
                placeholder="Teléfono"
                style="width: 100%;"
              />
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button 
                  type="button" 
                  class="btn-outline" 
                  @click="mostrarFormContacto = false; nuevoContacto.nombre = ''; nuevoContacto.telefono = '';"
                  style="font-size: 0.875rem; padding: 6px 12px;"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  class="btn-primary" 
                  @click="guardarNuevoContacto"
                  :disabled="!nuevoContacto.nombre || !nuevoContacto.telefono"
                  style="font-size: 0.875rem; padding: 6px 12px;"
                >
                  Guardar contacto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Fecha y Hora de Visita</label>
          <input v-model="draft.fecha_hora" type="datetime-local" :disabled="esCompletada" />
        </div>

        <div class="field">
          <label>Estado</label>
          <select v-model="draft.estado_id" @change="onEstadoChange" :disabled="esCompletada">
            <option v-for="opt in estadosVisita" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
            </option>
          </select>
          <p class="hint" v-if="!esCompletada">
            Al pasar de <b>Abierto</b> a <b>Completado/Aplazado/Cancelado</b>,
            se guardará automáticamente el cierre real.
          </p>
          <p class="hint" v-else style="color: #d97706;">
            <b>Esta visita está completada y no puede ser modificada.</b>
          </p>
        </div>

        <div class="field full">
          <label>Objetivo</label>
          <input v-model="draft.objetivo" type="text" :disabled="esCompletada" />
        </div>

        <div class="field full">
          <label>Comentarios</label>
          <textarea 
            v-model="draft.comentarios" 
            maxlength="150" 
            rows="3"
            :disabled="esCompletada"
            placeholder="Ingrese comentarios sobre la visita (máximo 150 caracteres)"
          ></textarea>
          <p class="hint" style="text-align: right; margin-top: 4px; font-size: 0.75rem;">
            {{ draft.comentarios?.length || 0 }} / 150
          </p>
        </div>

        <div class="field">
          <label>Resultado</label>
          <select v-model.number="draft.resultado_id" :disabled="esCompletada">
            <option :value="null">-- Seleccione --</option>
            <option v-for="opt in resultadosVisitas" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
            </option>
          </select>
        </div>

        <div class="field full">
          <label>Cierre real (automático)</label>
          <input
            type="text"
            :value="draft.fecha_cierre_real ? formatDateTime(draft.fecha_cierre_real) : '—'"
            disabled
          />
        </div>
      </div>

      <div class="actions">
        <button v-if="!esCompletada" type="button" class="btn-primary" @click="guardarVisita">
          {{ editando ? 'Guardar cambios' : 'Guardar visita' }}
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
            <option v-for="opt in estadosVisita" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
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
            <th>Contacto</th>
            <th>Fecha y Hora</th>
            <th>Estado</th>
            <th>Cierre real</th>
            <th style="width: 90px;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginadas.length === 0">
            <td colspan="8" class="empty">No hay visitas registradas.</td>
          </tr>
          <tr v-for="v in paginadas" :key="v.id">
            <td>{{ v.cliente_nombre }}</td>
            <td>{{ v.asunto }}</td>
            <td>{{ v.tipo }}</td>
            <td>{{ v.contacto || '-' }}</td>
            <td>{{ formatDateTime(v.fecha_hora) }}</td>
            <td>{{ v.estado }}</td>
            <td>{{ v.fecha_cierre_real ? formatDateTime(v.fecha_cierre_real) : '—' }}</td>
            <td class="actions-cell">
              <button class="btn-mini" type="button" @click="editar(v)">Editar</button>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import apiUrl from '../../config.js';
import { useCatalogos } from '../services/useCatalogos.js';

const { catalogos, cargarCatalogos } = useCatalogos();

const visitas = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 30;
const totalRegistros = ref(0);
const totalPaginas = ref(1);
const cargando = ref(false);

const editando = ref(false);
const mostrarFormContacto = ref(false);
const nuevoContacto = ref({
  nombre: '',
  telefono: ''
});
const draft = ref(crearDraft());
const estadoOriginal = ref(null); // Estado original de la visita desde BD

// Computed para determinar si la visita está completada y debe ser solo lectura
const esCompletada = computed(() => {
  return editando.value && estadoOriginal.value === 2; // 2 = Completado
});

// Para búsqueda de terceros/clientes
const terceros = ref([]);
const filteredTerceros = ref([]);
const showSuggestions = ref(false);
const isSearching = ref(false);
const clienteDisplay = ref('');
let searchTimeout = null;

// Para contactos
const contactos = ref([]);

// Computed para resultados de visitas
const resultadosVisitas = computed(() => catalogos.value.resultadosVisitas || []);

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

function crearDraft() {
  return {
    id: null,
    cliente_nit: '',
    cliente_nombre: '',
    asunto: '',
    tipo_id: '',
    tipo_nombre: '',
    contacto: '',
    objetivo: '',
    comentarios: '',
    resultado_id: null,
    fecha_hora: '',
    estado_id: 1,
    estado_nombre: 'Abierto',
    fecha_cierre_real: null,
  };
}

async function cargar() {
  cargando.value = true;
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas-clientes/listar`,
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
        cliente_nit: v.cliente_nit,
        cliente_nombre: v.cliente_nombre,
        asunto: v.asunto,
        tipo: v.tipo_nombre,
        tipo_id: v.tipo_id,
        tipo_nombre: v.tipo_nombre,
        contacto: v.contacto,
        objetivo: v.objetivo,
        comentarios: v.comentarios || '',
        resultado_id: v.resultado_id ? parseInt(v.resultado_id) : null,
        fecha_hora: v.fecha_hora,
        estado: v.estado_nombre,
        estado_id: v.estado_id,
        estado_nombre: v.estado_nombre,
        fecha_cierre_real: v.fecha_cierre_real
      }));
      totalRegistros.value = data.total;
      totalPaginas.value = data.total_paginas;
    }
  } catch (error) {
    console.error('Error cargando visitas de clientes:', error);
  } finally {
    cargando.value = false;
  }
}

function editar(v) {
  draft.value = { ...v };
  estadoOriginal.value = v.estado_id;
  editando.value = true;
  clienteDisplay.value = v.cliente_nombre;
  
  // Cargar contactos del cliente
  if (v.cliente_nit) {
    cargarContactos(v.cliente_nit);
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  draft.value = crearDraft();
  estadoOriginal.value = null;
  editando.value = false;
  clienteDisplay.value = '';
  contactos.value = [];
}

async function guardarVisita() {
  if (!draft.value.cliente_nit || !draft.value.asunto || !draft.value.tipo_id || !draft.value.fecha_hora) {
    alert('Cliente, asunto, tipo y fecha son obligatorios.');
    return;
  }

  // Obtener nombres basados en los IDs
  const tipoSeleccionado = tiposVisita.find(t => t.id === draft.value.tipo_id);
  const estadoSeleccionado = estadosVisita.find(e => e.id === draft.value.estado_id);

  const dataToSave = {
    id: draft.value.id,
    cliente_nit: draft.value.cliente_nit,
    cliente_nombre: draft.value.cliente_nombre,
    asunto: draft.value.asunto,
    tipo_id: draft.value.tipo_id,
    tipo_nombre: tipoSeleccionado?.nombre || '',
    contacto: draft.value.contacto || '',
    objetivo: draft.value.objetivo || '',
    comentarios: draft.value.comentarios || '',
    resultado_id: draft.value.resultado_id ? parseInt(draft.value.resultado_id) : null,
    fecha_hora: draft.value.fecha_hora,
    estado_id: draft.value.estado_id,
    estado_nombre: estadoSeleccionado?.nombre || ''
  };

  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas-clientes/guardar`,
      dataToSave,
      {
        headers: {
          Accept: "application/json",
        }
      }
    );

    if (response.data.code === 200 || response.data.code === 201) {
      cancelarEdicion();
      cargar();
    } else {
      alert('Error al guardar la visita');
    }
  } catch (error) {
    console.error('Error guardando visita de cliente:', error);
    alert('Error al guardar la visita');
  }
}

// Búsqueda de terceros/clientes
async function onSearchCliente() {
  const valor = clienteDisplay.value.trim();
  
  if (valor.length < 2) {
    filteredTerceros.value = [];
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    try {
      const response = await axios.post(
        `${apiUrl}/oportunidades/terceros`,
        { valor },
        {
          headers: {
            Accept: "application/json",
          }
        }
      );

      if (response.data.code === 200) {
        filteredTerceros.value = response.data.data;
      }
    } catch (error) {
      console.error('Error buscando terceros:', error);
    } finally {
      isSearching.value = false;
    }
  }, 300);
}

function selectTercero(tercero) {
  draft.value.cliente_nit = tercero.nit;
  draft.value.cliente_nombre = tercero.nombres;
  clienteDisplay.value = tercero.nombres;
  showSuggestions.value = false;
  filteredTerceros.value = [];
  
  // Cargar contactos del tercero seleccionado
  cargarContactos(tercero.nit);
}

function onBlurCliente() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

// Guardar nuevo contacto
async function guardarNuevoContacto() {
  if (!nuevoContacto.value.nombre || !nuevoContacto.value.telefono) {
    alert('El nombre y teléfono son obligatorios');
    return;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos/guardar`,
      {
        nit: draft.value.cliente_nit,
        nombre: nuevoContacto.value.nombre,
        tel_celular: nuevoContacto.value.telefono
      },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );

    if (response.data.code === 200 || response.data.code === 201) {
      // Recargar contactos
      await cargarContactos(draft.value.cliente_nit);
      
      // Seleccionar automáticamente el nuevo contacto
      draft.value.contacto = nuevoContacto.value.nombre;
      
      // Limpiar formulario y ocultar
      nuevoContacto.value.nombre = '';
      nuevoContacto.value.telefono = '';
      mostrarFormContacto.value = false;
    } else {
      alert('Error al guardar el contacto');
    }
  } catch (error) {
    console.error('Error guardando contacto:', error);
    alert('Error al guardar el contacto');
  }
}

// Cargar contactos
async function cargarContactos(nit) {
  if (!nit) {
    contactos.value = [];
    return;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos`,
      { nit },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );

    if (response.data.code === 200) {
      contactos.value = response.data.data;
    }
  } catch (error) {
    console.error('Error cargando contactos:', error);
    contactos.value = [];
  }
}

function onTipoChange() {
  const tipoSeleccionado = tiposVisita.find(t => t.id === draft.value.tipo_id);
  if (tipoSeleccionado) {
    draft.value.tipo_nombre = tipoSeleccionado.nombre;
  }
}

function onEstadoChange() {
  const estadoSeleccionado = estadosVisita.find(e => e.id === draft.value.estado_id);
  if (estadoSeleccionado) {
    draft.value.estado_nombre = estadoSeleccionado.nombre;
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
  if (!str) return '—';
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

// Watch para recargar contactos cuando cambie el cliente
watch(() => draft.value.cliente_nit, (nuevoNit, anteriorNit) => {
  if (nuevoNit && nuevoNit !== anteriorNit) {
    cargarContactos(nuevoNit);
    // Limpiar el contacto seleccionado si el cliente cambió
    if (anteriorNit) {
      draft.value.contacto = '';
    }
  }
});

onMounted(() => {
  cargarCatalogos();
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

.form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #d3d7e4;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2c425c;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

.hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #7a7f8a;
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

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #2c425c;
  background: #ffffff;
  color: #2c425c;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-icon:hover {
  background: #2c425c;
  color: #ffffff;
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

tr:hover td { background: #f7f8fc; }

.empty {
  text-align: center;
  color: #7a7f8a;
  padding: 10px 0;
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
.btn-mini:hover { background: #f4f6fb; }

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

/* Estilos para búsqueda con sugerencias */
.search-input-wrapper {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d3d7e4;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 2px;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
  background: #f7f8fc;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-title {
  font-size: 13px;
  font-weight: 600;
  color: #2c425c;
  margin-bottom: 2px;
}

.suggestion-subtitle {
  font-size: 11px;
  color: #7a7f8a;
}

.loading-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #7a7f8a;
}
</style>
