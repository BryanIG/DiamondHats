import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, onSnapshot, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const nombresCategorias = {
    limitados: "Ediciones de Tiempo Limitado",
    originales: "Gorras Originales",
    temporada: "Gorras De Temporada",
    colaboraciones: "Colaboraciones Especiales",
};

function formatearNombreCategoria(clave) {
    if (nombresCategorias[clave]) return nombresCategorias[clave];
    return clave.charAt(0).toUpperCase() + clave.slice(1).replace(/-/g, " ");
}

function resolverRutaImagen(imgStr) {
    if (!imgStr) return "Imagenes page/Gorra1.jpeg";
    if (imgStr.startsWith("data:image") || imgStr.startsWith("http") || imgStr.startsWith("Imagenes page/")) return imgStr;
    return `Imagenes page/${imgStr}`;
}

let productos = [];
let usuarioActual = null;
let sesionVerificada = false;
let seccionActiva = "all";
let intervaloContadores = null;

// Exponer función global para que carrito.js descuente stock real en Firestore al comprar
window.descontarStockProductosEnFirestore = async function (itemsComprados) {
    for (const item of itemsComprados) {
        if (!item.id) continue;
        try {
            const prodRef = doc(db, "productos", item.id);
            const snap = await getDoc(prodRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.tiempoLimitado && typeof data.stock === "number") {
                    const nuevoStock = Math.max(0, data.stock - (item.cantidad || 1));
                    await updateDoc(prodRef, { stock: nuevoStock });
                }
            }
        } catch (err) {
            console.error("Error actualizando stock en Firestore:", err);
        }
    }
};

const contenedorPrincipal = document.getElementById("contenedor-productos");
const listaSidebar = document.getElementById("lista-categorias-sidebar");

