<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <nav>
      <RouterLink
        to="/oportunidades"
        class="nav-item"
        active-class="nav-item-active"
      >
        <span class="icon">◎</span>
        <span>Oportunidades</span>
      </RouterLink>

      <RouterLink
        to="/visitas/clientes"
        class="nav-item"
        active-class="nav-item-active"
      >
        <span class="icon">👥</span>
        <span>Visitas (Clientes)</span>
      </RouterLink>

      <RouterLink
        to="/visitas/oportunidades"
        class="nav-item"
        active-class="nav-item-active"
      >
        <span class="icon">📌</span>
        <span>Visitas (Oportunidades)</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e0e3ec;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  color: #2c425c;
  font-size: 14px;
  text-decoration: none;
}

.nav-item:hover {
  background: #f0f2f8;
}

.nav-item-active {
  background: #2c425c;
  color: #ffffff;
}

.icon {
  width: 20px;
  text-align: center;
  font-size: 14px;
}
</style>
