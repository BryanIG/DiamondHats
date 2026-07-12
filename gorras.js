// ==========================================
// CONFIGURACIÓN DE CATEGORÍAS
// ==========================================
const categorias = {
    originales: "Gorras Originales",
    temporada: "Gorras De Temporada",
    colaboraciones: "Colaboraciones Especiales",
};

// ==========================================
// CATÁLOGO DE PRODUCTOS
// ==========================================
const productos = [
    {
        nombre: "Negra y Blanca",
        descripcion: "Diseño moderno para cualquier ocasión.",
        precio: 699,
        imagen: "Gorra1.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Gorra Negra",
        descripcion: "Gorra clásica de estilo urbano.",
        precio: 699,
        imagen: "Gorra2.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Jonas Hats",
        descripcion: "Gorra deportiva.",
        precio: 649,
        imagen: "Gorra4.jpeg",
        categoria: "temporada"
    },
    {
        nombre: "Gorra YOSHI",
        descripcion: "Gorra Nintendo EDICION YOSHI",
        precio: 550,
        imagen: "Gorra5.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra MARIO",
        descripcion: "Gorra Nintendo EDICION MARIO",
        precio: 550,
        imagen: "Gorra6.jpeg",
        categoria: "colaboraciones"
    },  
    {
        nombre: "Gorra HATSUNE MIKU",
        descripcion: "Gorra CRYPON FUTURE MEDIA EDICION HATSUNE MIKU",         
        precio: 600,
        imagen: "Gorra7.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra KOOPA TROOPA",
        descripcion: "Gorra Nintendo EDICION KOOPA TROOPA.",                 
        precio: 530,
        imagen: "Gorra8.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra KIRBY",
        descripcion: "Gorra Nintendo EDICION KIRBY.",
        precio: 499,
        imagen: "Gorra3.jpeg",
        categoria: "colaboraciones"
    },
];

const contenedorPrincipal = document.getElementById("contenedor-productos");

// Elementos del Modal y Avisos
const modal = document.getElementById("modal-producto");
const modalImgPrincipal = document.getElementById("modal-main-img");
const modalNombre = document.getElementById("modal-nombre");
const modalPrecio = document.getElementById("modal-precio");
const modalDescripcion = document.getElementById("modal-descripcion");
const modalBtnAgregar = document.getElementById("modal-btn-agregar");
const btnCerrarModal = document.getElementById("cerrar-modal");

const toastNotificacion = document.getElementById("toast-notificacion");
const carritoLateral = document.getElementById("carrito");

// ==========================================
// RENDERIZADO INICIAL DE LA MAQUETA BASE
// ==========================================
function inicializarTienda() {
    contenedorPrincipal.innerHTML = '';
    
    // 1. Renderizar la estructura base de las secciones una sola vez
    Object.keys(categorias).forEach(claveCat => {
        contenedorPrincipal.innerHTML += `
            <section class="seccion-carrusel" id="seccion-${claveCat}">
                <h2 class="seccion-titulo">${categorias[claveCat]}</h2>
                <div class="carrusel-contenedor">
                    <button class="carrusel-btn prev" id="btn-prev-${claveCat}" onclick="desplazarCarrusel('${claveCat}', 'izquierda')">➔</button>
                    <div class="carrusel-track" id="track-${claveCat}"></div>
                    <button class="carrusel-btn next" id="btn-next-${claveCat}" onclick="desplazarCarrusel('${claveCat}', 'derecha')">➔</button>
                </div>
            </section>
        `;
    });

    // 2. Adjuntar los escuchadores de scroll a los tracks
    setTimeout(() => {
        Object.keys(categorias).forEach(claveCat => {
            const track = document.getElementById(`track-${claveCat}`);
            const btnPrev = document.getElementById(`btn-prev-${claveCat}`);
            
            if (track && btnPrev) {
                track.addEventListener("scroll", () => {
                    if (track.scrollLeft > 10) {
                        btnPrev.style.display = "flex";
                    } else {
                        btnPrev.style.display = "none";
                    }
                });
            }
        });
    }, 0);

    // 3. Cargar todo el catálogo completo al iniciar
    renderizarCatalogo(productos);
    
    // 4. Configurar el buscador en tiempo real
    inicializarBuscador();
}

