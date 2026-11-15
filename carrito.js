// ============================
// VARIABLES DEL CARRITO AISLADAS POR CUENTA
// ============================
function getAccountEmail() {
    return (localStorage.getItem("userEmail") || "guest").toLowerCase();
}

function getKeyCarrito() {
    return "carrito_" + getAccountEmail();
}

function getKeyHistorial() {
    return "historial_compras_" + getAccountEmail();
}

function getKeyTarjetas() {
    return "tarjetas_guardadas_" + getAccountEmail();
}

function getKeyDireccionDefault() {
    return "direccion_default_" + getAccountEmail();
}

localStorage.removeItem("carrito");
localStorage.removeItem("historial_compras");
localStorage.removeItem("tarjetas_guardadas");

let carrito = JSON.parse(localStorage.getItem(getKeyCarrito())) || [];

const carritoPanel = document.getElementById("carrito");
const abrirCarrito = document.getElementById("abrir-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const productosCarrito = document.getElementById("productos-carrito");
const contador = document.getElementById("contador");
const totalElemento = document.getElementById("total");

const ESTADOS_MEXICO = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
    "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
    "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
    "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
    "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const TASA_CANJE_PUNTOS = 10;
const PORCENTAJE_RECOMPENSA = 0.10;
const META_ENVIO_GRATIS = 4999;

function obtenerPuntosUsuario() {
    const guardados = localStorage.getItem("puntos_vip_" + getAccountEmail());
    if (guardados !== null) return Number(guardados);
    return 100;
}

function guardarPuntosUsuario(nuevosPuntos) {
    const valorFinal = Math.max(0, Math.round(nuevosPuntos));
    localStorage.setItem("puntos_vip_" + getAccountEmail(), String(valorFinal));
    if (typeof window.sincronizarPuntosFirestore === "function") {
        window.sincronizarPuntosFirestore(valorFinal);
    }
    return valorFinal;
}
window.obtenerPuntosUsuario = obtenerPuntosUsuario;
window.guardarPuntosUsuario = guardarPuntosUsuario;

function resolverImagenCarrito(imgStr) {
    if (!imgStr) return "Imagenes page/Gorra1.jpeg";
    if (imgStr.startsWith("data:image") || imgStr.startsWith("http") || imgStr.startsWith("Imagenes page/")) {
        return imgStr;
    }
    return `Imagenes page/${imgStr}`;
}

function exigirSesionParaComprar() {
    const token = localStorage.getItem("token");
    if (token) return true;

    const modalProd = document.getElementById("modal-producto");
    if (modalProd) modalProd.classList.remove("activo");

    if (typeof window.mostrarNotificacionAuth === "function") {
        window.mostrarNotificacionAuth(
            "Inicia Sesión para Comprar",
            "Crea tu cuenta o inicia sesión para agregar gorras a tu carrito.",
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
window.exigirSesionParaComprar = exigirSesionParaComprar;

// ==========================================
// ESTILOS Y ESTRUCTURA VIP DEL CARRITO
// ==========================================
function inicializarEstilosCarritoVIP() {
    if (!document.getElementById("dh-cart-backdrop")) {
        const backdrop = document.createElement("div");
        backdrop.id = "dh-cart-backdrop";
        backdrop.addEventListener("click", cerrarDrawerCarrito);
        document.body.appendChild(backdrop);
    }

    if (document.getElementById("dh-vip-cart-styles")) return;
    const style = document.createElement("style");
    style.id = "dh-vip-cart-styles";
    style.textContent = `
        #dh-cart-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.68);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 2450;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.35s ease;
        }
        #dh-cart-backdrop.activo {
            opacity: 1;
            pointer-events: auto;
        }

        #carrito {
            position: fixed !important;
            top: 0 !important;
            right: -105% !important;
            width: 400px !important;
            max-width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            background-color: #111111 !important;
            background-image:
                radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.14) 0%, transparent 45%),
                radial-gradient(rgba(212, 175, 55, 0.06) 1px, transparent 1px) !important;
            background-size: 100% 100%, 20px 20px !important;
            border-left: 1px solid rgba(212, 175, 55, 0.35) !important;
            box-shadow: -15px 0 45px rgba(0, 0, 0, 0.85) !important;
            z-index: 2500 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            transition: right 0.42s cubic-bezier(0.22, 1, 0.36, 1) !important;
            color: #f5f5f5 !important;
        }

        #carrito.activo {
            right: 0 !important;
        }

        .carrito-header {
            padding: 18px 20px !important;
            background: linear-gradient(180deg, rgba(24, 24, 24, 0.98), rgba(17, 17, 17, 0.92)) !important;
            border-bottom: 1px solid rgba(212, 175, 55, 0.25) !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-shrink: 0 !important;
        }

        .dh-cart-title-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .dh-cart-title-group h2 {
            font-size: 1.25rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.6px;
            background: linear-gradient(135deg, #ffffff, #f3d266);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 !important;
        }

        .dh-cart-pill-count {
            background: rgba(212, 175, 55, 0.16);
            border: 1px solid rgba(212, 175, 55, 0.45);
            color: #f3d266;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 9px;
            border-radius: 20px;
        }

        #cerrar-carrito-vip {
            width: 34px !important;
            height: 34px !important;
            border-radius: 50% !important;
            background: rgba(255, 255, 255, 0.06) !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
            color: #ddd !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        #cerrar-carrito-vip:hover {
            background: rgba(231, 76, 60, 0.2) !important;
            border-color: #e74c3c !important;
            color: #ff6b6b !important;
            transform: rotate(90deg) scale(1.08) !important;
        }

        /* Barra VIP de Envío Gratis */
        .dh-shipping-banner {
            padding: 11px 18px;
            background: rgba(212, 175, 55, 0.07);
            border-bottom: 1px solid rgba(212, 175, 55, 0.16);
            flex-shrink: 0;
        }

        .dh-shipping-text {
            font-size: 11.5px;
            color: #ddd;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .dh-shipping-text strong {
            color: #f3d266;
        }

        .dh-shipping-track {
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }

        .dh-shipping-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #b0882e, #f3d266, #fff2b2);
            background-size: 200% 100%;
            animation: dhGoldFlow 2.5s linear infinite;
            border-radius: 10px;
            transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes dhGoldFlow {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
        }

        /* Área central deslizable */
        #productos-carrito {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
            padding: 14px 16px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            scrollbar-width: thin;
            scrollbar-color: rgba(212, 175, 55, 0.4) transparent;
        }

        #productos-carrito::-webkit-scrollbar {
            width: 5px;
        }

        #productos-carrito::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.4);
            border-radius: 10px;
        }

        /* Tarjeta de producto en carrito */
        .producto-carrito {
            display: flex !important;
            align-items: center !important;
            gap: 13px !important;
            padding: 12px !important;
            margin: 0 !important;
            background: linear-gradient(145deg, rgba(30, 30, 30, 0.92), rgba(20, 20, 20, 0.96)) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 14px !important;
            position: relative;
            overflow: hidden;
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease !important;
            animation: dhCartItemIn 0.36s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }

        @keyframes dhCartItemIn {
            from {
                opacity: 0;
                transform: translateX(26px) scale(0.97);
            }
            to {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
        }

        .producto-carrito::before {
            content: "";
            position: absolute;
            left: 0;
            top: 15%;
            bottom: 15%;
            width: 3px;
            border-radius: 0 4px 4px 0;
            background: linear-gradient(180deg, #f3d266, #b0882e);
            opacity: 0.75;
        }

        .producto-carrito:hover {
            border-color: rgba(212, 175, 55, 0.42) !important;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45) !important;
            transform: translateY(-2px);
        }

        .dh-cart-img-wrap {
            width: 72px;
            height: 72px;
            border-radius: 11px;
            overflow: hidden;
            flex-shrink: 0;
            border: 1px solid rgba(212, 175, 55, 0.3);
            background: #0d0d0d;
        }

        .dh-cart-img-wrap img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            transition: transform 0.35s ease;
        }

        .producto-carrito:hover .dh-cart-img-wrap img {
            transform: scale(1.08);
        }

        .dh-cart-item-body {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .dh-cart-item-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
        }

        .dh-cart-item-body h4 {
            font-size: 13.5px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            margin: 0 !important;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .dh-cart-price-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
        }

        .dh-cart-unit-price {
            font-size: 12px !important;
            color: #999 !important;
            margin: 0 !important;
        }

        .dh-cart-subtotal {
            font-size: 13.5px !important;
            font-weight: 800 !important;
            color: #f3d266 !important;
            margin: 0 !important;
        }

        /* Controles de cantidad y quitar con diseño pill */
        .acciones {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-top: 6px !important;
            gap: 8px !important;
        }

        .dh-qty-pill {
            display: inline-flex;
            align-items: center;
            background: #141414;
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 20px;
            padding: 2px;
            gap: 4px;
        }

        .dh-qty-pill button {
            width: 26px !important;
            height: 26px !important;
            border-radius: 50% !important;
            border: none !important;
            background: rgba(212, 175, 55, 0.14) !important;
            color: #f3d266 !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        .dh-qty-pill button:hover {
            background: #d4af37 !important;
            color: #111111 !important;
            transform: scale(1.12) !important;
        }

        .dh-qty-pill button:active {
            transform: scale(0.92) !important;
        }

        .dh-qty-pill span {
            min-width: 22px !important;
            text-align: center !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            color: #ffffff !important;
        }

        .acciones button.eliminar {
            width: auto !important;
            height: 28px !important;
            padding: 0 11px !important;
            border-radius: 20px !important;
            background: rgba(231, 76, 60, 0.12) !important;
            border: 1px solid rgba(231, 76, 60, 0.45) !important;
            color: #ff6b6b !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: 0.3px;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px;
            cursor: pointer !important;
            transition: all 0.22s ease !important;
        }

        .acciones button.eliminar:hover {
            background: #e74c3c !important;
            color: #ffffff !important;
            border-color: #e74c3c !important;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4) !important;
            transform: scale(1.05) !important;
        }

        /* Estado vacío creativo */
        .dh-empty-cart {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px 20px;
            color: #888;
        }

        .dh-empty-icon {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.08);
            border: 1.5px dashed rgba(212, 175, 55, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            color: #d4af37;
            animation: dhFloatIcon 3s ease-in-out infinite;
        }

        @keyframes dhFloatIcon {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        .dh-empty-cart h3 {
            color: #f5f5f5;
            font-size: 1.05rem;
            margin-bottom: 6px;
        }

        .dh-empty-cart p {
            font-size: 12.5px;
            line-height: 1.5;
            margin-bottom: 18px;
        }

        .dh-btn-explore-empty {
            padding: 10px 20px;
            border-radius: 25px;
            background: rgba(212, 175, 55, 0.14);
            border: 1px solid #d4af37;
            color: #f3d266;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.25s;
        }

        .dh-btn-explore-empty:hover {
            background: #d4af37;
            color: #111;
        }

        /* Footer fijo y visible en todos los celulares */
        .carrito-footer {
            flex-shrink: 0 !important;
            padding: 14px 18px calc(16px + env(safe-area-inset-bottom)) !important;
            background: linear-gradient(180deg, #161616, #0c0c0c) !important;
            border-top: 1px solid rgba(212, 175, 55, 0.35) !important;
            box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.65) !important;
        }

        .dh-cart-summary-rows {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-bottom: 12px;
        }

        .dh-cart-meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #aaa;
        }

        .dh-cart-meta-row .pts-badge {
            color: #2ecc71;
            font-weight: 700;
            background: rgba(46, 204, 113, 0.12);
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .carrito-footer h3 {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 1.15rem !important;
            color: #ffffff !important;
            margin: 4px 0 0 0 !important;
            padding-top: 6px;
            border-top: 1px dashed rgba(255, 255, 255, 0.12);
        }

        .carrito-footer h3 .dh-total-amount {
            color: #f3d266;
            font-size: 1.3rem;
            font-weight: 800;
        }

        .dh-cart-footer-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .dh-btn-vaciar {
            padding: 13px 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: #aaa;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.25s;
            flex-shrink: 0;
        }

        .dh-btn-vaciar:hover {
            background: rgba(231, 76, 60, 0.18);
            border-color: #e74c3c;
            color: #ff6b6b;
        }

        .finalizar {
            margin-top: 0 !important;
            flex: 1 !important;
            padding: 14px 16px !important;
            background: linear-gradient(135deg, #f3d266 0%, #d4af37 50%, #a88024 100%) !important;
            color: #111111 !important;
            border: none !important;
            border-radius: 12px !important;
            font-size: 14px !important;
            font-weight: 800 !important;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            cursor: pointer !important;
            position: relative;
            overflow: hidden;
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35) !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }

        .finalizar::after {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 55%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
            transform: skewX(-20deg);
            animation: dhBtnShine 3.2s infinite;
        }

        @keyframes dhBtnShine {
            0% { left: -100%; }
            45%, 100% { left: 150%; }
        }

        .finalizar:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 26px rgba(212, 175, 55, 0.55) !important;
        }

        .finalizar:active {
            transform: scale(0.98) !important;
        }

        @media (max-width: 480px) {
            #carrito {
                width: 100vw !important;
                border-left: none !important;
            }
            .dh-cart-img-wrap {
                width: 64px;
                height: 64px;
            }
        }
    `;
    document.head.appendChild(style);
}

function abrirDrawerCarrito() {
    if (!carritoPanel) return;
    carritoPanel.classList.add("activo");
    document.getElementById("dh-cart-backdrop")?.classList.add("activo");
}

function cerrarDrawerCarrito() {
    if (!carritoPanel) return;
    carritoPanel.classList.remove("activo");
    document.getElementById("dh-cart-backdrop")?.classList.remove("activo");
}

inicializarEstilosCarritoVIP();

if (abrirCarrito) {
    abrirCarrito.addEventListener("click", () => {
        if (!exigirSesionParaComprar()) return;
        carrito = JSON.parse(localStorage.getItem(getKeyCarrito())) || [];
        actualizarCarrito();
        abrirDrawerCarrito();
    });
}

if (cerrarCarrito) {
    cerrarCarrito.addEventListener("click", cerrarDrawerCarrito);
}

function agregarCarrito(producto) {
    if (!exigirSesionParaComprar()) return false;
    carrito = JSON.parse(localStorage.getItem(getKeyCarrito())) || [];

    const maxPermitido = producto.tiempoLimitado && typeof producto.maxStock === "number"
        ? producto.maxStock
        : 999;

    const existe = carrito.find(item => item.nombre === producto.nombre);
    if (existe) {
        if (existe.cantidad + 1 > maxPermitido) {
            alert(`Solo quedan ${maxPermitido} piezas disponibles de esta edición limitada.`);
            return false;
        }
        existe.cantidad++;
        if (producto.id) existe.id = producto.id;
        existe.maxStock = maxPermitido;
    } else {
        if (maxPermitido <= 0) {
            alert("Esta edición limitada ya se encuentra agotada.");
            return false;
        }
        carrito.push({
            ...producto,
            imagen: resolverImagenCarrito(producto.imagen),
            cantidad: 1,
            maxStock: maxPermitido
        });
    }

    guardarCarrito();
    actualizarCarrito();
    return true;
}
window.agregarCarrito = agregarCarrito;

function vaciarCarritoCompleto() {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}
window.vaciarCarritoCompleto = vaciarCarritoCompleto;

function actualizarCarrito() {
    if (!productosCarrito || !carritoPanel) return;

    const totalPiezas = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const puntosGanados = Math.round(total * PORCENTAJE_RECOMPENSA);

    // Actualizar cabecera VIP del carrito con ícono SVG limpio para cerrar
    const headerEl = carritoPanel.querySelector(".carrito-header");
    if (headerEl) {
        headerEl.innerHTML = `
            <div class="dh-cart-title-group">
                <h2>Mi Carrito</h2>
                <span class="dh-cart-pill-count">${totalPiezas} ${totalPiezas === 1 ? 'pieza' : 'piezas'}</span>
            </div>
            <button id="cerrar-carrito-vip" type="button" aria-label="Cerrar carrito">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        document.getElementById("cerrar-carrito-vip")?.addEventListener("click", cerrarDrawerCarrito);
    }

    // Barra de progreso hacia Envío Gratis VIP
    let shippingBanner = document.getElementById("dh-shipping-banner");
    if (!shippingBanner) {
        shippingBanner = document.createElement("div");
        shippingBanner.id = "dh-shipping-banner";
        shippingBanner.className = "dh-shipping-banner";
        headerEl?.insertAdjacentElement("afterend", shippingBanner);
    }

    const porcentajeEnvio = Math.min(100, Math.round((total / META_ENVIO_GRATIS) * 100));
    const faltanteEnvio = Math.max(0, META_ENVIO_GRATIS - total);
    shippingBanner.innerHTML = total >= META_ENVIO_GRATIS
        ? `<div class="dh-shipping-text"><span>¡Desbloqueaste <strong>Envío Express Gratis</strong>!</span><strong>100%</strong></div>
           <div class="dh-shipping-track"><div class="dh-shipping-fill" style="width:100%;"></div></div>`
        : `<div class="dh-shipping-text"><span>Te faltan <strong>$${faltanteEnvio} MXN</strong> para envío gratis</span><span>${porcentajeEnvio}%</span></div>
           <div class="dh-shipping-track"><div class="dh-shipping-fill" style="width:${porcentajeEnvio}%;"></div></div>`;

    // Renderizar lista de productos o estado vacío
    if (carrito.length === 0) {
        productosCarrito.innerHTML = `
            <div class="dh-empty-cart">
                <div class="dh-empty-icon">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega tus gorras favoritas de la colección y acumula puntos VIP en cada pedido.</p>
                <button type="button" class="dh-btn-explore-empty" onclick="cerrarDrawerCarrito()">Explorar Catálogo</button>
            </div>
        `;
    } else {
        productosCarrito.innerHTML = carrito.map((producto, idx) => {
            const imgSrc = resolverImagenCarrito(producto.imagen);
            const subtotal = producto.precio * producto.cantidad;
            const nombreEscapado = producto.nombre.replace(/'/g, "\\'");
            return `
                <div class="producto-carrito" style="animation-delay: ${idx * 0.05}s;">
                    <div class="dh-cart-img-wrap">
                        <img src="${imgSrc}" alt="${producto.nombre}" onerror="this.src='Imagenes page/Gorra1.jpeg'">
                    </div>
                    <div class="dh-cart-item-body">
                        <div class="dh-cart-item-top">
                            <h4 title="${producto.nombre}">${producto.nombre}</h4>
                        </div>
                        <div class="dh-cart-price-row">
                            <span class="dh-cart-unit-price">$${producto.precio} c/u</span>
                            <span class="dh-cart-subtotal">$${subtotal} MXN</span>
                        </div>
                        <div class="acciones">
                            <div class="dh-qty-pill">
                                <button type="button" onclick="disminuir('${nombreEscapado}')" aria-label="Disminuir">−</button>
                                <span>${producto.cantidad}</span>
                                <button type="button" onclick="aumentar('${nombreEscapado}')" aria-label="Aumentar">+</button>
                            </div>
                            <button type="button" class="eliminar" onclick="eliminarProducto('${nombreEscapado}')">Quitar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Actualizar Footer con resumen VIP y botón siempre visible
    const footerEl = carritoPanel.querySelector(".carrito-footer");
    if (footerEl) {
        footerEl.innerHTML = `
            <div class="dh-cart-summary-rows">
                <div class="dh-cart-meta-row">
                    <span>Recompensa por esta compra:</span>
                    <span class="pts-badge">+${puntosGanados} pts VIP</span>
                </div>
                <h3>
                    <span>Total a Pagar</span>
                    <span class="dh-total-amount">$<span id="total">${total}</span> MXN</span>
                </h3>
            </div>
            <div class="dh-cart-footer-actions">
                ${carrito.length > 0 ? `<button type="button" class="dh-btn-vaciar" onclick="vaciarCarritoCompleto()">Vaciar</button>` : ''}
                <button type="button" class="finalizar" id="btn-finalizar-vip">Finalizar Compra</button>
            </div>
        `;
        document.getElementById("btn-finalizar-vip")?.addEventListener("click", abrirCheckoutModal);
    }

    if (contador) {
        contador.textContent = totalPiezas;
    }
    if (totalElemento) {
        totalElemento.textContent = total;
    }
}
window.cerrarDrawerCarrito = cerrarDrawerCarrito;

function aumentar(nombre) {
    const producto = carrito.find(item => item.nombre === nombre);
    if (!producto) return;
    if (producto.tiempoLimitado && typeof producto.maxStock === "number" && producto.cantidad + 1 > producto.maxStock) {
        alert(`Solo hay ${producto.maxStock} piezas disponibles de este drop limitado.`);
        return;
    }
    producto.cantidad++;
    guardarCarrito();
    actualizarCarrito();
}
window.aumentar = aumentar;

function disminuir(nombre) {
    const producto = carrito.find(item => item.nombre === nombre);
    if (!producto) return;
    if (producto.cantidad > 1) {
        producto.cantidad--;
    } else {
        eliminarProducto(nombre);
        return;
    }
    guardarCarrito();
    actualizarCarrito();
}
window.disminuir = disminuir;

function eliminarProducto(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    guardarCarrito();
    actualizarCarrito();
}
window.eliminarProducto = eliminarProducto;

function guardarCarrito() {
    localStorage.setItem(getKeyCarrito(), JSON.stringify(carrito));
}

actualizarCarrito();

// ==========================================
// CHECKOUT POR PASOS CON DIRECCIÓN PREDETERMINADA
// ==========================================
function inyectarEstilosCheckoutWizard() {
    if (document.getElementById("dh-checkout-wizard-styles")) return;
    const style = document.createElement("style");
    style.id = "dh-checkout-wizard-styles";
    style.textContent = `
        #modal-checkout .checkout-container {
            max-width: 600px !important;
            width: 94% !important;
            height: auto !important;
            max-height: 90dvh !important;
            background: linear-gradient(155deg, #191919, #0f0f0f) !important;
            border: 1px solid rgba(212, 175, 55, 0.45) !important;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.15) !important;
            color: #f5f5f5 !important;
            border-radius: 20px !important;
            padding: 28px 24px !important;
            overflow-y: auto !important;
            scrollbar-width: none;
        }
        #modal-checkout .checkout-container::-webkit-scrollbar {
            display: none;
        }
        .dh-wizard-steps {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            position: relative;
            padding: 0 10px;
        }
        .dh-wizard-steps::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 35px;
            right: 35px;
            height: 2px;
            background: #2e2e2e;
            z-index: 0;
        }
        .dh-step-dot {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #777;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .dh-step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #222;
            border: 2px solid #444;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #888;
            transition: all 0.3s ease;
        }
        .dh-step-dot.active .dh-step-circle,
        .dh-step-dot.done .dh-step-circle {
            background: #d4af37;
            border-color: #f3d266;
            color: #111;
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.45);
        }
        .dh-step-dot.active { color: #f3d266; }
        .dh-step-panel { display: none; animation: dhSlideStep 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .dh-step-panel.active { display: block; }
        @keyframes dhSlideStep {
            from { opacity: 0; transform: translateX(28px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .dh-step-title { font-size: 1.3rem; color: #d4af37; margin-bottom: 4px; text-align: center; text-transform: uppercase; letter-spacing: 0.8px; }
        .dh-step-sub { font-size: 0.85rem; color: #999; text-align: center; margin-bottom: 18px; }
        .dh-field { margin-bottom: 14px; text-align: left; }
        .dh-field label { display: block; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #aaa; margin-bottom: 6px; font-weight: 600; }
        .dh-field input, .dh-field select { width: 100%; padding: 12px 14px; background: #222222; border: 1px solid #353535; border-radius: 10px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.25s, box-shadow 0.25s; }
        .dh-field input:focus, .dh-field select:focus { border-color: #d4af37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.14); }
        .dh-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dh-pay-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
        .dh-mode-card { background: #1f1f1f; border: 1px solid #383838; border-radius: 12px; padding: 14px; text-align: left; cursor: pointer; transition: all 0.25s ease; }
        .dh-mode-card:hover:not(.disabled) { border-color: #d4af37; background: rgba(212, 175, 55, 0.08); transform: translateY(-2px); }
        .dh-mode-card.disabled { opacity: 0.45; cursor: not-allowed; }
        .dh-saved-card-item { display: flex; align-items: center; justify-content: space-between; background: #202020; border: 1px solid #363636; padding: 11px 14px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; }
        .dh-saved-card-item.selected { border-color: #d4af37; background: rgba(212, 175, 55, 0.12); }
        .dh-default-addr-preview {
            background: rgba(212, 175, 55, 0.07);
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 18px;
            text-align: left;
            font-size: 13.5px;
            line-height: 1.55;
            color: #e0e0e0;
        }
        .dh-wizard-actions { display: flex; gap: 12px; margin-top: 20px; }
        .dh-btn-sec { flex: 1; padding: 13px; background: #262626; border: 1px solid #444; color: #ddd; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .dh-btn-sec:hover { background: #333; color: #fff; }
        .dh-btn-pri { flex: 1.4; padding: 13px; background: linear-gradient(135deg, #d4af37, #b0882e); border: none; color: #111; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 6px 18px rgba(212, 175, 55, 0.3); transition: transform 0.2s, box-shadow 0.2s; }
        .dh-btn-pri:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212, 175, 55, 0.45); }
        .dh-processing-box { text-align: center; padding: 45px 15px; }
        .dh-spinner { width: 58px; height: 58px; border: 4px solid rgba(212, 175, 55, 0.2); border-top-color: #d4af37; border-radius: 50%; margin: 0 auto 22px; animation: dhSpin 0.85s linear infinite; }
        @keyframes dhSpin { to { transform: rotate(360deg); } }
        .dh-done-check { width: 72px; height: 72px; border-radius: 50%; background: rgba(46, 204, 113, 0.15); border: 2px solid #2ecc71; color: #2ecc71; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; box-shadow: 0 0 25px rgba(46, 204, 113, 0.3); }
        .dh-done-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        @media (max-width: 560px) { .dh-row-2, .dh-pay-mode-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
}

function inyectarModalesDinamicos() {
    inyectarEstilosCheckoutWizard();

    if (!document.getElementById("modal-checkout")) {
        const opcionesEstados = ESTADOS_MEXICO.map(est => `<option value="${est}">${est}</option>`).join("");

        const checkoutHTML = `
            <div id="modal-checkout" class="modal-overlay">
                <div class="modal-container checkout-container">
                    <button id="cerrar-checkout" class="modal-cerrar-btn" style="color:#aaa;">Cerrar</button>

                    <div class="dh-wizard-steps" id="dh-wizard-steps">
                        <div class="dh-step-dot active" data-step="1">
                            <div class="dh-step-circle">1</div>
                            <span>Envío</span>
                        </div>
                        <div class="dh-step-dot" data-step="2">
                            <div class="dh-step-circle">2</div>
                            <span>Dirección</span>
                        </div>
                        <div class="dh-step-dot" data-step="3">
                            <div class="dh-step-circle">3</div>
                            <span>Pago</span>
                        </div>
                    </div>

                    <div class="dh-step-panel" id="step-panel-0">
                        <h2 class="dh-step-title">Dirección de Entrega</h2>
                        <p class="dh-step-sub">Detectamos una dirección guardada de tu compra anterior.</p>

                        <div class="dh-default-addr-preview" id="dh-preview-direccion-guardada"></div>

                        <div class="dh-done-actions" style="margin-top: 10px;">
                            <button type="button" class="dh-btn-pri" id="btn-usar-dir-predeterminada">
                                Usar Dirección Predeterminada
                            </button>
                            <button type="button" class="dh-btn-sec" id="btn-usar-dir-diferente">
                                Usar una Dirección Diferente
                            </button>
                        </div>
                    </div>

                    <div class="dh-step-panel active" id="step-panel-1">
                        <h2 class="dh-step-title">Datos de Envío</h2>
                        <p class="dh-step-sub">Información de contacto para entregar tu pedido.</p>

                        <div class="dh-field">
                            <label for="envioNombre">Nombre Completo del Destinatario</label>
                            <input type="text" id="envioNombre" placeholder="Nombre y apellidos" required>
                        </div>

                        <div class="dh-row-2">
                            <div class="dh-field">
                                <label for="envioTelefono">Teléfono de Contacto</label>
                                <input type="tel" id="envioTelefono" placeholder="10 dígitos" maxlength="15" required>
                            </div>
                            <div class="dh-field">
                                <label for="checkoutEmail">Correo Electrónico</label>
                                <input type="email" id="checkoutEmail" placeholder="correo@ejemplo.com" required>
                            </div>
                        </div>

                        <div class="dh-field">
                            <label for="envioReferencias">Referencias de entrega (Opcional)</label>
                            <input type="text" id="envioReferencias" placeholder="Color de fachada o indicaciones">
                        </div>

                        <div class="dh-wizard-actions">
                            <button type="button" class="dh-btn-sec" id="btn-cancelar-paso1">Cancelar</button>
                            <button type="button" class="dh-btn-pri" id="btn-continuar-paso1">Continuar</button>
                        </div>
                    </div>

                    <div class="dh-step-panel" id="step-panel-2">
                        <h2 class="dh-step-title">Dirección de Residencia</h2>
                        <p class="dh-step-sub">Completa tu domicilio y elige cómo liquidar tu orden.</p>

                        <div class="dh-row-2">
                            <div class="dh-field">
                                <label for="dirPais">País</label>
                                <select id="dirPais">
                                    <option value="México" selected>México</option>
                                    <option value="Estados Unidos">Estados Unidos</option>
                                    <option value="Canadá">Canadá</option>
                                    <option value="España">España</option>
                                    <option value="Colombia">Colombia</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="Otro">Otro País</option>
                                </select>
                            </div>

                            <div class="dh-field" id="grupo-estado-mexico">
                                <label for="dirEstadoMexico">Estado (México)</label>
                                <select id="dirEstadoMexico">
                                    <option value="">Selecciona tu estado...</option>
                                    ${opcionesEstados}
                                </select>
                            </div>

                            <div class="dh-field" id="grupo-estado-otro" style="display:none;">
                                <label for="dirEstadoOtro">Estado / Provincia / Región</label>
                                <input type="text" id="dirEstadoOtro" placeholder="Escribe tu estado o región">
                            </div>
                        </div>

                        <div class="dh-row-2">
                            <div class="dh-field">
                                <label for="dirCiudad">Ciudad / Municipio</label>
                                <input type="text" id="dirCiudad" placeholder="Ciudad o municipio" required>
                            </div>
                            <div class="dh-field">
                                <label for="dirColonia">Colonia / Barrio</label>
                                <input type="text" id="dirColonia" placeholder="Colonia" required>
                            </div>
                        </div>

                        <div class="dh-field">
                            <label for="dirCalle">Nombre de la Calle</label>
                            <input type="text" id="dirCalle" placeholder="Calle o avenida" required>
                        </div>

                        <div class="dh-row-2">
                            <div class="dh-field">
                                <label for="dirNumCasa">Número de Casa / Exterior</label>
                                <input type="text" id="dirNumCasa" placeholder="Número exterior" required>
                            </div>
                            <div class="dh-field">
                                <label for="dirCP">Código Postal</label>
                                <input type="text" id="dirCP" placeholder="Código postal" maxlength="10" required>
                            </div>
                        </div>

                        <div style="margin-top: 14px; border-top: 1px solid #2e2e2e; padding-top: 14px;">
                            <label style="display:block; font-size:11.5px; color:#d4af37; text-transform:uppercase; font-weight:700; letter-spacing:0.6px;">Elige tu modalidad de pago</label>
                            <div class="dh-pay-mode-grid">
                                <div class="dh-mode-card" id="opt-pago-normal">
                                    <strong style="color:#fff; font-size:14px; display:block; margin-bottom:4px;">Compra Normal con Tarjeta</strong>
                                    <span style="color:#d4af37; font-weight:800; font-size:15px;" id="resumen-total-mxn">$0 MXN</span>
                                    <div style="font-size:11.5px; color:#2ecc71; margin-top:4px;" id="resumen-ganancia-pts">Ganarás +0 pts VIP</div>
                                </div>

                                <div class="dh-mode-card" id="opt-pago-puntos">
                                    <strong style="color:#f3d266; font-size:14px; display:block; margin-bottom:4px;">Canjear con Puntos VIP</strong>
                                    <span style="color:#fff; font-weight:800; font-size:15px;" id="resumen-costo-pts">0 pts</span>
                                    <div style="font-size:11.5px; color:#aaa; margin-top:4px;" id="resumen-saldo-pts">Tu saldo: 0 pts</div>
                                </div>
                            </div>
                        </div>

                        <div class="dh-wizard-actions">
                            <button type="button" class="dh-btn-sec" id="btn-volver-paso2">Atrás</button>
                        </div>
                    </div>

                    <div class="dh-step-panel" id="step-panel-3">
                        <h2 class="dh-step-title">Pago con Tarjeta</h2>
                        <p class="dh-step-sub">Selecciona una tarjeta guardada o ingresa una para compra única.</p>

                        <div id="checkout-card-selector"></div>

                        <form id="checkoutForm">
                            <div id="campos-tarjeta-unica">
                                <div class="dh-field">
                                    <label for="checkoutName">Titular de la Tarjeta</label>
                                    <input type="text" id="checkoutName" placeholder="Nombre como aparece en la tarjeta">
                                </div>

                                <div class="dh-field">
                                    <label for="checkoutCard">Número de Tarjeta (16 dígitos)</label>
                                    <input type="text" id="checkoutCard" placeholder="0000 0000 0000 0000" maxlength="19">
                                </div>

                                <div class="dh-row-2">
                                    <div class="dh-field">
                                        <label for="checkoutExpiry">Vencimiento (Oculto)</label>
                                        <input type="password" id="checkoutExpiry" placeholder="••••" maxlength="5" inputmode="numeric">
                                    </div>
                                    <div class="dh-field">
                                        <label for="checkoutCvv">Código Seguridad (3 dígitos)</label>
                                        <input type="password" id="checkoutCvv" placeholder="•••" maxlength="3" inputmode="numeric">
                                    </div>
                                </div>
                            </div>

                            <div class="dh-wizard-actions">
                                <button type="button" class="dh-btn-sec" id="btn-volver-paso3">Atrás</button>
                                <button type="submit" class="dh-btn-pri" id="btn-pagar-final">Finalizar Compra</button>
                            </div>
                        </form>
                    </div>

                    <div class="dh-step-panel" id="step-panel-procesando">
                        <div class="dh-processing-box">
                            <div class="dh-spinner"></div>
                            <h2 style="color:#d4af37; margin-bottom:8px;">Procesando tu pedido...</h2>
                            <p style="color:#aaa; font-size:14px;">Validando operación y generando tu orden de envío.</p>
                        </div>
                    </div>

                    <div class="dh-step-panel" id="step-panel-completado">
                        <div style="text-align:center; padding: 15px 5px;">
                            <div class="dh-done-check">OK</div>
                            <h2 style="color:#f3d266; font-size:1.5rem; margin-bottom:8px;">Pedido Realizado con Éxito</h2>
                            <p style="color:#bbb; font-size:14px; line-height:1.5;" id="dh-resumen-orden-texto">
                                Tu orden ha sido confirmada y está en preparación.
                            </p>

                            <div class="dh-done-actions">
                                <button type="button" class="dh-btn-pri" onclick="generarPDFTicket()">
                                    Descargar Recibo PDF
                                </button>
                                <button type="button" class="dh-btn-sec" onclick="window.location.href='ayuda.html'">
                                    Ir a Ayuda y Rastrear Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
    }
}

inyectarModalesDinamicos();

const modalCheckout = document.getElementById("modal-checkout");
const btnCerrarCheckout = document.getElementById("cerrar-checkout");
const formCheckout = document.getElementById("checkoutForm");
const inputCheckoutEmail = document.getElementById("checkoutEmail");
const btnFinalizar = document.querySelector(".finalizar");

let tarjetaGuardadaSeleccionadaIdx = -1;

function irAPasoCheckout(numPaso) {
    const stepsHeader = document.getElementById("dh-wizard-steps");
    document.querySelectorAll(".dh-step-panel").forEach(p => p.classList.remove("active"));

    if (numPaso === 0 || numPaso === "procesando" || numPaso === "completado") {
        if (stepsHeader) stepsHeader.style.display = "none";
        const targetId = numPaso === 0 ? "step-panel-0" : `step-panel-${numPaso}`;
        document.getElementById(targetId).classList.add("active");
        return;
    }

    if (stepsHeader) stepsHeader.style.display = "flex";
    const panel = document.getElementById(`step-panel-${numPaso}`);
    if (panel) panel.classList.add("active");

    document.querySelectorAll(".dh-step-dot").forEach(dot => {
        const s = Number(dot.getAttribute("data-step"));
        dot.classList.remove("active", "done");
        if (s === numPaso) dot.classList.add("active");
        if (s < numPaso) dot.classList.add("done");
    });
}

const selectPais = document.getElementById("dirPais");
const grupoEstadoMex = document.getElementById("grupo-estado-mexico");
const grupoEstadoOtro = document.getElementById("grupo-estado-otro");

function actualizarVisibilidadEstado() {
    if (!selectPais) return;
    if (selectPais.value === "México") {
        grupoEstadoMex.style.display = "block";
        grupoEstadoOtro.style.display = "none";
    } else {
        grupoEstadoMex.style.display = "none";
        grupoEstadoOtro.style.display = "block";
    }
}

if (selectPais) {
    selectPais.addEventListener("change", actualizarVisibilidadEstado);
}

function rellenarCamposDireccion(datos) {
    const userEmail = localStorage.getItem("userEmail") || "";
    const username = localStorage.getItem("username") || "";

    if (!datos) {
        document.getElementById("envioNombre").value = "";
        document.getElementById("envioTelefono").value = "";
        document.getElementById("envioReferencias").value = "";
        if (inputCheckoutEmail) {
            inputCheckoutEmail.value = userEmail;
            inputCheckoutEmail.readOnly = Boolean(userEmail);
        }
        selectPais.value = "México";
        actualizarVisibilidadEstado();
        document.getElementById("dirEstadoMexico").value = "";
        document.getElementById("dirEstadoOtro").value = "";
        document.getElementById("dirCiudad").value = "";
        document.getElementById("dirColonia").value = "";
        document.getElementById("dirCalle").value = "";
        document.getElementById("dirNumCasa").value = "";
        document.getElementById("dirCP").value = "";
        return;
    }

    document.getElementById("envioNombre").value = datos.nombre || username;
    document.getElementById("envioTelefono").value = datos.telefono || "";
    document.getElementById("envioReferencias").value = datos.referencias || "";
    if (inputCheckoutEmail) {
        inputCheckoutEmail.value = userEmail || datos.email || "";
        inputCheckoutEmail.readOnly = Boolean(userEmail);
    }

    selectPais.value = datos.pais || "México";
    actualizarVisibilidadEstado();
    if (selectPais.value === "México") {
        document.getElementById("dirEstadoMexico").value = datos.estado || "";
    } else {
        document.getElementById("dirEstadoOtro").value = datos.estado || "";
    }
    document.getElementById("dirCiudad").value = datos.ciudad || "";
    document.getElementById("dirColonia").value = datos.colonia || "";
    document.getElementById("dirCalle").value = datos.calle || "";
    document.getElementById("dirNumCasa").value = datos.numCasa || "";
    document.getElementById("dirCP").value = datos.cp || "";
}

document.getElementById("btn-usar-dir-predeterminada")?.addEventListener("click", () => {
    const dirGuardada = JSON.parse(localStorage.getItem(getKeyDireccionDefault()) || "null");
    rellenarCamposDireccion(dirGuardada);
    irAPasoCheckout(1);
});

document.getElementById("btn-usar-dir-diferente")?.addEventListener("click", () => {
    rellenarCamposDireccion(null);
    irAPasoCheckout(1);
});

function validarDireccionPaso2() {
    const pais = selectPais.value;
    const estado = (pais === "México")
        ? document.getElementById("dirEstadoMexico").value
        : document.getElementById("dirEstadoOtro").value.trim();
    const ciudad = document.getElementById("dirCiudad").value.trim();
    const colonia = document.getElementById("dirColonia").value.trim();
    const calle = document.getElementById("dirCalle").value.trim();
    const numCasa = document.getElementById("dirNumCasa").value.trim();
    const cp = document.getElementById("dirCP").value.trim();

    if (!estado || !ciudad || !colonia || !calle || !numCasa || !cp) {
        alert("Por favor completa todos los campos de tu dirección de residencia antes de continuar.");
        return null;
    }
    return { pais, estado, ciudad, colonia, calle, numCasa, cp };
}

document.getElementById("btn-cancelar-paso1")?.addEventListener("click", () => {
    modalCheckout.classList.remove("activo");
});

document.getElementById("btn-continuar-paso1")?.addEventListener("click", () => {
    const nombre = document.getElementById("envioNombre").value.trim();
    const tel = document.getElementById("envioTelefono").value.trim();
    const email = inputCheckoutEmail.value.trim();

    if (!nombre || !tel || !email) {
        alert("Por favor completa tu nombre, teléfono y correo para continuar.");
        return;
    }
    irAPasoCheckout(2);
});

document.getElementById("btn-volver-paso2")?.addEventListener("click", () => irAPasoCheckout(1));
document.getElementById("btn-volver-paso3")?.addEventListener("click", () => irAPasoCheckout(2));

document.getElementById("opt-pago-normal")?.addEventListener("click", () => {
    if (!validarDireccionPaso2()) return;
    irAPasoCheckout(3);
});

document.getElementById("opt-pago-puntos")?.addEventListener("click", () => {
    const dir = validarDireccionPaso2();
    if (!dir) return;

    const totalMXN = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const costoPuntos = totalMXN * TASA_CANJE_PUNTOS;
    const saldoActual = obtenerPuntosUsuario();

    if (saldoActual < costoPuntos) {
        alert(`No tienes suficientes puntos. Necesitas ${costoPuntos} pts y tu saldo actual es de ${saldoActual} pts.`);
        return;
    }

    ejecutarProcesamientoFinal({
        metodoPagoTexto: `Canje Puntos VIP (${costoPuntos} pts descontados)`,
        titularTarjeta: "Canje de Lealtad Diamond Club",
        ultimos4: "PTS",
        pagoConPuntos: true,
        costoPuntos,
        puntosGanados: 0,
        dir
    });
});

function abrirCheckoutModal() {
    if (!exigirSesionParaComprar()) return;

    carrito = JSON.parse(localStorage.getItem(getKeyCarrito())) || [];
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega gorras para comprar.");
        return;
    }

    cerrarDrawerCarrito();

    const totalPagar = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const costoEnPuntos = totalPagar * TASA_CANJE_PUNTOS;
    const puntosGanar = Math.round(totalPagar * PORCENTAJE_RECOMPENSA);
    const saldoPuntos = obtenerPuntosUsuario();

    document.getElementById("resumen-total-mxn").textContent = `$${totalPagar} MXN`;
    document.getElementById("resumen-ganancia-pts").textContent = `Ganarás +${puntosGanar} pts VIP`;
    document.getElementById("resumen-costo-pts").textContent = `${costoEnPuntos} pts`;

    const cardPuntos = document.getElementById("opt-pago-puntos");
    const saldoEl = document.getElementById("resumen-saldo-pts");
    if (saldoPuntos >= costoEnPuntos) {
        cardPuntos.classList.remove("disabled");
        saldoEl.textContent = `Disponible (Tu saldo: ${saldoPuntos} pts)`;
        saldoEl.style.color = "#2ecc71";
    } else {
        cardPuntos.classList.add("disabled");
        saldoEl.textContent = `Insuficiente (Tu saldo: ${saldoPuntos} pts)`;
        saldoEl.style.color = "#e74c3c";
    }

    const tarjetas = JSON.parse(localStorage.getItem(getKeyTarjetas()) || '[]');
    const selectorEl = document.getElementById('checkout-card-selector');
    if (selectorEl) {
        if (tarjetas.length > 0) {
            selectorEl.innerHTML = `
                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:11.5px; color:#d4af37; text-transform:uppercase; font-weight:700; margin-bottom:8px;">Elige una tarjeta guardada o ingresa una nueva</label>
                    ${tarjetas.map((t, i) => `
                        <div class="dh-saved-card-item" id="saved-card-opt-${i}" onclick="seleccionarModoTarjetaCheckout(${i})">
                            <div>
                                <strong style="color:#fff; font-size:13.5px;">Tarjeta terminación •••• ${t.numero.slice(-4)}</strong>
                                <div style="font-size:11.5px; color:#999;">${t.titular.toUpperCase()} · Expira ${t.expiry}</div>
                            </div>
                            <span style="color:#d4af37; font-size:12px; font-weight:bold;">Usar</span>
                        </div>
                    `).join('')}
                    <div class="dh-saved-card-item selected" id="saved-card-opt-nueva" onclick="seleccionarModoTarjetaCheckout(-1)">
                        <div>
                            <strong style="color:#f3d266; font-size:13.5px;">Usar otra tarjeta (Compra de una sola vez)</strong>
                            <div style="font-size:11.5px; color:#999;">No se guardará en tu billetera</div>
                        </div>
                        <span style="color:#aaa; font-size:12px;">Manual</span>
                    </div>
                </div>
            `;
        } else {
            selectorEl.innerHTML = `<p style="font-size:12px; color:#999; margin-bottom:14px;">Compra de una sola vez (puedes guardar tarjetas permanentes desde tu Perfil en Billetera).</p>`;
        }
    }

    seleccionarModoTarjetaCheckout(-1);

    const btnPagarFinal = document.getElementById("btn-pagar-final");
    if (btnPagarFinal) btnPagarFinal.textContent = `Finalizar Compra ($${totalPagar} MXN)`;

    const historial = JSON.parse(localStorage.getItem(getKeyHistorial()) || "[]");
    const dirPredeterminada = JSON.parse(localStorage.getItem(getKeyDireccionDefault()) || "null");

    if (historial.length > 0 && dirPredeterminada) {
        const previewBox = document.getElementById("dh-preview-direccion-guardada");
        if (previewBox) {
            previewBox.innerHTML = `
                <strong style="color:#f3d266; display:block; margin-bottom:4px;">${dirPredeterminada.nombre} · Tel: ${dirPredeterminada.telefono}</strong>
                <span>${dirPredeterminada.calle} #${dirPredeterminada.numCasa}, Col. ${dirPredeterminada.colonia}</span><br>
                <span>C.P. ${dirPredeterminada.cp}, ${dirPredeterminada.ciudad}, ${dirPredeterminada.estado}, ${dirPredeterminada.pais}</span>
            `;
        }
        irAPasoCheckout(0);
    } else {
        rellenarCamposDireccion(null);
        const username = localStorage.getItem("username") || "";
        if (username) document.getElementById("envioNombre").value = username;
        irAPasoCheckout(1);
    }

    if (modalCheckout) modalCheckout.classList.add("activo");
}
window.abrirCheckoutModal = abrirCheckoutModal;

window.seleccionarModoTarjetaCheckout = function (index) {
    tarjetaGuardadaSeleccionadaIdx = index;
    document.querySelectorAll(".dh-saved-card-item").forEach(el => el.classList.remove("selected"));

    const camposManuales = document.getElementById("campos-tarjeta-unica");
    if (index === -1) {
        const optNueva = document.getElementById("saved-card-opt-nueva");
        if (optNueva) optNueva.classList.add("selected");
        if (camposManuales) camposManuales.style.display = "block";
    } else {
        const optGuardada = document.getElementById(`saved-card-opt-${index}`);
        if (optGuardada) optGuardada.classList.add("selected");
        if (camposManuales) camposManuales.style.display = "none";
    }
};

if (btnFinalizar) {
    btnFinalizar.addEventListener("click", abrirCheckoutModal);
}

if (btnCerrarCheckout) {
    btnCerrarCheckout.addEventListener("click", () => {
        modalCheckout.classList.remove("activo");
    });
}

const inputCard = document.getElementById("checkoutCard");
if (inputCard) {
    inputCard.addEventListener("input", () => {
        let digits = inputCard.value.replace(/\D/g, '').substring(0, 16);
        inputCard.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
}

const inputExpiry = document.getElementById("checkoutExpiry");
if (inputExpiry) {
    inputExpiry.addEventListener("input", (e) => {
        let val = inputExpiry.value.replace(/\D/g, '').substring(0, 4);
        if (e.inputType === "deleteContentBackward" && val.length === 2) {
            inputExpiry.value = val;
            return;
        }
        inputExpiry.value = val.length >= 2 ? val.substring(0, 2) + '/' + val.substring(2, 4) : val;
    });
}

if (formCheckout) {
    formCheckout.addEventListener("submit", (e) => {
        e.preventDefault();
        const dir = validarDireccionPaso2();
        if (!dir) return;

        let titular = "";
        let ultimos4 = "";

        if (tarjetaGuardadaSeleccionadaIdx >= 0) {
            const tarjetas = JSON.parse(localStorage.getItem(getKeyTarjetas()) || '[]');
            const t = tarjetas[tarjetaGuardadaSeleccionadaIdx];
            if (!t) return;
            titular = t.titular;
            ultimos4 = t.numero.slice(-4);
        } else {
            const rawCard = inputCard ? inputCard.value.replace(/\s/g, '') : "";
            const expiryVal = inputExpiry ? inputExpiry.value.trim() : "";
            const cvvVal = document.getElementById("checkoutCvv")?.value.trim() || "";
            titular = document.getElementById("checkoutName").value.trim();

            if (!titular || rawCard.length < 16 || expiryVal.length < 4 || cvvVal.length < 3) {
                alert("Por favor completa todos los datos de tu tarjeta correctamente.");
                return;
            }
            ultimos4 = rawCard.slice(-4);
        }

        const totalMXN = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const puntosGanados = Math.round(totalMXN * PORCENTAJE_RECOMPENSA);

        ejecutarProcesamientoFinal({
            metodoPagoTexto: `Tarjeta terminación *${ultimos4}`,
            titularTarjeta: titular,
            ultimos4,
            pagoConPuntos: false,
            costoPuntos: 0,
            puntosGanados,
            dir
        });
    });
}

function ejecutarProcesamientoFinal({ metodoPagoTexto, titularTarjeta, ultimos4, pagoConPuntos, costoPuntos, puntosGanados, dir }) {
    const destinatario = document.getElementById("envioNombre").value.trim();
    const telefono = document.getElementById("envioTelefono").value.trim();
    const referencias = document.getElementById("envioReferencias").value.trim();
    const emailFacturacion = inputCheckoutEmail.value.trim();

    const datosDireccionGuardar = {
        nombre: destinatario,
        telefono,
        email: emailFacturacion,
        referencias,
        pais: dir.pais,
        estado: dir.estado,
        ciudad: dir.ciudad,
        colonia: dir.colonia,
        calle: dir.calle,
        numCasa: dir.numCasa,
        cp: dir.cp
    };
    localStorage.setItem(getKeyDireccionDefault(), JSON.stringify(datosDireccionGuardar));
    if (typeof window.sincronizarDireccionFirestore === "function") {
        window.sincronizarDireccionFirestore(datosDireccionGuardar);
    }

    const direccionCompleta = `${dir.calle} #${dir.numCasa}, Col. ${dir.colonia}, C.P. ${dir.cp}, ${dir.ciudad}, ${dir.estado}, ${dir.pais} (Tel: ${telefono})`;

    let itemsHtml = "";
    let totalVal = 0;
    const itemsParaDescontarStock = [...carrito];

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        totalVal += subtotal;
        itemsHtml += `
            <div class="ticket-item-row">
                <span>${p.nombre} x${p.cantidad}</span>
                <span>${pagoConPuntos ? (subtotal * TASA_CANJE_PUNTOS) + ' pts' : '$' + subtotal + ' MXN'}</span>
            </div>
        `;
    });

    const ticketId = `DH-${Math.floor(100000 + Math.random() * 900000)}-MX`;
    const activeUser = destinatario || localStorage.getItem("username") || "Cliente";

    window._ticketData = {
        ticketId,
        activeUser,
        emailFacturacion,
        cardHolder: titularTarjeta,
        rawCard: "000000000000" + ultimos4,
        metodoPagoTexto,
        itemsHtml,
        totalVal: pagoConPuntos ? `${costoPuntos} pts (Canje VIP)` : totalVal,
        pagoConPuntos,
        direccionCompleta,
        date: new Date().toLocaleString(),
        en_progreso: true,
        estado_envio: "Confirmado"
    };

    irAPasoCheckout("procesando");

    setTimeout(async () => {
        if (typeof window.descontarStockProductosEnFirestore === "function") {
            await window.descontarStockProductosEnFirestore(itemsParaDescontarStock);
        }

        const saldoPrevio = obtenerPuntosUsuario();
        const nuevoSaldo = pagoConPuntos
            ? (saldoPrevio - costoPuntos)
            : (saldoPrevio + puntosGanados);
        guardarPuntosUsuario(nuevoSaldo);

        let historialCuenta = JSON.parse(localStorage.getItem(getKeyHistorial()) || "[]");
        historialCuenta.unshift(window._ticketData);
        localStorage.setItem(getKeyHistorial(), JSON.stringify(historialCuenta));

        if (typeof window.sincronizarPedidosFirestore === "function") {
            window.sincronizarPedidosFirestore(historialCuenta);
        }

        carrito = [];
        guardarCarrito();
        actualizarCarrito();
        if (formCheckout) formCheckout.reset();

        const resumenTexto = document.getElementById("dh-resumen-orden-texto");
        if (resumenTexto) {
            const detallePts = pagoConPuntos
                ? `Se canjearon <strong>${costoPuntos} pts</strong>. Saldo restante: <strong>${nuevoSaldo} pts</strong>.`
                : `Ganaste <strong>+${puntosGanados} pts VIP</strong>. Tu nuevo saldo es: <strong>${nuevoSaldo} pts</strong>.`;

            resumenTexto.innerHTML = `Orden <strong>${ticketId}</strong> confirmada para envío a <strong>${dir.ciudad}, ${dir.estado}</strong>.<br>${detallePts}`;
        }

        irAPasoCheckout("completado");
    }, 2000);
}

window.addEventListener("click", (e) => {
    if (e.target === modalCheckout) {
        modalCheckout.classList.remove("activo");
    }
});

function generarPDFTicket() {
    const d = window._ticketData;
    if (!d) { alert("No hay datos de ticket disponibles."); return; }

    const downloadUrl = window.location.origin + `/descargar-ticket.html?id=${d.ticketId}`;
    const qrContent = encodeURIComponent(downloadUrl);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrContent}`;
    const totalTextoPDF = d.pagoConPuntos ? d.totalVal : `$${d.totalVal} MXN`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket Diamond Hats - ${d.ticketId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 40px; max-width: 620px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #cca142; padding-bottom: 18px; margin-bottom: 20px; }
    .header h1 { font-size: 26px; letter-spacing: 3px; color: #111; }
    .header p { color: #888; font-size: 13px; margin-top: 4px; }
    .meta { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 18px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 14px 0 6px; }
    .info-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px dashed #eee; }
    .info-row:last-child { border-bottom: none; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 12px 0 0; border-top: 2px solid #cca142; margin-top: 10px; }
    .stamp-qr { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
    .stamp { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #cca142; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #cca142; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 10px; }
    .qr-block { text-align: center; }
    .qr-block img { width: 120px; height: 120px; border: 1px solid #ddd; border-radius: 6px; }
    .qr-block p { font-size: 10px; color: #999; margin-top: 5px; }
    .footer { text-align: center; font-size: 11px; color: #bbb; margin-top: 28px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>DIAMOND HATS</h1>
    <p>Estilo con actitud y distinción</p>
  </div>
  <div class="meta">
    <span><strong>Ticket ID:</strong> ${d.ticketId}</span>
    <span><strong>Fecha:</strong> ${d.date}</span>
  </div>

  <div class="section-title">Datos del Cliente</div>
  <div class="info-row"><span>Destinatario</span><span>${d.activeUser}</span></div>
  <div class="info-row"><span>Correo</span><span>${d.emailFacturacion}</span></div>
  <div class="info-row"><span>Modalidad</span><span>${d.metodoPagoTexto || d.cardHolder}</span></div>
  <div class="info-row"><span>Dirección de Envío</span><span style="font-size:12px;text-align:right;max-width:340px;">${d.direccionCompleta}</span></div>

  <div class="section-title">Productos</div>
  ${d.itemsHtml.replace(/ticket-item-row/g, 'info-row')}

  <div class="total-row">
    <span>Total Liquidado</span>
    <span>${totalTextoPDF}</span>
  </div>

  <div class="stamp-qr">
    <div class="stamp">
      <div>DIAMOND<br>HATS</div>
      <div style="font-size:8px;margin-top:4px;color:#888;">TICKET VERIFICADO</div>
    </div>
    <div class="qr-block">
      <img src="${qrUrl}" alt="QR Ticket">
      <p>Escanea para verificar tu compra</p>
    </div>
  </div>

  <div class="footer">
    © 2026 Diamond Hats · Todos los derechos reservados
  </div>

  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
  <\/script>
</body>
</html>`;

    const popup = window.open("", "_blank", "width=680,height=920,scrollbars=yes");
    if (popup) {
        popup.document.write(html);
        popup.document.close();
    } else {
        alert("Por favor permite ventanas emergentes para descargar el ticket PDF.");
    }
}

window.generarPDFTicket = generarPDFTicket;