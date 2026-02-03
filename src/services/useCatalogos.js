// src/services/useCatalogos.js
import { ref } from 'vue';
import axios from 'axios';
import apiUrl from '../../config.js';

// Estados compartidos (singleton)
const catalogos = ref({
  tipoRegistros: [],
  origenes: [],
  mediosIdentificacion: [],
  tiemposEjecucion: [],
  tiposProyecto: [],
  tiposContratacion: [],
  tiposAdjudicacion: [],
  motivosNoAdjudicacion: [],
  estados: [],
  resultadosVisitas: []
});

const isLoading = ref(false);
const isLoaded = ref(false);
const error = ref(null);

export function useCatalogos() {
  
  const cargarCatalogos = async () => {
    if (isLoaded.value) {
      return catalogos.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${apiUrl}/catalogos/todos`, {}, {
        headers: {
          Accept: "application/json",
        }
      });

      if (response.data.code === 200) {
        catalogos.value = response.data.data;
        isLoaded.value = true;
      } else {
        throw new Error(response.data.message || 'Error al cargar catálogos');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error cargando catálogos:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }

    return catalogos.value;
  };

  const cargarCatalogoIndividual = async (nombreCatalogo) => {
    try {
      const response = await axios.post(`${apiUrl}/catalogos/${nombreCatalogo}`, {}, {
        headers: {
          Accept: "application/json",
        }
      });

      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Error al cargar ${nombreCatalogo}`);
      }
    } catch (err) {
      console.error(`Error cargando ${nombreCatalogo}:`, err);
      throw err;
    }
  };

  return {
    catalogos,
    isLoading,
    isLoaded,
    error,
    cargarCatalogos,
    cargarCatalogoIndividual
  };
}
