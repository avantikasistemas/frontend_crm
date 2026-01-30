// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

import OportunidadesLista from '../pages/OportunidadesLista.vue';
import OportunidadNueva from '../pages/OportunidadNueva.vue';
import OportunidadDetalle from '../pages/OportunidadDetalle.vue';
import VisitasClientesLista from '../pages/VisitasClientesLista.vue';
import VisitasOportunidadLista from '../pages/VisitasOportunidadLista.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/oportunidades' },
    { path: '/oportunidades', name: 'OportunidadesLista', component: OportunidadesLista },
    { path: '/oportunidades/nueva', name: 'OportunidadNueva', component: OportunidadNueva },
    { path: '/oportunidades/:id', name: 'OportunidadDetalle', component: OportunidadDetalle },
    { path: '/visitas/clientes', name: 'VisitasClientesLista', component: VisitasClientesLista },
    { path: '/visitas/oportunidades', name: 'VisitasOportunidadLista', component: VisitasOportunidadLista },
  ],
  scrollBehavior() { return { top: 0 } }
});

export default router;
