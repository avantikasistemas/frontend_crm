<!-- src/components/oportunidad/SeccionGestionOportunidad.vue -->
<template>
  <section class="card">
    <header class="card-header">
      <h2>Gestión</h2>
      <p>Estado, valores y adjudicación.</p>
    </header>

    <div class="pipeline-wrap">
      <PipelineEstados :estado-actual="op.estado" :estados="estados" />
    </div>

    <div class="card-body grid">
      <div class="field">
        <label>Estado</label>
        <select v-model="op.estado" @change="onEstadoChange">
          <option v-for="opt in estados" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Tipo de adjudicación</label>
        <select v-model="op.tipo_adjudicacion" @change="onTipoAdjudicacionChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in tiposAdjudicacion" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Impuestos adicionales (%)</label>
        <input v-model.number="op.impuestos_adicionales" type="number" min="0" max="100" />
      </div>

      <div class="field checkbox-field">
        <label>Compromiso del mes</label>
        <div class="checkbox-inline">
          <input
            v-model="op.compromiso_mes"
            type="checkbox"
            :true-value="1"
            :false-value="0"
            id="compromiso-mes"
          />
          <label for="compromiso-mes" class="checkbox-label">
            Sí, compromiso del mes en curso al cierre.
          </label>
        </div>
      </div>

      <div class="field">
        <label>Monto (COP)</label>
        <input v-model.number="op.monto" type="number" min="0" />
      </div>

      <div class="field">
        <label>Probabilidad de éxito (%)</label>
        <input v-model.number="op.probabilidad_exito" type="number" min="0" max="100" />
      </div>

      <div class="field">
        <label>Fecha estimada de cierre</label>
        <input v-model="op.fecha_cierre" type="date" />
      </div>

      <div class="field">
        <label>Número OC / Contrato</label>
        <input v-model="op.numero_oc_contrato" type="text" />
      </div>

      <div class="field">
        <label>Valor OC / Contrato</label>
        <input v-model.number="op.valor_oc_contrato" type="number" min="0" />
      </div>

      <div class="field full">
        <label>Motivo no adjudicación</label>
        <select v-model="op.motivo_no_adjudicacion" @change="onMotivoNoAdjudicacionChange">
          <option value="">-- Seleccione --</option>
          <option v-for="opt in motivosNoAdjudicacion" :key="opt.id" :value="opt.id">
            {{ opt.nombre }}
          </option>
        </select>
        <p class="hint" :class="{ required: op.estado_nombre === 'Cerrada Perdida' }">
          Obligatorio cuando la oportunidad está en estado "Cerrada Perdida".
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import PipelineEstados from './PipelineEstados.vue';
import { useCatalogos } from '../../services/useCatalogos.js';

const props = defineProps({
  op: {
    type: Object,
    required: true,
  },
  estados: {
    type: Array,
    required: true,
  },
});

// Cargar catálogos desde la BD
const { catalogos, cargarCatalogos } = useCatalogos();

// Referencias a los catálogos
const tiposAdjudicacion = ref([]);
const motivosNoAdjudicacion = ref([]);

// Cargar catálogos al montar el componente
onMounted(async () => {
  try {
    await cargarCatalogos();
    tiposAdjudicacion.value = catalogos.value.tiposAdjudicacion;
    motivosNoAdjudicacion.value = catalogos.value.motivosNoAdjudicacion;
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
});

// Función onChange para guardar id y nombre del motivo
const onMotivoNoAdjudicacionChange = () => {
  const selected = motivosNoAdjudicacion.value.find(opt => opt.id === props.op.motivo_no_adjudicacion);
  if (selected) {
    props.op.motivo_no_adjudicacion_id = selected.id;
    props.op.motivo_no_adjudicacion_nombre = selected.nombre;
  }
};

// Función onChange para guardar id y nombre del estado
const onEstadoChange = () => {
  const selected = props.estados.find(opt => opt.id === props.op.estado);
  if (selected) {
    props.op.estado_id = selected.id;
    props.op.estado_nombre = selected.nombre;
  }
};

// Función onChange para guardar id y nombre del tipo de adjudicación
const onTipoAdjudicacionChange = () => {
  const selected = tiposAdjudicacion.value.find(opt => opt.id === props.op.tipo_adjudicacion);
  if (selected) {
    props.op.tipo_adjudicacion_id = selected.id;
    props.op.tipo_adjudicacion_nombre = selected.nombre;
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

.pipeline-wrap {
  margin-top: 10px;
  padding: 8px 10px 4px;
  border-radius: 12px;
  background: #f6f7fb;
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

.checkbox-field {
  align-self: center;
}

.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.checkbox-label {
  font-size: 12px;
  color: #555a66;
}

.hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: #888ea0;
}
.hint.required {
  color: #b33a3a;
  font-weight: 500;
}
</style>