// Controles Sidebar Móvil
const sidebarEl = document.getElementById("categorias-sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const btnCerrarSidebar = document.getElementById("btn-cerrar-sidebar");

function abrirSidebarMovil() {
    if (sidebarEl) sidebarEl.classList.add("abierto");
    if (sidebarOverlay) sidebarOverlay.classList.add("activo");
}

function cerrarSidebarMovil() {
    if (sidebarEl) sidebarEl.classList.remove("abierto");
    if (sidebarOverlay) sidebarOverlay.classList.remove("activo");
}

if (btnToggleSidebar) btnToggleSidebar.addEventListener("click", abrirSidebarMovil);
if (btnCerrarSidebar) btnCerrarSidebar.addEventListener("click", cerrarSidebarMovil);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", cerrarSidebarMovil);

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
// INYECTAR ESTILOS ESPECIALES
// ==========================================
function inyectarEstilosEspeciales() {
    if (document.getElementById("dh-limited-edition-styles")) return;
    const style = document.createElement("style");
    style.id = "dh-limited-edition-styles";
    style.textContent = `
        #seccion-limitados {
            background: linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(18, 18, 18, 0.95));
            border: 1px solid rgba(212, 175, 55, 0.45);
            box-shadow: 0 10px 35px rgba(212, 175, 55, 0.12);
        }
        #seccion-limitados .seccion-titulo {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #f3d266;
            text-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
        }
        .card-limitada {
            border: 2px solid #d4af37 !important;
            background: linear-gradient(165deg, #241f12 0%, #151515 65%) !important;
            box-shadow: 0 0 22px rgba(212, 175, 55, 0.28), inset 0 0 15px rgba(212, 175, 55, 0.08);
            animation: dhCardPulse 3s infinite alternate;
        }
        .card-limitada:hover {
            transform: translateY(-10px) scale(1.015);
            box-shadow: 0 15px 35px rgba(212, 175, 55, 0.45), 0 0 28px rgba(243, 210, 102, 0.35) !important;
        }
        @keyframes dhCardPulse {
            0% { border-color: #b8952b; box-shadow: 0 0 14px rgba(212, 175, 55, 0.2); }
            100% { border-color: #ffe27a; box-shadow: 0 0 26px rgba(212, 175, 55, 0.45); }
        }
        .badge-limitado-top {
            position: absolute;
            top: 12px;
            left: 12px;
            background: linear-gradient(90deg, #d4af37, #ffe27a, #d4af37);
            background-size: 200% auto;
            color: #111;
            font-size: 11px;
            font-weight: 800;
            padding: 5px 12px;
            border-radius: 20px;
            z-index: 12;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            animation: dhShineBadge 2.5s linear infinite;
        }
        @keyframes dhShineBadge {
            to { background-position: 200% center; }
        }
        .limited-status-box {
            background: rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 8px;
            padding: 8px 10px;
            margin-bottom: 12px;
        }
        .limited-stock-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
            color: #f3d266;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .stock-bar-bg {
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 7px;
        }
        .stock-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff4757, #ffa502, #d4af37);
            border-radius: 4px;
            transition: width 0.4s ease;
        }
        .countdown-timer-pill {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12.5px;
            font-weight: 800;
            color: #ffffff;
            background: rgba(212, 175, 55, 0.16);
            padding: 4px 8px;
            border-radius: 5px;
            letter-spacing: 0.5px;
        }
        .comprar:disabled {
            background: #444 !important;
            color: #999 !important;
            cursor: not-allowed !important;
        }
        .ofertas-lock-card {
            max-width: 560px;
            margin: 30px auto;
            background: linear-gradient(145deg, #1b1b1b, #111111);
            border: 1px solid rgba(212, 175, 55, 0.55);
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.15);
            border-radius: 20px;
            padding: 45px 35px;
            text-align: center;
            animation: dhFadeUpLock 0.45s ease forwards;
        }
        .ofertas-lock-icon {
            width: 74px;
            height: 74px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.12);
            border: 2px solid #d4af37;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 800;
            color: #d4af37;
            letter-spacing: 1px;
        }
        .ofertas-lock-card h2 {
            color: #f3d266;
            font-size: 1.7rem;
            margin-bottom: 12px;
        }
        .ofertas-lock-card p {
            color: #bbb;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 28px;
        }
        .btn-unlock-ofertas {
            background: linear-gradient(135deg, #d4af37, #b0882e);
            color: #111111;
            border: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .btn-unlock-ofertas:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 10px 28px rgba(212, 175, 55, 0.55);
        }
        @keyframes dhFadeUpLock {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// CONEXIÓN EN TIEMPO REAL CON FIREBASE AUTH + FIRESTORE
// ==========================================
function iniciarSistemaCatalogo() {
    inyectarEstilosEspeciales();

    if (contenedorPrincipal) {
        contenedorPrincipal.innerHTML = `<p style="color:#aaa; text-align:center; padding:80px 20px; font-size:1.1rem;">Cargando colección Diamond Hats...</p>`;
    }

    onAuthStateChanged(auth, (user) => {
        usuarioActual = user;
        sesionVerificada = true;
        if (productos.length > 0 || window.location.pathname.includes("ofertas.html")) {
            inicializarTienda();
        }
    });

    onSnapshot(collection(db, "productos"), (snapshot) => {
        productos = [];
        snapshot.forEach((docSnap) => {
            productos.push({ id: docSnap.id, ...docSnap.data() });
        });
        productos.sort((a, b) => (b.tiempoLimitado ? 1 : 0) - (a.tiempoLimitado ? 1 : 0));

        renderizarMenuLateral();
        if (sesionVerificada) {
            inicializarTienda();
        }
    });
}

// ==========================================
// MENÚ LATERAL DINÁMICO
// ==========================================
function renderizarMenuLateral() {
    if (!listaSidebar) return;

    const hayLimitados = productos.some(p => p.tiempoLimitado);
    const categoriasSet = new Set(["originales", "temporada", "colaboraciones"]);
    productos.forEach(p => {
        if (p.categoria) categoriasSet.add(p.categoria.toLowerCase());
    });

    let html = `
        <li>
            <button class="sidebar-cat-btn ${seccionActiva === 'all' ? 'active' : ''}" data-cat="all">
                <span>Todas las Gorras</span>
                <span class="cat-count">${productos.length}</span>
            </button>
        </li>
    `;

    if (hayLimitados) {
        const cantLim = productos.filter(p => p.tiempoLimitado).length;
        html += `
            <li>
                <button class="sidebar-cat-btn ${seccionActiva === 'limitados' ? 'active' : ''}" data-cat="limitados" style="border-color: rgba(212,175,55,0.55); color:#f3d266;">
                    <span>Tiempo Limitado</span>
                    <span class="cat-count">${cantLim}</span>
                </button>
            </li>
        `;
    }

    categoriasSet.forEach(cat => {
        const cantidad = productos.filter(p => (p.categoria || "").toLowerCase() === cat).length;
        html += `
            <li>
                <button class="sidebar-cat-btn ${seccionActiva === cat ? 'active' : ''}" data-cat="${cat}">
                    <span>${formatearNombreCategoria(cat)}</span>
                    <span class="cat-count">${cantidad}</span>
                </button>
            </li>
        `;
    });

    listaSidebar.innerHTML = html;

    listaSidebar.querySelectorAll(".sidebar-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetCat = btn.getAttribute("data-cat");
            seccionActiva = targetCat;

            listaSidebar.querySelectorAll(".sidebar-cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            cerrarSidebarMovil();

            if (targetCat === "all") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                const seccionDestino = document.getElementById(`seccion-${targetCat}`);
                if (seccionDestino) {
                    const headerEl = document.querySelector(".header");
                    const offsetHeader = headerEl ? headerEl.offsetHeight + 25 : 155;
                    const posicionY = seccionDestino.getBoundingClientRect().top + window.scrollY - offsetHeader;

                    window.scrollTo({ top: posicionY, behavior: "smooth" });
                    seccionDestino.classList.remove("seccion-destacada");
                    void seccionDestino.offsetWidth;
                    seccionDestino.classList.add("seccion-destacada");
                }
            }
        });
    });
}

// ==========================================
// CONSTRUIR HTML DE TARJETA
// ==========================================
function construirCardHTML(producto, indexOriginal) {
    const estaLogueado = Boolean(usuarioActual);
    const esLimitado = Boolean(producto.tiempoLimitado);
    const stockNum = typeof producto.stock === "number" ? producto.stock : 10;
    const agotado = esLimitado && stockNum <= 0;

    let badgeHTML = '';
    if (esLimitado) {
        badgeHTML = `<span class="badge-limitado-top">${agotado ? 'AGOTADO' : (producto.etiquetaLimitada || 'DROP LIMITADO')}</span>`;
    } else if (producto.enOferta && estaLogueado) {
        badgeHTML = `<span class="badge-oferta">-${producto.descuento}% OFF</span>`;
    }

    let precioHTML = `<div class="precio">$${producto.precioOriginal || producto.precio} MXN</div>`;
    if (producto.enOferta && estaLogueado) {
        precioHTML = `
            <div class="precio-container">
                <span class="precio-actual">$${producto.precio} MXN</span>
                <span class="precio-original">$${producto.precioOriginal} MXN</span>
            </div>
        `;
    }

    let bloqueLimitadoHTML = '';
    if (esLimitado) {
        const porcentajeBarra = agotado ? 0 : Math.min(100, Math.max(8, stockNum * 5));
        bloqueLimitadoHTML = `
            <div class="limited-status-box">
                <div class="limited-stock-row">
                    <span>Stock Limitado</span>
                    <span style="color: ${agotado ? '#ff6b6b' : '#f3d266'};">${agotado ? '0 disponibles' : `${stockNum} disponibles`}</span>
                </div>
                <div class="stock-bar-bg">
                    <div class="stock-bar-fill" style="width: ${porcentajeBarra}%;"></div>
                </div>
                <div class="countdown-timer-pill" data-deadline="${producto.fechaLimite || ''}">
                    Calculando...
                </div>
            </div>
        `;
    }

    const textoBoton = agotado
        ? 'Agotado'
        : (esLimitado ? 'Obtener Edición Limitada' : 'Comprar');

    return `
        <div class="card ${esLimitado ? 'card-limitada' : ''} ${producto.enOferta && estaLogueado ? 'card-oferta' : ''}" data-id="${producto.id}">
            ${estaLogueado ? `<button class="btn-favorito" onclick="toggleFavorito('${producto.id}', event)">🤍</button>` : ''}
            ${badgeHTML}
            <div class="img-container">
                <img src="${resolverRutaImagen(producto.imagen)}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})" onerror="this.src='Imagenes page/Gorra1.jpeg'">
            </div>
            <div class="info">
                <h2 onclick="abrirModalDetalle(${indexOriginal})">${producto.nombre}</h2>
                <p>${producto.descripcion}</p>
                ${bloqueLimitadoHTML}
                ${precioHTML}
                <button class="comprar" ${agotado ? 'disabled' : ''} onclick="procesarCompraDirecta(${indexOriginal})">
                    ${textoBoton}
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// RENDERIZADO PRINCIPAL
// ==========================================
function inicializarTienda() {
    if (!contenedorPrincipal) return;
    const esPaginaOfertas = window.location.pathname.toLowerCase().includes("ofertas.html");

    if (esPaginaOfertas) {
        if (!usuarioActual) {
            contenedorPrincipal.innerHTML = `
                <div class="ofertas-lock-card">
                    <div class="ofertas-lock-icon">VIP</div>
                    <h2>Ofertas Exclusivas para Miembros</h2>
                    <p>Solo los usuarios registrados en <strong>Diamond Hats</strong> tienen acceso a nuestros descuentos especiales y promociones ocultas. Crea tu cuenta gratis en segundos para desbloquearlas.</p>
                    <button class="btn-unlock-ofertas" onclick="abrirModalRegistroOfertas()">Crear Cuenta / Iniciar Sesión</button>
                </div>
            `;
            return;
        }

        const productosOferta = productos.filter(p => p.enOferta);
        contenedorPrincipal.innerHTML = `
            <section class="seccion-carrusel" style="border:none;">
                <h2 class="seccion-titulo">Descuentos Exclusivos Activos (${productosOferta.length})</h2>
                <div class="ofertas-grid" id="grid-ofertas"></div>
            </section>
        `;
        const grid = document.getElementById("grid-ofertas");
        grid.innerHTML = productosOferta.length > 0
            ? productosOferta.map(p => construirCardHTML(p, productos.findIndex(x => x.id === p.id))).join("")
            : '<p style="color: #aaa; text-align: center; width: 100%; padding: 40px 0;">Por el momento no hay ofertas activas. Vuelve pronto.</p>';

        sincronizarFavoritosVisuales();
        iniciarRelojesLimitados();
        return;
    }

    const productosLimitados = productos.filter(p => p.tiempoLimitado);
    const categoriasSet = new Set(["originales", "temporada", "colaboraciones"]);
    productos.forEach(p => {
        if (p.categoria) categoriasSet.add(p.categoria.toLowerCase());
    });
    const listaCategorias = Array.from(categoriasSet);

    contenedorPrincipal.innerHTML = '';

    if (productosLimitados.length > 0) {
        contenedorPrincipal.innerHTML += `
            <section class="seccion-carrusel" id="seccion-limitados">
                <h2 class="seccion-titulo">Ediciones de Tiempo Limitado (Drops Exclusivos)</h2>
                <div class="carrusel-contenedor">
                    <button class="carrusel-btn prev" id="btn-prev-limitados" onclick="desplazarCarrusel('limitados', 'izquierda')">❮</button>
                    <div class="carrusel-track" id="track-limitados"></div>
                    <button class="carrusel-btn next" id="btn-next-limitados" onclick="desplazarCarrusel('limitados', 'derecha')">❯</button>
                </div>
            </section>
        `;
    }

    listaCategorias.forEach((claveCat, index) => {
        contenedorPrincipal.innerHTML += `
            <section class="seccion-carrusel" id="seccion-${claveCat}">
                <h2 class="seccion-titulo">${formatearNombreCategoria(claveCat)}</h2>
                <div class="carrusel-contenedor">
                    <button class="carrusel-btn prev" id="btn-prev-${claveCat}" onclick="desplazarCarrusel('${claveCat}', 'izquierda')">❮</button>
                    <div class="carrusel-track" id="track-${claveCat}"></div>
                    <button class="carrusel-btn next" id="btn-next-${claveCat}" onclick="desplazarCarrusel('${claveCat}', 'derecha')">❯</button>
                </div>
            </section>
        `;

        if (index === 0) {
            contenedorPrincipal.innerHTML += `
                <div class="video-seccion-banner" id="banner-video-intermedio">
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

    const trackLimitados = document.getElementById("track-limitados");
    if (trackLimitados) {
        productosLimitados.forEach(prod => {
            const idx = productos.findIndex(p => p.id === prod.id);
            trackLimitados.innerHTML += construirCardHTML(prod, idx);
        });
    }

    listaCategorias.forEach(catKey => {
        const trackDestino = document.getElementById(`track-${catKey}`);
        const seccionDestino = document.getElementById(`seccion-${catKey}`);
        const deEstaCategoria = productos.filter(p => (p.categoria || "originales").toLowerCase() === catKey);

        if (deEstaCategoria.length === 0) {
            if (seccionDestino) seccionDestino.style.display = "none";
        } else if (trackDestino) {
            if (seccionDestino) seccionDestino.style.display = "block";
            deEstaCategoria.forEach(prod => {
                const idx = productos.findIndex(p => p.id === prod.id);
                trackDestino.innerHTML += construirCardHTML(prod, idx);
            });
        }
    });

    sincronizarFavoritosVisuales();
    iniciarRelojesLimitados();

    setTimeout(() => {
        const tracksIds = productosLimitados.length > 0 ? ["limitados", ...listaCategorias] : listaCategorias;
        tracksIds.forEach(claveCat => {
            const track = document.getElementById(`track-${claveCat}`);
            const btnPrev = document.getElementById(`btn-prev-${claveCat}`);
            const btnNext = document.getElementById(`btn-next-${claveCat}`);

            if (track && btnPrev && btnNext) {
                const actualizarFlechas = () => {
                    btnPrev.style.display = track.scrollLeft > 10 ? "flex" : "none";
                    const maxScroll = track.scrollWidth - track.clientWidth;
                    btnNext.style.display = (maxScroll > 10 && track.scrollLeft < maxScroll - 10) ? "flex" : "none";
                };
                actualizarFlechas();
                track.addEventListener("scroll", actualizarFlechas);
                window.addEventListener("resize", actualizarFlechas);
            }
        });
    }, 50);
}

window.abrirModalRegistroOfertas = function () {
    const modalAuth = document.getElementById("modal-auth");
    const tabRegister = document.getElementById("tab-register");
    if (modalAuth) {
        modalAuth.classList.add("activo");
        if (tabRegister) tabRegister.click();
    }
};

// ==========================================
// CONTADOR REGRESIVO EN VIVO
// ==========================================
function iniciarRelojesLimitados() {
    if (intervaloContadores) clearInterval(intervaloContadores);

    const actualizar = () => {
        document.querySelectorAll(".countdown-timer-pill").forEach(el => {
            const deadlineStr = el.getAttribute("data-deadline");
            if (!deadlineStr) {
                el.textContent = "POR TIEMPO LIMITADO";
                return;
            }
            const diff = new Date(deadlineStr).getTime() - Date.now();
            if (diff <= 0) {
                el.textContent = "TIEMPO FINALIZADO";
                el.style.color = "#ff6b6b";
                return;
            }
            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / 1000 / 60) % 60);
            const segs = Math.floor((diff / 1000) % 60);

            const hStr = String(horas).padStart(2, "0");
            const mStr = String(mins).padStart(2, "0");
            const sStr = String(segs).padStart(2, "0");

            el.textContent = dias > 0
                ? `${dias}d ${hStr}h : ${mStr}m : ${sStr}s`
                : `${hStr}h : ${mStr}m : ${sStr}s`;
        });
    };

    actualizar();
    intervaloContadores = setInterval(actualizar, 1000);
}

// ==========================================
// FAVORITOS POR CUENTA
// ==========================================
function getKeyFavsCuenta() {
    const email = (localStorage.getItem("userEmail") || "guest").toLowerCase();
    return "favoritos_ids_" + email;
}

window.toggleFavorito = function (prodId, e) {
    if (e) e.stopPropagation();
    const key = getKeyFavsCuenta();
    let favs = JSON.parse(localStorage.getItem(key) || "[]");
    if (favs.includes(prodId)) {
        favs = favs.filter(id => id !== prodId);
    } else {
        favs.push(prodId);
    }
    localStorage.setItem(key, JSON.stringify(favs));
    sincronizarFavoritosVisuales();

    if (typeof renderizarFavoritosSidebar === 'function') {
        const favRow = document.getElementById("profile-favoritos-grid");
        if (favRow) renderizarFavoritosSidebar();
    }
};

window.sincronizarFavoritosVisuales = function () {
    const key = getKeyFavsCuenta();
    let favs = JSON.parse(localStorage.getItem(key) || "[]");
    document.querySelectorAll(".card").forEach(card => {
        const prodId = card.getAttribute("data-id");
        const btn = card.querySelector(".btn-favorito");
        if (btn && prodId) {
            if (favs.includes(prodId)) {
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

    const key = getKeyFavsCuenta();
    let favs = JSON.parse(localStorage.getItem(key) || "[]");
    grid.innerHTML = '';

    if (favs.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center;">No tienes gorras en tus favoritos.</p>';
        return;
    }

    favs.forEach(prodId => {
        const indexOriginal = productos.findIndex(p => p.id === prodId);
        const producto = productos[indexOriginal];
        if (!producto) return;
        grid.innerHTML += `
            <div class="card" style="margin: 0; min-height: 280px; display:flex; flex-direction:column; position:relative; overflow:visible;">
                <button style="position:absolute; right:-10px; top:-10px; background:#fff; border:1px solid #ddd; border-radius:50%; width:30px; height:30px; cursor:pointer; color:#ff4757; box-shadow:0 2px 5px rgba(0,0,0,0.2); font-size:14px; display:flex; align-items:center; justify-content:center; z-index:5;" onclick="toggleFavorito('${producto.id}', event)">X</button>
                <div class="img-container">
                    <img src="${resolverRutaImagen(producto.imagen)}" alt="${producto.nombre}" onclick="abrirModalDetalle(${indexOriginal})" style="cursor:pointer; border-radius:8px;">
                </div>
                <div class="info" style="display:flex; flex-direction:column; flex:1; justify-content:space-between;">
                    <div>
                        <h3 style="font-size:15px; margin-bottom:5px; color:#333;">${producto.nombre}</h3>
                        <p style="font-weight:bold; color:#cca142; margin-bottom:5px;">$${producto.precio} MXN</p>
                    </div>
                    <button class="comprar" onclick="procesarCompraDirecta(${indexOriginal})" style="margin-top:auto;">Comprar</button>
                </div>
            </div>
         `;
    });
};

// ==========================================
// FUNCIONES GLOBALES CON CONTROL DE STOCK Y SESIÓN
// ==========================================
window.desplazarCarrusel = function (categoria, direccion) {
    const track = document.getElementById(`track-${categoria}`);
    if (track) {
        const distancia = track.clientWidth * 0.75;
        track.scrollLeft += (direccion === 'derecha' ? distancia : -distancia);
    }
};

function dispararToastExito() {
    if (toastNotificacion) {
        toastNotificacion.classList.add("mostrar");
        setTimeout(() => toastNotificacion.classList.remove("mostrar"), 2800);
    }
}

function verificarAccesoCompra() {
    if (usuarioActual) return true;
    cerrarModalDetalle();
    if (typeof window.mostrarNotificacionAuth === "function") {
        window.mostrarNotificacionAuth(
            "Acceso Exclusivo",
            "Inicia sesión o crea tu cuenta gratis para agregar productos a tu carrito.",
            "error",
            () => {
                const modalAuth = document.getElementById("modal-auth");
                if (modalAuth) modalAuth.classList.add("activo");
            }
        );
    } else {
        const modalAuth = document.getElementById("modal-auth");
        if (modalAuth) modalAuth.classList.add("activo");
    }
    return false;
}

window.abrirModalDetalle = function (index) {
    const prod = productos[index];
    if (!prod) return;

    const estaLogueado = Boolean(usuarioActual);
    const precioFinal = (prod.enOferta && estaLogueado) ? prod.precio : (prod.precioOriginal || prod.precio);
    const esLimitado = Boolean(prod.tiempoLimitado);
    const stockActual = typeof prod.stock === "number" ? prod.stock : 10;
    const agotado = esLimitado && stockActual <= 0;

    modalImgPrincipal.src = resolverRutaImagen(prod.imagen);
    modalImgPrincipal.alt = prod.nombre;
    modalNombre.innerText = prod.nombre;

    if (prod.enOferta && estaLogueado) {
        modalPrecio.innerHTML = `
            <div class="modal-precio-container">
                <span class="modal-precio-actual">$${prod.precio} MXN</span>
                <span class="modal-precio-original">$${prod.precioOriginal} MXN</span>
                <span class="modal-badge-descuento">-${prod.descuento}% OFF</span>
            </div>
        `;
    } else {
        modalPrecio.innerText = `$${precioFinal} MXN`;
    }

    modalDescripcion.innerText = esLimitado
        ? `EDICIÓN LIMITADA (${stockActual} piezas disponibles). ${prod.descripcion}`
        : prod.descripcion;

    document.querySelectorAll('.acordeon-item').forEach(item => item.classList.remove('activo'));

    modalBtnAgregar.disabled = agotado;
    modalBtnAgregar.textContent = agotado ? "Producto Agotado" : "Añadir a la cesta";

    modalBtnAgregar.onclick = function () {
        if (agotado) return;
        if (!verificarAccesoCompra()) return;

        if (typeof agregarCarrito === "function") {
            const agregado = agregarCarrito({
                id: prod.id,
                nombre: prod.nombre,
                descripcion: prod.descripcion,
                precio: precioFinal,
                imagen: resolverRutaImagen(prod.imagen),
                tiempoLimitado: esLimitado,
                maxStock: esLimitado ? stockActual : 999
            });
            if (agregado) {
                cerrarModalDetalle();
                dispararToastExito();
                if (carritoLateral) carritoLateral.classList.add("activo");
            }
        }
    };

    modal.classList.add("activo");
};

window.procesarCompraDirecta = function (index) {
    if (!verificarAccesoCompra()) return;

    const producto = productos[index];
    if (!producto) return;

    const esLimitado = Boolean(producto.tiempoLimitado);
    const stockActual = typeof producto.stock === "number" ? producto.stock : 10;
    if (esLimitado && stockActual <= 0) {
        alert("Esta edición limitada ya se encuentra agotada.");
        return;
    }

    const estaLogueado = Boolean(usuarioActual);
    const precioFinal = (producto.enOferta && estaLogueado) ? producto.precio : (producto.precioOriginal || producto.precio);

    if (typeof agregarCarrito === "function") {
        const agregado = agregarCarrito({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: precioFinal,
            imagen: resolverRutaImagen(producto.imagen),
            tiempoLimitado: esLimitado,
            maxStock: esLimitado ? stockActual : 999
        });
        if (agregado) {
            dispararToastExito();
            if (carritoLateral) carritoLateral.classList.add("activo");
        }
    }
};

window.conmutarAcordeon = function (elementoHeader) {
    const itemActual = elementoHeader.parentElement;
    const estaActivo = itemActual.classList.contains('activo');

    document.querySelectorAll('.acordeon-item').forEach(item => item.classList.remove('activo'));
    if (!estaActivo) itemActual.classList.add('activo');
};

function cerrarModalDetalle() {
    if (modal) modal.classList.remove("activo");
}

if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModalDetalle);

window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModalDetalle();
});

iniciarSistemaCatalogo();