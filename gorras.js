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
        precio: 489,
        precioOriginal: 699,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra1.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Gorra Negra",
        descripcion: "Gorra clásica de estilo urbano.",
        precio: 699,
        enOferta: false,
        imagen: "Gorra2.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Jonas Hats",
        descripcion: "Gorra deportiva.",
        precio: 485,
        precioOriginal: 649,
        descuento: 25,
        enOferta: true,
        imagen: "Gorra4.jpeg",
        categoria: "temporada"
    },
    {
        nombre: "Gorra YOSHI",
        descripcion: "Gorra Nintendo EDICION YOSHI",
        precio: 550,
        enOferta: false,
        imagen: "Gorra5.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra MARIO",
        descripcion: "Gorra Nintendo EDICION MARIO",
        precio: 385,
        precioOriginal: 550,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra6.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra HATSUNE MIKU",
        descripcion: "Gorra CRYPON FUTURE MEDIA EDICION HATSUNE MIKU",
        precio: 420,
        precioOriginal: 600,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra7.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra KOOPA TROOPA",
        descripcion: "Gorra Nintendo EDICION KOOPA TROOPA.",
        precio: 530,
        enOferta: false,
        imagen: "Gorra8.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Gorra KIRBY",
        descripcion: "Gorra Nintendo EDICION KIRBY.",
        precio: 349,
        precioOriginal: 499,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra3.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "AB Gothic Pink Dragon",
        descripcion: "Gorra con bordado gótico AB, detalles en rosa y malla con dragones orientales.",
        precio: 699,
        enOferta: false,
        imagen: "Gorra9.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Thorns & Red Star",
        descripcion: "Gorra urbana con estrella de estoperoles rojos y espinas bordadas en negro.",
        precio: 650,
        enOferta: false,
        imagen: "Gorra10.jpeg",
        categoria: "temporada"
    },
    {
        nombre: "Katakana Red Flower",
        descripcion: "Gorra de gabardina con tipografía katakana roja y parches bordados 'W.W'.",
        precio: 600,
        enOferta: false,
        imagen: "Gorra11.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Rico Muerte Distressed",
        descripcion: "Gorra con visera rota deshilachada, pines metálicos y bordado 'Rico Muerte'.",
        precio: 525,
        precioOriginal: 750,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra12.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Anymore Club Gothic Bats",
        descripcion: "Gorra gótica con bordado negro 'The Anymore Club' y alas de murciélago.",
        precio: 490,
        precioOriginal: 700,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra13.jpeg",
        categoria: "temporada"
    },
    {
        nombre: "Sad Boy Rhinestones",
        descripcion: "Gorra oscura con trébol de pedrería fina brillante y dibujos bordados a tono.",
        precio: 699,
        enOferta: false,
        imagen: "Gorra14.jpeg",
        categoria: "originales"
    },
    {
        nombre: "FP Studded Gold Flame",
        descripcion: "Gorra con monograma gótico FP, pedrería negra y flamas doradas bordadas.",
        precio: 560,
        precioOriginal: 800,
        descuento: 30,
        enOferta: true,
        imagen: "Gorra15.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Silver Flames 32",
        descripcion: "Gorra negra con tipografía metálica plateada, flamas y número 32 en visera.",
        precio: 649,
        enOferta: false,
        imagen: "Gorra16.jpeg",
        categoria: "originales"
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
    const esPaginaOfertas = window.location.pathname.includes("ofertas.html");

    if (esPaginaOfertas) {
        // Inicializar la página de ofertas
        if (contenedorPrincipal) {
            contenedorPrincipal.innerHTML = `
                <section class="seccion-carrusel">
                    <h2 class="seccion-titulo">Ofertas Especiales - Con Descuentos Exclusivos</h2>
                    <div class="ofertas-grid" id="grid-ofertas"></div>
                </section>
            `;
            const grid = document.getElementById("grid-ofertas");
            const productosOferta = productos.filter(p => p.enOferta);
            renderizarGridOfertas(productosOferta, grid);
        }
        inicializarBuscador();
        return;
    }

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

function renderizarGridOfertas(listaAImprimir, grid) {
    grid.innerHTML = '';

    if (listaAImprimir.length === 0) {
        grid.innerHTML = '<p style="color: #aaa; text-align: center; width: 100%; padding: 40px 0;">No se encontraron gorras en oferta.</p>';
        return;
    }

    listaAImprimir.forEach((producto) => {
        const indexOriginal = productos.findIndex(p => p.nombre === producto.nombre && p.imagen === producto.imagen);

        grid.innerHTML += `
            <div class="card card-oferta">
                <span class="badge-oferta">🔥 -${producto.descuento}% OFF</span>
                <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})">
                <div class="info">
                    <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                    <p>${producto.descripcion}</p>
                    <div class="precio-container">
                        <span class="precio-actual">$${producto.precio} MXN</span>
                        <span class="precio-original">$${producto.precioOriginal} MXN</span>
                    </div>
                    <button 
                        class="comprar"
                        onclick='procesarCompraDirecta(${JSON.stringify(producto)})'>
                        Comprar
                    </button>
                </div>
            </div>
        `;
    });
}

// ==========================================
// RENDERIZADO DEL CONTENIDO DE TARJETAS (FILTRABLE)
// ==========================================
function renderizarCatalogo(listaAImprimir) {
    const esPaginaOfertas = window.location.pathname.includes("ofertas.html");
    if (esPaginaOfertas) {
        const grid = document.getElementById("grid-ofertas");
        if (grid) {
            renderizarGridOfertas(listaAImprimir.filter(p => p.enOferta), grid);
        }
        return;
    }

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

            let badgeHTML = '';
            let precioHTML = `<div class="precio">$${producto.precio} MXN</div>`;

            if (producto.enOferta) {
                badgeHTML = `<span class="badge-oferta">🔥 -${producto.descuento}% OFF</span>`;
                precioHTML = `
                    <div class="precio-container">
                        <span class="precio-actual">$${producto.precio} MXN</span>
                        <span class="precio-original">$${producto.precioOriginal} MXN</span>
                    </div>
                `;
            }

            trackDestino.innerHTML += `
                <div class="card ${producto.enOferta ? 'card-oferta' : ''}">
                    ${badgeHTML}
                    <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})">
                    <div class="info">
                        <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                        <p>${producto.descripcion}</p>
                        ${precioHTML}
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

    if (prod.enOferta) {
        modalPrecio.innerHTML = `
            <div class="modal-precio-container">
                <span class="modal-precio-actual">$${prod.precio} MXN</span>
                <span class="modal-precio-original">$${prod.precioOriginal} MXN</span>
                <span class="modal-badge-descuento">-${prod.descuento}% OFF</span>
            </div>
        `;
    } else {
        modalPrecio.innerText = `$${prod.precio} MXN`;
    }

    modalDescripcion.innerText = prod.descripcion;

    const acordeones = document.querySelectorAll('.acordeon-item');
    acordeones.forEach(item => item.classList.remove('activo'));

    modalBtnAgregar.onclick = function () {
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