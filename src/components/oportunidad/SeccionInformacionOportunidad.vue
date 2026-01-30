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
import { ref, watch, defineEmits } from 'vue';
import axios from 'axios';
import apiUrl from '../../../config.js';

const props = defineProps({
  op: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['guardar']);

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
  const selected = tiposRegistro.find(opt => opt.id === props.op.tipo_registro);
  if (selected) {
    props.op.tipo_registro_id = selected.id;
    props.op.tipo_registro_nombre = selected.nombre;
  }
};

const onOrigenChange = () => {
  const selected = origenes.find(opt => opt.id === props.op.origen);
  if (selected) {
    props.op.origen_id = selected.id;
    props.op.origen_nombre = selected.nombre;
  }
};

const onMedioIdentificacionChange = () => {
  const selected = mediosIdentificacion.find(opt => opt.id === props.op.medio_identificacion);
  if (selected) {
    props.op.medio_identificacion_id = selected.id;
    props.op.medio_identificacion_nombre = selected.nombre;
  }
};

const onTiempoEjecucionChange = () => {
  const selected = tiemposEjecucion.find(opt => opt.id === props.op.tiempo_ejecucion);
  if (selected) {
    props.op.tiempo_ejecucion_id = selected.id;
    props.op.tiempo_ejecucion_nombre = selected.nombre;
  }
};

const onTipoProyectoChange = () => {
  const selected = tiposProyecto.find(opt => opt.id === props.op.tipo_proyecto);
  if (selected) {
    props.op.tipo_proyecto_id = selected.id;
    props.op.tipo_proyecto_nombre = selected.nombre;
  }
};

const onTipoContratacionChange = () => {
  const selected = tiposContratacion.find(opt => opt.id === props.op.tipo_contratacion);
  if (selected) {
    props.op.tipo_contratacion_id = selected.id;
    props.op.tipo_contratacion_nombre = selected.nombre;
  }
};
const tiposRegistro = [
  { id: 1, nombre: 'Industria' },
  { id: 2, nombre: 'Educacion' },
  { id: 3, nombre: 'Estado' }
];

const origenes = [
  { id: 1, nombre: 'Mercadeo' },
  { id: 2, nombre: 'Ventas' }
];

const mediosIdentificacion = [
  { id: 1, nombre: 'Cliente' },
  { id: 2, nombre: 'Congresos y Seminarios' },
  { id: 3, nombre: 'Correo electrónico' },
  { id: 4, nombre: 'Demostraciones' },
  { id: 5, nombre: 'Evento Comercial' },
  { id: 6, nombre: 'Evento de Mercadeo Presencial' },
  { id: 7, nombre: 'Feria de Proveedores' },
  { id: 8, nombre: 'Llamada Telefónica' },
  { id: 9, nombre: 'Mailing' },
  { id: 10, nombre: 'Mapa de Inversiones' },
  { id: 11, nombre: 'Medios de Comunicación' },
  { id: 12, nombre: 'Página Web Avántika' },
  { id: 13, nombre: 'Página Web Cliente' },
  { id: 14, nombre: 'Plan de Compras' },
  { id: 15, nombre: 'Plataforma del cliente' },
  { id: 16, nombre: 'Promoción' },
  { id: 17, nombre: 'Proveedor' },
  { id: 18, nombre: 'Proyeccion de Ventas' },
  { id: 19, nombre: 'Redes Sociales' },
  { id: 20, nombre: 'Referido' },
  { id: 21, nombre: 'Visita' },
  { id: 22, nombre: 'Webinars' }
];

const tiemposEjecucion = [
  { id: 1, nombre: 'Menor a 3 dias' },
  { id: 2, nombre: 'Entre 4 y 8 dias' },
  { id: 3, nombre: 'Entre 9 y 15 dias' },
  { id: 4, nombre: 'Entre 16 y 30 dias' },
  { id: 5, nombre: 'Entre 31 y 45 dias' },
  { id: 6, nombre: 'Entre 46 y 60 dias' },
  { id: 7, nombre: 'Entre 61 y 90 dias' },
  { id: 8, nombre: 'Entre 91 y 120 dias' },
  { id: 9, nombre: 'Entre 121 y 150 dias' },
  { id: 10, nombre: 'Mas de 151 dias' },
  { id: 11, nombre: 'Anual' }
];

const tiposProyecto = [
  { id: 1, nombre: 'Proyecto Especial Naranja' },
  { id: 2, nombre: 'Proyecto Base Azul' },
  { id: 3, nombre: 'Comercial' }
];

const tiposContratacion = [
  { id: 1, nombre: 'Compra Directa' },
  { id: 2, nombre: 'Licitación Pública' },
  { id: 3, nombre: 'Selección Abreviada' },
  { id: 4, nombre: 'Contratación Directa' },
  { id: 5, nombre: 'Mínima Cuantía' },
  { id: 6, nombre: 'Acuerdo Marco' },
  { id: 7, nombre: 'Contrato de Prestación de Servicios' }
];
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
