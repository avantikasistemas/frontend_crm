<!-- src/components/oportunidad/SeccionInformacionOportunidad.vue -->
<template>
  <section class="card">
    <header class="card-header">
      <h2>Información de la Oportunidad</h2>
      <p>Datos generales y contexto comercial.</p>
    </header>

    <div class="card-body grid">
      <div class="field full">
        <label>Número de oportunidad</label>
        <p :value="op.numero_oportunidad"></p>
        <input type="text" :value="op.numero_oportunidad" disabled />
      </div>

      <div class="field">
        <label>Tipo de registro</label>
        <select v-model="op.tipo_registro" @change="onTipoRegistroChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in tiposRegistro" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Nombre de la oportunidad</label>
        <input v-model="op.nombre_oportunidad" type="text" />
      </div>

      <div class="field">
        <label>Origen</label>
        <select v-model="op.origen" @change="onOrigenChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in origenes" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Medio de identificación</label>
        <select v-model="op.medio_identificacion" @change="onMedioIdentificacionChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in mediosIdentificacion" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Empresa</label>
        <div class="search-input-wrapper">
          <input 
            v-model="empresaDisplay" 
            type="text" 
            placeholder="Buscar por NIT o nombre..."
            @input="onSearchEmpresa"
            @focus="showSuggestions = true"
            @blur="onBlurEmpresa"
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
        <label>Ciudad</label>
        <input v-model="op.ciudad" type="text" readonly />
      </div>

      <div class="field">
        <label>Tiempo de ejecución</label>
        <select v-model="op.tiempo_ejecucion" @change="onTiempoEjecucionChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in tiemposEjecucion" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Tipo de proyecto</label>
        <select v-model="op.tipo_proyecto" @change="onTipoProyectoChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in tiposProyecto" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Tipo de contratación</label>
        <select v-model="op.tipo_contratacion" @change="onTipoContratacionChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in tiposContratacion" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Número de cotización</label>
        <input v-model="op.numero_cotizacion" type="text" />
      </div>

      <div class="field">
        <label>Número de pedidos</label>
        <input v-model="op.numero_pedidos" type="text" />
      </div>

      <div class="field">
        <label>Zona</label>
        <input v-model="op.zona" type="text" readonly />
      </div>

      <div class="field">
        <label>Responsable</label>
        <input v-model="op.owner" type="text" readonly />
      </div>

      <div class="field full">
        <label>Descripción</label>
        <textarea v-model="op.descripcion" rows="3"></textarea>
      </div>

      <div class="field full">
        <label>Competencia</label>
        <input v-model="op.competencia" type="text" />
      </div>

      <div class="field full">
        <label>Próximos pasos</label>
        <input v-model="op.proximos_pasos" type="text" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, defineEmits, onMounted } from 'vue';
import axios from 'axios';
import apiUrl from '../../../config.js';
import { useCatalogos } from '../../services/useCatalogos.js';

