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
            <th>Id</th>
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
            <td>{{ v.id }}</td>
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
            <p class="empresa-info" v-if="modalDraft.empresaNombre">
              <strong>Empresa:</strong> {{ modalDraft.empresaNombre }} · NIT: {{ modalDraft.empresaNit }}
            </p>
          </div>
          <button class="x" type="button" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="field">
              <label>Asunto <span class="required">*</span></label>
              <input v-model="modalDraft.asunto" type="text" :disabled="esCompletada" :class="{ 'error': camposConError.has('asunto') }" />
            </div>

            <div class="field">
              <label>Tipo <span class="required">*</span></label>
              <select v-model="modalDraft.tipo_id" :disabled="esCompletada" :class="{ 'error': camposConError.has('tipo_id') }">
                <option value="">-- Seleccione --</option>
                <option v-for="opt in tiposVisita" :key="opt.id" :value="opt.id">
                  {{ opt.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Contacto <span class="required">*</span></label>
              <div class="contacto-field">
                <select v-model="modalDraft.contacto" :disabled="esCompletada" :class="{ 'error': camposConError.has('contacto') }">
                  <option value="">-- Seleccione --</option>
                  <option v-for="c in contactos" :key="c.nombre" :value="c.nombre">
                    {{ c.nit }} - {{ c.nombre }} - {{ c.tel_celular }}
                  </option>
                </select>
                <button 
                  v-if="!esCompletada && modalDraft.empresaNit" 
                  type="button" 
                  class="btn-add-contacto"
                  @click="mostrarFormContacto = !mostrarFormContacto"
                  :title="mostrarFormContacto ? 'Cancelar' : 'Agregar nuevo contacto'"
                >
                  {{ mostrarFormContacto ? '✕' : '+' }}
                </button>
              </div>
              <p class="hint" v-if="contactos.length === 0 && !mostrarFormContacto">No hay contactos disponibles</p>
              
              <!-- Formulario para agregar contacto -->
              <div v-if="mostrarFormContacto" class="form-nuevo-contacto">
                <div class="field-inline">
                  <div>
                    <label>Nombre</label>
                    <input v-model="nuevoContacto.nombre" type="text" placeholder="Nombre del contacto" />
                  </div>
                  <div>
                    <label>Teléfono</label>
                    <input v-model="nuevoContacto.tel_celular" type="text" placeholder="Teléfono" />
                  </div>
                  <button type="button" class="btn-save-contacto" @click="guardarNuevoContacto">
                    Guardar
                  </button>
                </div>
              </div>
            </div>

            <div class="field full">
              <label>Objetivo <span class="required">*</span></label>
              <input v-model="modalDraft.objetivo" type="text" :disabled="esCompletada" :class="{ 'error': camposConError.has('objetivo') }" />
            </div>

            <div class="field full">
              <label>Comentarios (máx. 150 caracteres)</label>
              <textarea 
                v-model="modalDraft.comentarios" 
                :maxlength="150"
                :disabled="esCompletada"
                rows="3"
                placeholder="Ingrese comentarios adicionales..."
              ></textarea>
              <p class="hint">{{ (modalDraft.comentarios || '').length }}/150 caracteres</p>
            </div>

            <div class="field">
              <label>Resultado <span class="required">*</span></label>
              <select v-model.number="modalDraft.resultado_id" :disabled="esCompletada" :class="{ 'error': camposConError.has('resultado_id') }">
                <option :value="null">-- Seleccione --</option>
                <option v-for="opt in resultadosVisitas" :key="opt.id" :value="opt.id">
                  {{ opt.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Fecha <span class="required">*</span></label>
              <input v-model="modalDraft.fecha" type="date" :disabled="esCompletada" :class="{ 'error': camposConError.has('fecha') }" />
            </div>

            <div class="field">
              <label>Hora <span class="required">*</span></label>
              <input v-model="modalDraft.hora" type="time" :disabled="esCompletada" :class="{ 'error': camposConError.has('hora') }" />
            </div>

            <div class="field">              <label>Coordinador / Ejecutivo <span class="required">*</span></label>
              <div class="search-input-wrapper">
                <input 
                  v-model="ejecutivoDisplay" 
                  type="text" 
                  placeholder="Buscar ejecutivo..."
                  @input="onSearchEjecutivo"
                  @focus="showEjecutivoSuggestions = true"
                  @blur="onBlurEjecutivo"
                  :disabled="esCompletada"
                  :class="{ 'error': camposConError.has('nit_ejecutivo') }"
                />
                <div v-if="showEjecutivoSuggestions && filteredEjecutivos.length > 0" class="suggestions">
                  <div 
                    v-for="ejecutivo in filteredEjecutivos" 
                    :key="ejecutivo.nit_ejecutivo"
                    class="suggestion-item"
                    @mousedown.prevent="selectEjecutivo(ejecutivo)"
                  >
                    <div class="suggestion-title">{{ ejecutivo.ejecutivo }}</div>
                    <div class="suggestion-subtitle">{{ ejecutivo.rol }} • NIT: {{ ejecutivo.nit_ejecutivo }}</div>
                  </div>
                </div>
                <div v-if="isSearchingEjecutivo" class="loading-indicator">Buscando...</div>
              </div>
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
import { useCatalogos } from '../services/useCatalogos.js';

const visitas = ref([]);
const contactos = ref([]);
const mostrarFormContacto = ref(false);
const nuevoContacto = ref({
  nombre: '',
  tel_celular: ''
});

// Para búsqueda de ejecutivos
const ejecutivos = ref([]);
const filteredEjecutivos = ref([]);
const showEjecutivoSuggestions = ref(false);
const isSearchingEjecutivo = ref(false);
const ejecutivoDisplay = ref('');
let searchEjecutivoTimeout = null;

// Cargar catálogos
const { catalogos, cargarCatalogos } = useCatalogos();
const resultadosVisitas = computed(() => catalogos.value.resultadosVisitas || []);
const busqueda = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 30;
const totalRegistros = ref(0);
const totalPaginas = ref(1);
const cargando = ref(false);
const camposConError = ref(new Set()); // Para rastrear campos con errores

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
        empresaNit: v.empresa_nit,
        empresaNombre: v.empresa_nombre,
        asunto: v.asunto,
        tipo: v.tipo_nombre,
        tipo_id: v.tipo_id,
        nit_ejecutivo: v.nit_ejecutivo,
        ejecutivo_nombre: v.ejecutivo_nombre,
        fecha: v.fecha_hora ? v.fecha_hora.split('T')[0] : '',
        hora: v.fecha_hora ? v.fecha_hora.split('T')[1]?.substring(0, 5) : '',
        estado: v.estado_nombre,
        estado_id: v.estado_id,
        objetivo: v.objetivo,
        contacto: v.contacto,
        fecha_cierre_real: v.fecha_cierre_real,
        fecha_hora_original: v.fecha_hora,
        comentarios: v.comentarios || '',
        resultado_id: v.resultado_id ? parseInt(v.resultado_id) : null
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

async function cargarContactos(empresaNit) {
  if (!empresaNit) {
    contactos.value = [];
    return;
  }
  
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos`,
      { nit: empresaNit },
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

async function guardarNuevoContacto() {
  if (!nuevoContacto.value.nombre) {
    alert('El nombre del contacto es obligatorio');
    return;
  }
  
  if (!modalDraft.value.empresaNit) {
    alert('No hay un NIT de empresa seleccionado');
    return;
  }
  
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos/guardar`,
      {
        nit: modalDraft.value.empresaNit,
        nombre: nuevoContacto.value.nombre,
        tel_celular: nuevoContacto.value.tel_celular
      },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 201) {
      alert('Contacto guardado exitosamente');
      // Recargar contactos
      await cargarContactos(modalDraft.value.empresaNit);
      // Limpiar formulario
      nuevoContacto.value = { nombre: '', tel_celular: '' };
      mostrarFormContacto.value = false;
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error guardando contacto:', error);
    alert('Error al guardar el contacto');
  }
}

function abrirEditar(v) {
  // Guardar el estado original para determinar si está completada
  estadoOriginal.value = v.estado_id;
  
  modalDraft.value = { ...v };
  modalDraft.value.nit_ejecutivo = v.nit_ejecutivo || '';
  modalDraft.value.ejecutivo_nombre = v.ejecutivo_nombre || '';
  ejecutivoDisplay.value = v.ejecutivo_nombre || '';
  showModal.value = true;
  
  // Cargar contactos de la empresa
  if (v.empresaNit) {
    cargarContactos(v.empresaNit);
  }
}

function cerrarModal() {
  showModal.value = false;
  modalDraft.value = {};
  estadoOriginal.value = null;
  contactos.value = [];
  ejecutivoDisplay.value = '';
  mostrarFormContacto.value = false;
  nuevoContacto.value = { nombre: '', tel_celular: '' };
  camposConError.value = new Set(); // Limpiar errores
}

function validarCampos() {
  const errores = new Set();
  
  if (!modalDraft.value.asunto || !modalDraft.value.asunto.trim()) errores.add('asunto');
  if (!modalDraft.value.tipo_id) errores.add('tipo_id');
  if (!modalDraft.value.contacto) errores.add('contacto');
  if (!modalDraft.value.objetivo || !modalDraft.value.objetivo.trim()) errores.add('objetivo');
  if (!modalDraft.value.resultado_id) errores.add('resultado_id');
  if (!modalDraft.value.fecha) errores.add('fecha');
  if (!modalDraft.value.hora) errores.add('hora');
  if (!modalDraft.value.nit_ejecutivo) errores.add('nit_ejecutivo');
  
  camposConError.value = errores;
  return errores.size === 0;
}

async function guardarEdicion() {
  if (!validarCampos()) {
    alert('Por favor complete todos los campos obligatorios resaltados en rojo.');
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
    nit_ejecutivo: modalDraft.value.nit_ejecutivo || '',
    ejecutivo_nombre: modalDraft.value.ejecutivo_nombre || '',
    fecha_hora: fechaHora,
    estado_id: modalDraft.value.estado_id,
    estado_nombre: estadoSeleccionado?.nombre || '',
    comentarios: modalDraft.value.comentarios || '',
    resultado_id: modalDraft.value.resultado_id ? parseInt(modalDraft.value.resultado_id) : null
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
    // Mostrar mensaje de error del backend si está disponible
    const mensaje = error.response?.data?.message || 'Error al guardar la visita';
    alert(mensaje);
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

// Búsqueda de ejecutivos
async function onSearchEjecutivo() {
  const valor = ejecutivoDisplay.value.trim();
  
  if (valor.length < 2) {
    filteredEjecutivos.value = [];
    return;
  }

  clearTimeout(searchEjecutivoTimeout);
  searchEjecutivoTimeout = setTimeout(async () => {
    isSearchingEjecutivo.value = true;
    try {
      const response = await axios.post(
        `${apiUrl}/oportunidades/ejecutivos`,
        { valor },
        {
          headers: {
            Accept: "application/json",
          }
        }
      );

      if (response.data.code === 200) {
        filteredEjecutivos.value = response.data.data;
      }
    } catch (error) {
      console.error('Error buscando ejecutivos:', error);
    } finally {
      isSearchingEjecutivo.value = false;
    }
  }, 300);
}

function selectEjecutivo(ejecutivo) {
  modalDraft.value.nit_ejecutivo = ejecutivo.nit_ejecutivo;
  modalDraft.value.ejecutivo_nombre = ejecutivo.ejecutivo;
  ejecutivoDisplay.value = ejecutivo.ejecutivo + " - " + ejecutivo.nit_ejecutivo;
  showEjecutivoSuggestions.value = false;
  filteredEjecutivos.value = [];
}

function onBlurEjecutivo() {
  setTimeout(() => {
    showEjecutivoSuggestions.value = false;
  }, 200);
}

watch([pagina], () => {
  cargar();
});

watch([busqueda, filtroEstado], () => {
  pagina.value = 1;
  cargar();
});

onMounted(async () => {
  // Cargar catálogos primero
  await cargarCatalogos();
  // Luego cargar visitas
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
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2c425c;
}

input.error,
select.error,
textarea.error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

input.error:focus,
select.error:focus,
textarea.error:focus {
  border-color: #dc2626;
}

.required {
  color: #dc2626;
  font-weight: bold;
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

.empresa-info {
  margin: 4px 0 0;
  font-size: 11px;
  color: #059669;
  font-weight: 500;
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

/* Estilos para el campo de contacto con botón + */
.contacto-field {
  display: flex;
  gap: 6px;
  align-items: center;
}

.contacto-field select {
  flex: 1;
}

.btn-add-contacto {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #2c425c;
  background: #2c425c;
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-add-contacto:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

/* Formulario para nuevo contacto */
.form-nuevo-contacto {
  margin-top: 8px;
  padding: 10px;
  background: #f7f8fc;
  border-radius: 8px;
  border: 1px dashed #c6ccd8;
}

.field-inline {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: end;
}

.field-inline label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #404858;
  margin-bottom: 3px;
}

.field-inline input {
  width: 100%;
}

.btn-save-contacto {
  border-radius: 8px;
  padding: 6px 12px;
  border: none;
  background: #10b981;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  height: 32px;
  white-space: nowrap;
}

.btn-save-contacto:hover {
  background: #059669;
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
