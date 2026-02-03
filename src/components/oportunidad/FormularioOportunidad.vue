<!-- src/components/oportunidad/FormularioOportunidad.vue -->
<template>
  <form class="form-op" @submit.prevent="onSubmit">
    <div class="columns">
      <SeccionInformacionOportunidad :op="op" />

      <SeccionGestionOportunidad :op="op" :estados="estados" />
    </div>

    <div v-if="errores.length" class="errors">
      <ul>
        <li v-for="err in errores" :key="err">{{ err }}</li>
      </ul>
    </div>

    <div class="footer-actions">
      <button type="button" class="btn-outline" @click="volverLista">
        Volver
      </button>
      <button type="submit" class="btn-primary">
        Guardar oportunidad
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SeccionInformacionOportunidad from './SeccionInformacionOportunidad.vue';
import SeccionGestionOportunidad from './SeccionGestionOportunidad.vue';
import { useCatalogos } from '../../services/useCatalogos.js';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  op: {
    type: Object,
    required: true,
  },
  modo: {
    type: String,
    default: 'edit', // 'create' | 'edit'
  },
});

const emit = defineEmits(['save', 'cancel']);

// Cargar catálogos desde la BD (ya cargados por el componente padre)
const { catalogos } = useCatalogos();
const estados = ref([]);

// Cargar estados al montar el componente
onMounted(async () => {
  try {
    // Los catálogos ya están cargados por el componente padre
    estados.value = catalogos.value.estados;
  } catch (error) {
    console.error('Error accediendo a estados:', error);
  }
});

const errores = ref([]);

function onSubmit() {
  errores.value = [];

  if (!props.op.nombre_oportunidad) {
    errores.value.push('El nombre de la oportunidad es obligatorio.');
  }
  if (!props.op.empresa_nombre) {
    errores.value.push('La empresa es obligatoria.');
  }
  if (props.op.estado_nombre === 'Cerrada Perdida' && !props.op.motivo_no_adjudicacion) {
    errores.value.push(
      'Debe seleccionar un motivo de no adjudicación cuando la oportunidad está "Cerrada Perdida".'
    );
  }
  if (
    props.op.probabilidad_exito != null &&
    (props.op.probabilidad_exito < 0 || props.op.probabilidad_exito > 100)
  ) {
    errores.value.push('La probabilidad de éxito debe estar entre 0 y 100%.');
  }

  if (errores.value.length) return;

  emit('save');
}

function volverLista() {
  router.push('/oportunidades');
}
</script>

<style scoped>
.form-op {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.1fr);
  gap: 16px;
}

@media (max-width: 1000px) {
  .columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

.errors {
  border-radius: 12px;
  border: 1px solid #eab0b0;
  background: #fff5f5;
  padding: 8px 10px;
  font-size: 12px;
  color: #822525;
}

.errors ul {
  margin: 0;
  padding-left: 18px;
}

.footer-actions {
  margin-top: 4px;
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