const props = defineProps({
  op: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['guardar']);

// Cargar catálogos desde la BD
const { catalogos, cargarCatalogos } = useCatalogos();

// Referencias a los catálogos
const tiposRegistro = ref([]);
const origenes = ref([]);
const mediosIdentificacion = ref([]);
const tiemposEjecucion = ref([]);
const tiposProyecto = ref([]);
const tiposContratacion = ref([]);

// Cargar catálogos al montar el componente
onMounted(async () => {
  try {
    await cargarCatalogos();
    tiposRegistro.value = catalogos.value.tipoRegistros;
    origenes.value = catalogos.value.origenes;
    mediosIdentificacion.value = catalogos.value.mediosIdentificacion;
    tiemposEjecucion.value = catalogos.value.tiemposEjecucion;
    tiposProyecto.value = catalogos.value.tiposProyecto;
    tiposContratacion.value = catalogos.value.tiposContratacion;
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
});

// Estado para el search input
const empresaDisplay = ref('');
const filteredTerceros = ref([]);
const showSuggestions = ref(false);
const isSearching = ref(false);
let searchTimeout = null;

// Función de búsqueda con debounce
const onSearchEmpresa = () => {
  clearTimeout(searchTimeout);
  
  const searchValue = empresaDisplay.value.trim();
  
  if (searchValue.length < 1) {
    filteredTerceros.value = [];
    return;
  }
  
  isSearching.value = true;
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/oportunidades/terceros`,
        {
          valor: searchValue
        },
        {
          headers: {
            Accept: "application/json",
          }
        }
      );
      
      if (response.data.code === 200 && Array.isArray(response.data.data)) {
        filteredTerceros.value = response.data.data;
        showSuggestions.value = true;
      } else {
        filteredTerceros.value = [];
      }
    } catch (error) {
      console.error('Error buscando terceros:', error);
      filteredTerceros.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

// Seleccionar un tercero
const selectTercero = (tercero) => {
  empresaDisplay.value = `${tercero.nombres} - ${tercero.nit}`;
  props.op.empresa_nombre = tercero.nombres;
  props.op.empresa_nit = tercero.nit;
  props.op.ciudad = tercero.ciudad;
  props.op.zona = tercero.zona;
  props.op.owner = tercero.ejecutivo || '';
  filteredTerceros.value = [];
  showSuggestions.value = false;
};

// Manejar el blur del input
const onBlurEmpresa = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Sincronizar el search input con el valor de la oportunidad
watch(() => [props.op.empresa_nombre, props.op.empresa_nit], ([nombre, nit]) => {
  if (nombre && !empresaDisplay.value) {
    empresaDisplay.value = nit ? `${nombre} - NIT: ${nit}` : nombre;
  }
}, { immediate: true });
// Funciones onChange para guardar id y nombre
const onTipoRegistroChange = () => {
  const selected = tiposRegistro.value.find(opt => opt.id === props.op.tipo_registro);
  if (selected) {
    props.op.tipo_registro_id = selected.id;
    props.op.tipo_registro_nombre = selected.nombre;
  }
};

const onOrigenChange = () => {
  const selected = origenes.value.find(opt => opt.id === props.op.origen);
  if (selected) {
    props.op.origen_id = selected.id;
    props.op.origen_nombre = selected.nombre;
  }
};

const onMedioIdentificacionChange = () => {
  const selected = mediosIdentificacion.value.find(opt => opt.id === props.op.medio_identificacion);
  if (selected) {
    props.op.medio_identificacion_id = selected.id;
    props.op.medio_identificacion_nombre = selected.nombre;
  }
};

const onTiempoEjecucionChange = () => {
  const selected = tiemposEjecucion.value.find(opt => opt.id === props.op.tiempo_ejecucion);
  if (selected) {
    props.op.tiempo_ejecucion_id = selected.id;
    props.op.tiempo_ejecucion_nombre = selected.nombre;
  }
};

const onTipoProyectoChange = () => {
  const selected = tiposProyecto.value.find(opt => opt.id === props.op.tipo_proyecto);
  if (selected) {
    props.op.tipo_proyecto_id = selected.id;
    props.op.tipo_proyecto_nombre = selected.nombre;
  }
};

const onTipoContratacionChange = () => {
  const selected = tiposContratacion.value.find(opt => opt.id === props.op.tipo_contratacion);
  if (selected) {
    props.op.tipo_contratacion_id = selected.id;
    props.op.tipo_contratacion_nombre = selected.nombre;
  }
};
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 6px 16px rgba(34, 46, 80, 0.06);
  border: 1px solid #e0e3ec;
}

.card-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #2c425c;
  margin: 0 0 4px;
}

.card-header p {
  margin: 0;
  font-size: 12px;
  color: #7a7f8a;
}

.card-body {
  margin-top: 12px;
}

.grid {
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
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2c425c;
}
textarea {
  resize: vertical;
}

/* Estilos para el search input */
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
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-title {
  font-size: 13px;
  font-weight: 500;
  color: #2c425c;
  margin-bottom: 2px;
}

.suggestion-subtitle {
  font-size: 11px;
  color: #7a7f8a;
}

.loading-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #7a7f8a;
}
</style>
