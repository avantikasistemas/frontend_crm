<!-- src/components/oportunidad/PipelineEstados.vue -->
<template>
  <div class="pipeline">
    <div
      v-for="estado in estados"
      :key="estado.id"
      class="step"
      :class="{
        active: estado.id === estadoActual,
        done: isDone(estado),
      }"
    >
      <div class="bullet"></div>
      <div class="label">{{ estado.nombre }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  estadoActual: {
    type: Number,
    required: true,
  },
  estados: {
    type: Array,
    required: true,
  },
});

function isDone(estado) {
  const idxActual = props.estados.findIndex(e => e.id === props.estadoActual);
  const idx = props.estados.findIndex(e => e.id === estado.id);
  return idx !== -1 && idx < idxActual;
}
</script>

<style scoped>
.pipeline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.55;
  font-size: 11px;
}

.step .bullet {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid #c6ccd8;
}

.step.active {
  opacity: 1;
  font-weight: 600;
}

.step.active .bullet {
  border-color: #2c425c;
  background: #2c425c;
}

.step.done {
  opacity: 0.9;
}

.step.done .bullet {
  border-color: #2c425c;
  background: #ffffff;
}
</style>
