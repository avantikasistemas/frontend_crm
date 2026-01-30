<!-- src/pages/OportunidadDetalle.vue -->
<template>
  <div class="page" v-if="cargado">
    <header class="page-header">
      <div>
        <h1>{{ op.nombre_oportunidad || 'Oportunidad' }}</h1>
        <p>
          {{ op.numero_oportunidad }} · {{ op.empresa_nombre || 'Sin empresa' }}
        </p>
      </div>
      <div v-if="op.created_at" class="fecha-creacion">
        <small>Fecha de creación:</small>
        <strong>{{ formatearFecha(op.created_at) }}</strong>
      </div>
      <!-- <div class="actions">
        <button type="button" class="btn-outline" @click="volverLista">
          Volver
        </button>
        <button type="button" class="btn-primary" @click="guardar">
          Actualizar
        </button>
      </div> -->
    </header>

    <FormularioOportunidad :op="op" modo="edit" @save="guardar" />

    <VisitasPanel :oportunidad-id="op.id" :empresa-nit="op.empresa_nit" />
  </div>

  <div v-else class="page">
    Cargando oportunidad...
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import apiUrl from '../../config.js';
import FormularioOportunidad from '../components/oportunidad/FormularioOportunidad.vue';
import VisitasPanel from '../components/oportunidad/VisitasPanel.vue';

const route = useRoute();
const router = useRouter();

const op = reactive({
  id: null,
  numero_oportunidad: '',
  tipo_registro: '',
  nombre_oportunidad: '',
  origen: '',
  medio_identificacion: '',
  empresa_nombre: '',
  departamento: '',
  ciudad: '',
  tiempo_ejecucion: '',
  descripcion: '',
  tipo_adjudicacion: '',
  impuestos_adicionales: null,
  compromiso_mes: 0,
  tipo_proyecto: '',
  tipo_contratacion: '',
  numero_cotizacion: '',
  monto: null,
  estado: 'Nueva',
  probabilidad_exito: 0,
  competencia: '',
  proximos_pasos: '',
  fecha_cierre: '',
  motivo_no_adjudicacion: '',
  numero_oc_contrato: '',
  valor_oc_contrato: null,
  numero_pedidos: '',
  zona: '',
  owner: '',
});

const cargado = ref(false);

onMounted(async () => {
  const id = route.params.id;
  await cargarOportunidad(id);
});

async function cargarOportunidad(id) {
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/obtener`,
      { id: parseInt(id) },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 200) {
      const data = response.data.data;
      Object.assign(op, data);
      
      // Setear los valores de los selects con los IDs
      op.tipo_registro = data.tipo_registro_id;
      op.origen = data.origen_id;
      op.medio_identificacion = data.medio_identificacion_id;
      op.tiempo_ejecucion = data.tiempo_ejecucion_id;
      op.tipo_proyecto = data.tipo_proyecto_id;
      op.tipo_contratacion = data.tipo_contratacion_id;
      op.tipo_adjudicacion = data.tipo_adjudicacion_id;
      op.motivo_no_adjudicacion = data.motivo_no_adjudicacion_id;
      op.estado = data.estado_id;
      
      cargado.value = true;
    } else {
      alert(`Error: ${response.data.message}`);
      router.push('/oportunidades');
    }
  } catch (error) {
    console.error('Error cargando oportunidad:', error);
    alert('Error al cargar la oportunidad.');
    router.push('/oportunidades');
  }
}

// if (!existente) {
  //   alert('No se encontró la oportunidad.');
  //   router.push('/oportunidades');
  //   return;
  // }
  // Object.assign(op, existente);
  // cargado.value = true;
// });

async function guardar() {
  try {
    const response = await axios.post(
      `${apiUrl}/oportunidades/guardar`,
      op,
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    
    if (response.data.code === 201 || response.data.code === 200) {
      alert('Oportunidad actualizada exitosamente.');
      // Actualizar con la data devuelta
      if (response.data.data) {
        Object.assign(op, response.data.data);
      }
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('Error guardando oportunidad:', error);
    alert('Error al guardar la oportunidad.');
  }
}

function volverLista() {
  router.push('/oportunidades');
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleString('es-CO', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
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
  gap: 12px;
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

.fecha-creacion {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.fecha-creacion small {
  font-size: 11px;
  color: #7a7f8a;
}

.fecha-creacion strong {
  font-size: 13px;
  color: #2c425c;
}

.actions {
  display: flex;
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

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-outline {
  border-radius: 999px;
  padding: 6px 16px;
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
