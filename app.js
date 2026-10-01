import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ======================================================
// 1. PEGÁ AQUÍ LOS DATOS DE TU PROYECTO SUPABASE
// ======================================================
const SUPABASE_URL = "PEGAR_AQUI_TU_PROJECT_URL";
const SUPABASE_ANON_KEY = "PEGAR_AQUI_TU_ANON_PUBLIC_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del HTML
const formulario = document.getElementById("formulario");
const tabla = document.getElementById("tabla");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const titulo = document.getElementById("titulo-formulario");

const buscar = document.getElementById("buscar");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroEstado = document.getElementById("filtro-estado");

// Cargar datos al abrir la página
document.addEventListener("DOMContentLoaded", cargarComponentes);

// ======================================================
// 2. ALTA / CREAR
// ======================================================
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("id").value;

  const datos = {
    codigo: document.getElementById("codigo").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value,
    marca: document.getElementById("marca").value.trim(),
    cantidad: Number(document.getElementById("cantidad").value),
    estado: document.getElementById("estado").value,
    descripcion: document.getElementById("descripcion").value.trim()
  };

  // Validaciones
  if (!datos.codigo || !datos.nombre || !datos.categoria || !datos.estado) {
    mostrarMensaje("Completá los campos obligatorios.", true);
    return;
  }

  if (!Number.isInteger(datos.cantidad) || datos.cantidad < 0) {
    mostrarMensaje("La cantidad debe ser un número entero igual o mayor que 0.", true);
    return;
  }

  let error;

  if (id) {
    // MODIFICAR
    ({ error } = await supabase
      .from("componentes")
      .update(datos)
      .eq("id", id));
  } else {
    // CREAR
    ({ error } = await supabase
      .from("componentes")
      .insert([datos]));
  }

  if (error) {
    mostrarMensaje("Error: " + error.message, true);
    return;
  }

  mostrarMensaje(id ? "Registro actualizado correctamente." : "Registro creado correctamente.");
  limpiarFormulario();
  await cargarComponentes();
});

// ======================================================
// 3. LISTADO / CONSULTAR
// ======================================================
async function cargarComponentes() {
  const { data, error } = await supabase
    .from("componentes")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    mostrarMensaje("No se pudieron cargar los datos: " + error.message, true);
    return;
  }

  mostrarTabla(data);
}

// ======================================================
// 4. BÚSQUEDA Y FILTROS
// ======================================================
function aplicarFiltros(data) {
  const texto = buscar.value.toLowerCase().trim();
  const categoria = filtroCategoria.value;
  const estado = filtroEstado.value;

  return data.filter(item => {
    const coincideTexto =
      !texto ||
      item.codigo.toLowerCase().includes(texto) ||
      item.nombre.toLowerCase().includes(texto) ||
      (item.marca || "").toLowerCase().includes(texto);

    const coincideCategoria =
      !categoria || item.categoria === categoria;

    const coincideEstado =
      !estado || item.estado === estado;

    return coincideTexto && coincideCategoria && coincideEstado;
  });
}

// ======================================================
// 5. MOSTRAR TABLA
// ======================================================
function mostrarTabla(data) {
  const filtrados = aplicarFiltros(data);

  tabla.innerHTML = "";

  if (filtrados.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="7">No se encontraron registros.</td>
      </tr>
    `;
    return;
  }

  filtrados.forEach(item => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${escaparHTML(item.codigo)}</td>
      <td>${escaparHTML(item.nombre)}</td>
      <td>${escaparHTML(item.categoria)}</td>
      <td>${escaparHTML(item.marca || "-")}</td>
      <td>${item.cantidad}</td>
      <td>${escaparHTML(item.estado)}</td>
      <td>
        <div class="acciones">
          <button class="editar" data-id="${item.id}">Editar</button>
          <button class="eliminar" data-id="${item.id}">Eliminar</button>
        </div>
      </td>
    `;

    fila.querySelector(".editar").addEventListener("click", () => editar(item));
    fila.querySelector(".eliminar").addEventListener("click", () => eliminar(item.id));

    tabla.appendChild(fila);
  });
}

// ======================================================
// 6. EDITAR
// ======================================================
function editar(item) {
  document.getElementById("id").value = item.id;
  document.getElementById("codigo").value = item.codigo;
  document.getElementById("nombre").value = item.nombre;
  document.getElementById("categoria").value = item.categoria;
  document.getElementById("marca").value = item.marca || "";
  document.getElementById("cantidad").value = item.cantidad;
  document.getElementById("estado").value = item.estado;
  document.getElementById("descripcion").value = item.descripcion || "";

  titulo.textContent = "Modificar componente";
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ======================================================
// 7. ELIMINAR
// ======================================================
async function eliminar(id) {
  const confirmar = confirm("¿Seguro que querés eliminar este registro?");

  if (!confirmar) return;

  const { error } = await supabase
    .from("componentes")
    .delete()
    .eq("id", id);

  if (error) {
    mostrarMensaje("No se pudo eliminar: " + error.message, true);
    return;
  }

  mostrarMensaje("Registro eliminado correctamente.");
  await cargarComponentes();
}

// ======================================================
// 8. CANCELAR EDICIÓN
// ======================================================
btnCancelar.addEventListener("click", limpiarFormulario);

function limpiarFormulario() {
  formulario.reset();
  document.getElementById("id").value = "";
  document.getElementById("cantidad").value = 0;
  titulo.textContent = "Registrar componente";
  btnGuardar.textContent = "Guardar";
  btnCancelar.classList.add("hidden");
}

// ======================================================
// 9. MENSAJES
// ======================================================
function mostrarMensaje(texto, error = false) {
  mensaje.textContent = texto;
  mensaje.style.color = error ? "#dc2626" : "#15803d";

  setTimeout(() => {
    mensaje.textContent = "";
  }, 4000);
}

// ======================================================
// 10. EVITAR HTML INYECTADO EN LA TABLA
// ======================================================
function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Los filtros actualizan la tabla.
// Se vuelve a consultar la nube para mantener el código sencillo.
let temporizador;

[buscar, filtroCategoria, filtroEstado].forEach(control => {
  control.addEventListener("input", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarComponentes, 150);
  });
});
