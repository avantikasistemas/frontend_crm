<!-- src/components/layout/Topbar.vue -->
<template>
  <header class="topbar">
    <div class="brand">
      <div class="logo">CRM</div>
      <div class="titles">
        <span class="title">CRM · Avantika</span>
        <span class="subtitle">Oportunidades & Visitas</span>
      </div>
    </div>
  </header>
</template>

<script setup>
// Podrías luego conectar el botón a limpieza de localStorage si quieres
</script>

<style scoped>
.topbar {
  height: 56px;
  background: #2c425c;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}

.titles {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 15px;
  font-weight: 600;
}

.subtitle {
  font-size: 11px;
  opacity: 0.8;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill-pill {
  font-size: 11px;
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #ffffff;
  cursor: pointer;
}
.pill-pill:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
