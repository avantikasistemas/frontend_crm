<!-- src/pages/OportunidadNueva.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Nueva Oportunidad</h1>
        <p>Crear una nueva oportunidad con estado inicial "Nueva".</p>
      </div>
      <div v-if="op.created_at" class="fecha-creacion">
        <small>Fecha de creación:</small>
        <strong>{{ formatearFecha(op.created_at) }}</strong>
      </div>
    </header>

    <FormularioOportunidad
      :op="op"
      modo="create"
      @save="guardar"
      @cancel="volverLista"
    />
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import apiUrl from '../../config.js';
import FormularioOportunidad from '../components/oportunidad/FormularioOportunidad.vue';
import { useCatalogos } from '../services/useCatalogos.js';

const router = useRouter();
const { catalogos, cargarCatalogos, isLoaded: catalogosCargados } = useCatalogos();

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

onMounted(async () => {
  // Cargar catálogos una sola vez para todos los componentes hijos
  await cargarCatalogos();
});

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
    
    if (response.data.code === 201) {
      // Actualizar el objeto con la data devuelta
      Object.assign(op, response.data.data);
      alert('Oportunidad creada exitosamente.');
      // No redirigir, quedarse en la misma vista
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
</style>
