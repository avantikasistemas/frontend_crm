<!-- src/components/oportunidad/VisitasPanel.vue -->
<template>
  <section class="card">
    <header class="card-header">
      <div>
        <h2>Actividad · Visitas asociadas</h2>
        <p>Registro de visitas vinculadas a esta oportunidad.</p>
      </div>
      <button type="button" class="btn-primary" @click="abrirNueva">
        + Crear visita
      </button>
    </header>

    <div v-if="visitas.length === 0" class="empty">
      No hay visitas registradas para esta oportunidad.
    </div>

    <table v-else class="table">
      <thead>
        <tr>
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
        <tr v-for="v in visitas" :key="v.id" class="row-click" @click="editar(v)">
          <td>{{ v.asunto }}</td>
          <td>{{ v.tipo_nombre }}</td>
          <td>{{ v.contacto || '-' }}</td>
          <td>{{ formatDateTime(v.fecha_hora) }}</td>
          <td>{{ v.estado_nombre }}</td>
          <td>{{ v.fecha_cierre_real ? formatDateTime(v.fecha_cierre_real) : '-' }}</td>
          <td class="actions-cell" @click.stop>
            <button class="btn-mini" type="button" @click="editar(v)">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="mostrarForm" class="form-wrap">
      <h3>{{ edicion ? 'Editar visita' : 'Nueva visita' }}</h3>
      <div class="form-grid">
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
          <div class="contacto-field">
            <select v-model="draft.contacto" :disabled="esCompletada">
              <option value="">-- Seleccione --</option>
              <option v-for="c in contactos" :key="c.nombre" :value="c.nombre">
                {{ c.nit }} - {{ c.nombre }} - {{ c.tel_celular }}
              </option>
            </select>
            <button 
              v-if="!esCompletada && props.empresaNit" 
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
          <label>Objetivo</label>
          <input v-model="draft.objetivo" type="text" :disabled="esCompletada" />
        </div>

        <div class="field full">
          <label>Comentarios (máx. 150 caracteres)</label>
          <textarea 
            v-model="draft.comentarios" 
            :maxlength="150"
            :disabled="esCompletada"
            rows="3"
            placeholder="Ingrese comentarios adicionales..."
          ></textarea>
          <p class="hint">{{ (draft.comentarios || '').length }}/150 caracteres</p>
        </div>

        <div class="field">
          <label>Resultado</label>
          <select v-model="draft.resultado_id" :disabled="esCompletada">
            <option value="">-- Seleccione --</option>
            <option v-for="opt in resultadosVisitas" :key="opt.id" :value="opt.id">
              {{ opt.nombre }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Fecha y Hora Visita</label>
          <input v-model="draft.fecha_hora" type="datetime-local" :disabled="esCompletada" />
        </div>

        <div class="field">
          <label>Estado Visita</label>
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
          <label>Cierre real (automático)</label>
          <input
            type="text"
            :value="draft.fecha_cierre_real ? formatDateTime(draft.fecha_cierre_real) : '—'"
            disabled
          />
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn-outline" @click="cerrarForm">{{ esCompletada ? 'Cerrar' : 'Cancelar' }}</button>
        <button v-if="!esCompletada" type="button" class="btn-primary" @click="guardarVisita">
          Guardar
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import apiUrl from '../../../config.js';
import { useCatalogos } from '../../services/useCatalogos.js';

const props = defineProps({
  oportunidadId: {
    type: [Number, String],
    required: true,
  },
  empresaNit: {
    type: String,
    default: ''
  }
});

const visitas = ref([]);
const contactos = ref([]);
const mostrarForm = ref(false);
const edicion = ref(false);
const draft = ref(crearDraft());
const estadoOriginal = ref(null); // Guarda el estado_id original de la BD
const mostrarFormContacto = ref(false);
const nuevoContacto = ref({
  nombre: '',
  tel_celular: ''
});

// Cargar catálogos
const { catalogos } = useCatalogos();
const resultadosVisitas = computed(() => catalogos.value.resultadosVisitas || []);

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

const estadosVisita = [
  { id: 1, nombre: 'Abierto' },
  { id: 2, nombre: 'Completado' },
  { id: 3, nombre: 'Aplazado' },
  { id: 4, nombre: 'Cancelado' }
];

// Computed para determinar si la visita está completada y debe ser solo lectura
const esCompletada = computed(() => {
  return edicion.value && estadoOriginal.value === 2;
});

function crearDraft() {
  return {
    id: null,
    oportunidad_id: '',
    asunto: '',
    tipo_id: '',
    tipo_nombre: '',
    contacto: '',
    objetivo: '',
    fecha_hora: '',
    estado_id: 1,
    estado_nombre: 'Abierto',
    fecha_cierre_real: null,
    comentarios: '',
    resultado_id: null,
  };
}

async function cargarVisitas() {
  if (!props.oportunidadId) return;
  
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas/listar`,
      { oportunidad_id: parseInt(props.oportunidadId) },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 200) {
      visitas.value = response.data.data;
    }
  } catch (error) {
    console.error('Error cargando visitas:', error);
    visitas.value = [];
  }
}

async function cargarContactos() {
  if (!props.empresaNit) {
    contactos.value = [];
    return;
  }
  
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos`,
      { nit: props.empresaNit },
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

function abrirNueva() {
  draft.value = crearDraft();
  draft.value.oportunidad_id = props.oportunidadId;
  edicion.value = false;
  estadoOriginal.value = null; // Nueva visita, sin estado original
  mostrarForm.value = true;
  cargarContactos();
}

function editar(v) {
  draft.value = { ...v };
  // Setear los IDs correctos
  draft.value.tipo_id = v.tipo_id;
  draft.value.estado_id = v.estado_id;
  edicion.value = true;
  estadoOriginal.value = v.estado_id; // Guardar el estado original de la BD
  mostrarForm.value = true;
  cargarContactos();
}

function cerrarForm() {
  mostrarForm.value = false;
  mostrarFormContacto.value = false;
  nuevoContacto.value = { nombre: '', tel_celular: '' };
}

async function guardarNuevoContacto() {
  if (!nuevoContacto.value.nombre) {
    alert('El nombre del contacto es obligatorio');
    return;
  }
  
  if (!props.empresaNit) {
    alert('No hay un NIT de empresa seleccionado');
    return;
  }
  
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/contactos/guardar`,
      {
        nit: props.empresaNit,
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
      await cargarContactos();
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

// Función onChange para tipo
const onTipoChange = () => {
  const selected = tiposVisita.find(opt => opt.id === draft.value.tipo_id);
  if (selected) {
    draft.value.tipo_nombre = selected.nombre;
  }
};

// Función onChange para estado
const onEstadoChange = () => {
  const selected = estadosVisita.find(opt => opt.id === draft.value.estado_id);
  if (selected) {
    draft.value.estado_nombre = selected.nombre;
  }
};

async function guardarVisita() {
  if (!draft.value.asunto || !draft.value.tipo_id || !draft.value.fecha_hora) {
    alert('Asunto, tipo y fecha/hora son obligatorios para la visita.');
    return;
  }

  try {
    const toSave = {
      ...draft.value,
      oportunidad_id: parseInt(props.oportunidadId)
    };
    
    const response = await axios.post(
      `${apiUrl}/oportunidades/visitas/guardar`,
      toSave,
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 201 || response.data.code === 200) {
      alert(response.data.message);
      mostrarForm.value = false;
      cargarVisitas();
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error guardando visita:', error);
    alert('Error al guardar la visita.');
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

watch(
  () => props.oportunidadId,
  () => cargarVisitas(),
  { immediate: true }
);

// Watch para recargar contactos cuando cambie empresaNit
watch(
  () => props.empresaNit,
  (newNit) => {
    if (newNit && mostrarForm.value) {
      cargarContactos();
    }
  }
);

onMounted(() => cargarVisitas());
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 6px 16px rgba(34, 46, 80, 0.06);
  border: 1px solid #e0e3ec;
  margin-top: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-header h2 {
  font-size: 15px;
  font-weight: 600;
  color: #2c425c;
  margin: 0 0 3px;
}

.card-header p {
  margin: 0;
  font-size: 12px;
  color: #7a7f8a;
}

.empty {
  margin-top: 10px;
  font-size: 13px;
  color: #7a7f8a;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
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

.row-click {
  cursor: pointer;
}

tr:hover td {
  background: #f7f8fc;
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

.form-wrap {
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px dashed #d3d7e4;
}

.form-wrap h3 {
  font-size: 14px;
  margin: 0 0 10px;
  color: #2c425c;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.field.full {
  grid-column: span 2;
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

.hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: #7a7f8a;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-primary {
  border-radius: 999px;
  padding: 6px 14px;
  border: none;
  background: #2c425c;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
}
.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-outline {
  border-radius: 999px;
  padding: 6px 14px;
  border: 1px solid #2c425c;
  background: transparent;
  color: #2c425c;
  cursor: pointer;
  font-size: 13px;
}
.btn-outline:hover {
  background: #f4f6fb;
}

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
</style>
