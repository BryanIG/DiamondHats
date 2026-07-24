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
        nombre: "Golden Eagle",
        descripcion: "Gorra deportiva de lujo. Bordados Gold Edition en hilos metálicos 24k.",
        precio: 950,
        enOferta: false,
        imagen: "Gorra4.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Royal Gold Crown",
        descripcion: "Corona bordada frontal Gold Edition premium. La joya de la colección.",
        precio: 1200,
        precioOriginal: 1600,
        descuento: 25,
        enOferta: true,
        imagen: "Gorra15.jpeg",
        categoria: "colaboraciones"
    },
    {
        nombre: "Phantom Black Edition",
        descripcion: "Gorra ultra negra mate estilo Phantom Black, elegancia pura.",
        precio: 850,
        enOferta: false,
        imagen: "Gorra1.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Obsidian Black",
        descripcion: "Minimalista. Modelo Black Collection de tela premium eco-friendly.",
        precio: 720,
        enOferta: false,
        imagen: "Gorra2.jpeg",
        categoria: "originales"
    },
    {
        nombre: "Shadow Black",
        descripcion: "Edición Limitada Black Panther Shadow. Oscuridad absoluta.",
        precio: 499,
        precioOriginal: 890,
        descuento: 45,
        enOferta: true,
        imagen: "Gorra9.jpeg",
        categoria: "temporada"
    },
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
        if (contenedorPrincipal) {
            const token = localStorage.getItem("token");
            if (!token) {
                contenedorPrincipal.innerHTML = `
                 <div class="auth-lock-container">
                    <h2>Inicia Sesión para desbloquear ofertas exclusivas</h2>
                    <p style="color: #666; margin-bottom: 20px;">Crea una cuenta o inicia sesión desde tu perfil para acceder a nuestros descuentos.</p>
                 </div>`;
            } else {
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
        }
        inicializarBuscador();
        return;
    }

    contenedorPrincipal.innerHTML = '';

    // 1. Renderizar la estructura base de las secciones una sola vez
    Object.keys(categorias).forEach((claveCat, index) => {
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

        if (index === 0) {
            contenedorPrincipal.innerHTML += `
                <div class="video-seccion-banner">
                    <video autoplay loop muted playsinline class="banner-video">
                        <source src="Imagenes page/videosecciongorras.mp4" type="video/mp4">
                    </video>
                    <div class="banner-video-overlay"></div>
                    <div class="banner-video-text">
                        <h2>Estilo Incomparable</h2>
                        <p>Lleva tu look al siguiente nivel con Diamond Hats</p>
                    </div>
                </div>
            `;
        }
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
            <div class="card card-oferta" data-index="${indexOriginal}">
                <button class="btn-favorito" onclick="toggleFavorito(${indexOriginal}, event)">🤍</button>
                <span class="badge-oferta">🔥 -${producto.descuento}% OFF</span>
                <div class="img-container">
                    <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})">
                </div>
                <div class="info">
                    <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                    <p>${producto.descripcion}</p>
                    <div class="precio-container">
                        <span class="precio-actual">$${producto.precio} MXN</span>
                        <span class="precio-original">$${producto.precioOriginal} MXN</span>
                    </div>
                    <button 
                        class="comprar"
                        onclick="procesarCompraDirecta(${indexOriginal})">
                        Comprar
                    </button>
                </div>
            </div>
        `;
    });
    sincronizarFavoritosVisuales();
}

window.toggleFavorito = function (index, e) {
    if (e) e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    if (favs.includes(index)) {
        favs = favs.filter(id => id !== index);
    } else {
        favs.push(index);
    }
    localStorage.setItem("favoritos", JSON.stringify(favs));
    sincronizarFavoritosVisuales();

    // Refresh sidebar rendering if it's currently open
    if (typeof renderizarFavoritosSidebar === 'function') {
        const favRow = document.getElementById("profile-favoritos-grid");
        if (favRow) renderizarFavoritosSidebar();
    }
};

window.sincronizarFavoritosVisuales = function () {
    let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    document.querySelectorAll(".card").forEach(card => {
        const idx = parseInt(card.getAttribute("data-index"));
        const btn = card.querySelector(".btn-favorito");
        if (btn) {
            if (favs.includes(idx)) {
                btn.classList.add("active");
                btn.innerText = "❤";
            } else {
                btn.classList.remove("active");
                btn.innerText = "🤍";
            }
        }
    });
};

window.renderizarFavoritosSidebar = function () {
    const grid = document.getElementById("profile-favoritos-grid");
    if (!grid) return;

    let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    grid.innerHTML = '';

    if (favs.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center;">No tienes gorras en tus favoritos. Explora y presiona 🤍 para agregarlas.</p>';
        return;
    }

    favs.forEach(indexOriginal => {
        const producto = productos[indexOriginal];
        if (!producto) return;
        grid.innerHTML += `
            <div class="card" style="margin: 0; min-height: auto; flex: none; display:flex; flex-direction:row; background:rgba(0,0,0,0.05); padding:10px; border-radius:10px; position:relative; overflow:visible;">
                <button style="position:absolute; right:-5px; top:-5px; background:#fff; border:1px solid #ddd; border-radius:50%; width:25px; height:25px; cursor:pointer; color:#ff4757; box-shadow:0 2px 5px rgba(0,0,0,0.2); font-size:12px; display:flex; align-items:center; justify-content:center; z-index:5;" onclick="toggleFavorito(${indexOriginal}, event)">✖</button>
                <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})" style="width:70px; height:70px; object-fit:cover; border-radius:8px; cursor:pointer; margin-right:15px; border: 1px solid rgba(0,0,0,0.1);">
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                    <h3 style="font-size:14px; margin-bottom:5px; margin-top:0; color:#333;">${producto.nombre}</h3>
                    <p style="font-weight:bold; color:#cca142; margin:0; font-size:13px;">$${producto.precio} MXN</p>
                    <button class="comprar" onclick="procesarCompraDirecta(${indexOriginal})" style="padding:4px 8px; font-size:11px; margin-top:8px; width:fit-content; background:#cca142; color:#fff; border:none; border-radius:4px; cursor:pointer;">Comprar</button>
                </div>
            </div>
         `;
    });
};

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
                <div class="card ${producto.enOferta ? 'card-oferta' : ''}" data-index="${indexOriginal}">
                    <button class="btn-favorito" onclick="toggleFavorito(${indexOriginal}, event)">🤍</button>
                    ${badgeHTML}
                    <div class="img-container">
                        <img src="Imagenes page/${producto.imagen}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})">
                    </div>
                    <div class="info">
                        <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                        <p>${producto.descripcion}</p>
                        ${precioHTML}
                        <button 
                            class="comprar"
                            onclick="procesarCompraDirecta(${indexOriginal})">
                            Comprar
                        </button>
                    </div>
                </div>
            `;
        }
    });
    sincronizarFavoritosVisuales();
}

// ==========================================
// LOGICA DE NUEVO BUSCADOR (FILTROS RÁPIDOS)
// ==========================================
function inicializarBuscador() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Quitar estilo activo de todos
                filterBtns.forEach(b => b.classList.remove("active"));
                // Agregar activo al seleccionado
                btn.classList.add("active");

                const filtro = btn.getAttribute("data-filter").toLowerCase();

                if (filtro === "all") {
                    renderizarCatalogo(productos);
                    return;
                }

                // Filtrar por término
                const productosFiltrados = productos.filter(producto =>
                    producto.nombre.toLowerCase().includes(filtro) ||
                    producto.descripcion.toLowerCase().includes(filtro) ||
                    producto.categoria.toLowerCase().includes(filtro)
                );

                renderizarCatalogo(productosFiltrados);
            });
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

function procesarCompraDirecta(index) {
    const producto = productos[index];
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