// ==========================================
// RENDERIZADO DEL CONTENIDO DE TARJETAS (FILTRABLE)
// ==========================================
function renderizarCatalogo(listaAImprimir) {
    // Limpiar tracks y ocultar secciones por defecto
    Object.keys(categorias).forEach(claveCat => {
        const track = document.getElementById(`track-${claveCat}`);
        const seccion = document.getElementById(`seccion-${claveCat}`);
        if (track) track.innerHTML = '';
        if (seccion) seccion.style.display = 'none';
    });

    // Inyectar tarjetas coincidentes
    listaAImprimir.forEach((producto) => {
        const trackDestino = document.getElementById(`track-${producto.categoria}`);
        const seccionDestino = document.getElementById(`seccion-${producto.categoria}`);
        
        // Mapear el índice al array principal original para que el modal funcione perfecto
        const indexOriginal = productos.findIndex(p => p.nombre === producto.nombre && p.imagen === producto.imagen);

        if (trackDestino) {
            if (seccionDestino) seccionDestino.style.display = 'block'; // Mostrar la fila si tiene productos
            
            trackDestino.innerHTML += `
                <div class="card">
                    <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})">
                    <div class="info">
                        <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                        <p>${producto.descripcion}</p>
                        <div class="precio">$${producto.precio} MXN</div>
                        <button 
                            class="comprar"
                            onclick='procesarCompraDirecta(${JSON.stringify(producto)})'>
                            Comprar
                        </button>
                    </div>
                </div>
            `;
        }
    });
}

// ==========================================
// LOGICA DE BUSCADOR EN TIEMPO REAL
// ==========================================
function inicializarBuscador() {
    const inputBuscador = document.getElementById("buscador-gorras");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", (e) => {
            const busqueda = e.target.value.toLowerCase().trim();
            
            const productosFiltrados = productos.filter(producto => 
                producto.nombre.toLowerCase().includes(busqueda) || 
                producto.descripcion.toLowerCase().includes(busqueda)
            );
            
            renderizarCatalogo(productosFiltrados);
        });
    }
}

// ==========================================
// CONTROL DE DESPLAZAMIENTO (FLECHAS)
// ==========================================
function desplazarCarrusel(categoria, direccion) {
    const track = document.getElementById(`track-${categoria}`);
    if (track) {
        const distancia = 600; 
        if (direccion === 'derecha') {
            track.scrollLeft += distancia;
        } else {
            track.scrollLeft -= distancia;
        }
    }
}

// ==========================================
// DISPARADOR DE AVISO TOAST
// ==========================================
function dispararToastExito() {
    if (toastNotificacion) {
        toastNotificacion.classList.add("mostrar");
        setTimeout(() => {
            toastNotificacion.classList.remove("mostrar");
        }, 2800);
    }
}

// ==========================================
// INTERACTIVIDAD DEL MODAL
// ==========================================
function abrirModalDetalle(index) {
    const prod = productos[index];

    modalImgPrincipal.src = `Imagenes page/${prod.imagen}`;
    modalImgPrincipal.alt = prod.nombre;
    modalNombre.innerText = prod.nombre;
    modalPrecio.innerText = `$${prod.precio} MXN`;
    modalDescripcion.innerText = prod.descripcion;

    const acordeones = document.querySelectorAll('.acordeon-item');
    acordeones.forEach(item => item.classList.remove('activo'));

    modalBtnAgregar.onclick = function() {
        agregarCarrito({
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            precio: prod.precio,
            imagen: prod.imagen
        });

        cerrarModalDetalle();
        dispararToastExito();

        if (carritoLateral) {
            carritoLateral.classList.add("activo");
        }
    };

    modal.classList.add("activo");
}

function procesarCompraDirecta(producto) {
    agregarCarrito({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen: producto.imagen
    });
    
    dispararToastExito();
    
    if (carritoLateral) {
        carritoLateral.classList.add("activo");
    }
}

// ==========================================
// ACORDEÓN INTERACTIVO
// ==========================================
function conmutarAcordeon(elementoHeader) {
    const itemActual = elementoHeader.parentElement;
    const estaActivo = itemActual.classList.contains('activo');
    
    const todosLosItems = document.querySelectorAll('.acordeon-item');
    todosLosItems.forEach(item => item.classList.remove('activo'));

    if (!estaActivo) {
        itemActual.classList.add('activo');
    }
}

function cerrarModalDetalle() {
    modal.classList.remove("activo");
}

btnCerrarModal.addEventListener("click", cerrarModalDetalle);

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        cerrarModalDetalle();
    }
});

// Arrancar proceso global
inicializarTienda();

// ==========================================
// BOTÓN VOLVER
// ==========================================
const botonVolver = document.getElementById("volver");
if (botonVolver) {
    botonVolver.addEventListener("click", () => {
        window.location.href = "tienda.html";
    });
}