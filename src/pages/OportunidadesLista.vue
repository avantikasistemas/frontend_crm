<!-- src/pages/OportunidadesLista.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Oportunidades</h1>
        <p>Gestión de oportunidades comerciales.</p>
      </div>
      <button type="button" class="btn-primary" @click="irNueva">
        + Nueva Oportunidad
      </button>
    </header>

    <section class="filters card">
      <div class="field full">
        <label>Búsqueda</label>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por número, nombre o empresa..."
        />
      </div>

      <div class="field">
        <label>Zona</label>
        <input v-model="filtroZona" type="text" placeholder="Filtrar por zona..." />
      </div>

      <div class="field">
        <label>Estado</label>
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option v-for="opt in estados" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </section>

    <section class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Nombre</th>
            <th>Empresa</th>
            <th>Zona</th>
            <th>Owner</th>
            <th>Estado</th>
            <th>Monto</th>
            <th>Fecha cierre</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td colspan="8" class="empty">
              Cargando oportunidades...
            </td>
          </tr>
          <tr v-else-if="paginadas.length === 0">
            <td colspan="8" class="empty">
              No hay oportunidades que coincidan con los filtros.
            </td>
          </tr>
          <tr
            v-for="op in paginadas"
            :key="op.id"
            class="row-click"
            @click="irDetalle(op.id)"
          >
            <td>{{ op.numero_oportunidad }}</td>
            <td>{{ op.nombre_oportunidad }}</td>
            <td>{{ op.empresa_nombre }}</td>
            <td>{{ op.zona || '—' }}</td>
            <td>{{ op.owner || '—' }}</td>
            <td>{{ op.estado }}</td>
            <td>{{ formatMonto(op.monto) }}</td>
            <td>{{ op.fecha_cierre || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPaginas > 1 && !cargando">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import apiUrl from '../../config.js';
// import { listOportunidades } from '../services/store'; // Ya no se usa

const router = useRouter();

const oportunidades = ref([]);
const busqueda = ref('');
const filtroZona = ref('');
const filtroEstado = ref('');
const pagina = ref(1);
const pageSize = 30;
const totalRegistros = ref(0);
const totalPaginas = ref(1);
const cargando = ref(false);

const estados = [
  'Nueva',
  'Identificacion de Decisores',
  'Identificacion de Necesidades',
  'Propuesta Técnica',
  'Cubrimiento Base Técnica',
  'Ajustes a Propuesta',
  'Cubrimiento Base Jurídica',
  'Cubrimiento Base Financiera',
  'Prepliego Publicado para Observaciones',
  'Pliego Publicado para Observaciones',
  'Presentación De Propuesta Final',
  'Propuesta En Evaluación',
  'Revisión Y Observaciones A Evaluación',
  'Aprobación Verbal',
  'Propuesta Adjudicada',
  'Cerrada Ganada',
  'Cerrada Perdida',
  'Cerrada Anulada',
];

async function cargar() {
  cargando.value = true;
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/listar`, 
      {
        pagina: pagina.value,
        page_size: pageSize,
        busqueda: busqueda.value,
        zona: filtroZona.value,
        estado: filtroEstado.value
      },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 200) {
      const data = response.data.data;
      oportunidades.value = data.oportunidades;
      totalRegistros.value = data.total_registros;
      totalPaginas.value = data.total_paginas;
    }
  } catch (error) {
    console.error('Error cargando oportunidades:', error);
  } finally {
    cargando.value = false;
  }
}

// Ya no necesitamos computed filtradas ni paginadas porque el backend maneja todo
const paginadas = computed(() => oportunidades.value);

function irNueva() {
  router.push('/oportunidades/nueva');
}

function irDetalle(id) {
  router.push(`/oportunidades/${id}`);
}

function paginaAnterior() {
  if (pagina.value > 1) pagina.value -= 1;
}

function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) pagina.value += 1;
}

function formatMonto(val) {
  if (val == null || val === '') return '—';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return String(val);
  }
}

watch([busqueda, filtroZona, filtroEstado], () => {
  pagina.value = 1;
  cargar();
});

watch(pagina, () => {
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h1 {
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
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
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

.row-click {
  cursor: pointer;
}

.row-click:hover td {
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
</style>
