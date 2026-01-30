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
          <th>Fecha</th>
          <th>Hora</th>
          <th>Estado</th>
          <th>Cierre real</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in visitas" :key="v.id">
          <td>{{ v.asunto }}</td>
          <td>{{ v.tipo }}</td>
          <td>{{ v.fecha }}</td>
          <td>{{ v.hora }}</td>
          <td>{{ v.estado }}</td>
          <td>{{ v.fecha_cierre_real ? formatDateTime(v.fecha_cierre_real) : '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="mostrarForm" class="form-wrap">
      <h3>{{ edicion ? 'Editar visita' : 'Nueva visita' }}</h3>
      <div class="form-grid">
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

        <div class="field full">
          <label>Objetivo</label>
          <input v-model="draft.objetivo" type="text" />
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
      </div>

      <div class="actions">
        <button type="button" class="btn-outline" @click="cerrarForm">Cancelar</button>
        <button type="button" class="btn-primary" @click="guardarVisita">
          Guardar visita
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { listVisitasOportunidad, upsertVisitaOportunidad } from '../../services/store';

const props = defineProps({
  oportunidadId: {
    type: String,
    required: true,
  },
});

const visitas = ref([]);
const mostrarForm = ref(false);
const edicion = ref(false);
const draft = ref(crearDraft());

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
    oportunidadId: '',
    asunto: '',
    tipo: '',
    objetivo: '',
    fecha: '',
    hora: '',
    estado: 'Abierto',
    fecha_cierre_real: null,
  };
}

function cargarVisitas() {
  if (!props.oportunidadId) return;
  visitas.value = listVisitasOportunidad(props.oportunidadId);
}

function abrirNueva() {
  draft.value = crearDraft();
  draft.value.oportunidadId = props.oportunidadId;
  edicion.value = false;
  mostrarForm.value = true;
}

function cerrarForm() {
  mostrarForm.value = false;
}

function guardarVisita() {
  if (!draft.value.asunto || !draft.value.tipo || !draft.value.fecha) {
    alert('Asunto, tipo y fecha son obligatorios para la visita.');
    return;
  }

  const toSave = { ...draft.value };
  const saved = upsertVisitaOportunidad(toSave);
  mostrarForm.value = false;
  cargarVisitas();
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
  () => {
    cargarVisitas();
  },
  { immediate: true }
);

onMounted(() => {
  cargarVisitas();
});
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

tr:hover td {
  background: #f7f8fc;
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
</style>
