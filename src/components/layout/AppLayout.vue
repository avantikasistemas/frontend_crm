<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="app-shell">
    <Topbar />

    <div class="body">
      <Sidebar />

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Topbar from './Topbar.vue';
import Sidebar from './Sidebar.vue';
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f6f7fb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}
</style>
