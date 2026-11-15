import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ADMIN_EMAIL = "admin@diamondhats.com";
let avatarRegistroBase64 = "";

localStorage.removeItem("historial_compras");
localStorage.removeItem("tarjetas_guardadas");
localStorage.removeItem("favoritos_ids");
localStorage.removeItem("carrito");

function getAccountEmail() {
    return (localStorage.getItem("userEmail") || "guest").toLowerCase();
}

function getKeyHistorial() {
    return "historial_compras_" + getAccountEmail();
}

function getKeyTarjetas() {
    return "tarjetas_guardadas_" + getAccountEmail();
}

function getKeyFavoritos() {
    return "favoritos_ids_" + getAccountEmail();
}

function getKeyDireccionDefault() {
    return "direccion_default_" + getAccountEmail();
}

// ============================================================
// GESTIÓN DE MÚLTIPLES SESIONES ABIERTAS (SIN PEDIR CONTRASEÑA)
// ============================================================
function obtenerCuentasGuardadas() {
    try {
        return JSON.parse(localStorage.getItem("dh_saved_accounts") || "[]");
    } catch (e) {
        return [];
    }
}

function registrarCuentaEnSelector({ email, username, password, avatar, sesionAbierta }) {
    if (!email) return;
    const lista = obtenerCuentasGuardadas();
    const idx = lista.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    const existente = idx >= 0 ? lista[idx] : {};

    const actualizado = {
        email: email.toLowerCase(),
        username: username || existente.username || email.split("@")[0],
        secret: password ? btoa(unescape(encodeURIComponent(password))) : (existente.secret || ""),
        avatar: avatar !== undefined ? avatar : (existente.avatar || ""),
        sesionAbierta: sesionAbierta !== undefined ? sesionAbierta : (existente.sesionAbierta !== undefined ? existente.sesionAbierta : true)
    };

    if (idx >= 0) {
        lista[idx] = actualizado;
    } else {
        lista.push(actualizado);
    }
    localStorage.setItem("dh_saved_accounts", JSON.stringify(lista));
}

function marcarSesionCerradaEnCuenta(email) {
    if (!email) return;
    const lista = obtenerCuentasGuardadas();
    const idx = lista.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
    if (idx >= 0) {
        lista[idx].sesionAbierta = false;
        localStorage.setItem("dh_saved_accounts", JSON.stringify(lista));
    }
}

function decodificarSecret(secretStr) {
    if (!secretStr) return "";
    try {
        return decodeURIComponent(escape(atob(secretStr)));
    } catch (e) {
        return "";
    }
}

(function () {
    const savedTheme = localStorage.getItem("diamond_theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
})();

window.sincronizarPuntosFirestore = async function (puntos) {
    try {
        if (auth.currentUser) {
            await setDoc(doc(db, "usuarios", auth.currentUser.uid), { puntosVIP: puntos }, { merge: true });
        }
    } catch (e) { }
};

window.sincronizarPedidosFirestore = async function (pedidos) {
    try {
        if (auth.currentUser) {
            await setDoc(doc(db, "usuarios", auth.currentUser.uid), { pedidos }, { merge: true });
        }
    } catch (e) { }
};

window.sincronizarTarjetasFirestore = async function (tarjetas) {
    try {
        if (auth.currentUser) {
            await setDoc(doc(db, "usuarios", auth.currentUser.uid), { tarjetas }, { merge: true });
        }
    } catch (e) { }
};

window.sincronizarDireccionFirestore = async function (direccionDefault) {
    try {
        if (auth.currentUser) {
            await setDoc(doc(db, "usuarios", auth.currentUser.uid), { direccionDefault }, { merge: true });
        }
    } catch (e) { }
};

function procesarImagenPerfil(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const SIZE = 240;
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext("2d");

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, SIZE, SIZE);

            const base64Comprimida = canvas.toDataURL("image/jpeg", 0.84);
            callback(base64Comprimida);
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function inyectarEstilosAuthExtra() {
    if (document.getElementById("dh-auth-extra-styles")) return;
    const style = document.createElement("style");
    style.id = "dh-auth-extra-styles";
    style.textContent = `
        .reg-avatar-picker {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 16px;
        }
        .reg-avatar-circle {
            width: 82px;
            height: 82px;
            border-radius: 50%;
            border: 2px dashed #cca142;
            background: rgba(204, 161, 66, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
            position: relative;
            transition: all 0.25s ease;
            color: #cca142;
            font-size: 12px;
            font-weight: 700;
        }
        .reg-avatar-circle:hover {
            border-style: solid;
            transform: scale(1.05);
            box-shadow: 0 0 18px rgba(204, 161, 66, 0.35);
        }
        .reg-avatar-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .reg-avatar-label {
            font-size: 11.5px;
            color: #cca142;
            margin-top: 6px;
            font-weight: 600;
            cursor: pointer;
        }
        .psw-checklist {
            list-style: none;
            margin: 8px 0 4px 0;
            padding: 8px 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .psw-req-item {
            font-size: 12px;
            color: #888;
            display: flex;
            align-items: center;
            gap: 7px;
            transition: color 0.25s ease;
        }
        .psw-req-item.met {
            color: #2ecc71;
            font-weight: 600;
        }
        .psw-req-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            font-size: 10px;
            border: 1px solid currentColor;
        }
        .btn-checkout-pay:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            transform: none !important;
        }

        /* CENTRO DE PERFIL VIP SIN BARRAS DE DESLIZAMIENTO VISIBLES */
        #modal-user-profile {
            display: none !important;
            pointer-events: none !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0, 0, 0, 0) !important;
            z-index: 3500 !important;
        }
        #modal-user-profile.activo {
            display: flex !important;
            pointer-events: auto !important;
            background: rgba(0, 0, 0, 0.82) !important;
            backdrop-filter: blur(10px) !important;
        }
        .dh-hub-window {
            width: 94%;
            max-width: 960px;
            height: auto;
            max-height: 92vh;
            background: linear-gradient(155deg, #161616 0%, #0b0b0b 100%);
            border: 1px solid rgba(212, 175, 55, 0.45);
            border-radius: 22px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.16);
            display: grid;
            grid-template-columns: 265px 1fr;
            overflow: hidden;
            position: relative;
            color: #f5f5f5;
            animation: dhHubPop 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
        }
        @keyframes dhHubPop {
            from { transform: scale(0.9) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .dh-hub-close {
            position: absolute;
            top: 16px;
            right: 18px;
            padding: 6px 12px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #bbb;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            z-index: 20;
            transition: 0.25s;
        }
        .dh-hub-close:hover {
            background: #e74c3c;
            color: #fff;
            border-color: #e74c3c;
        }
        .dh-hub-sidebar {
            background: linear-gradient(180deg, rgba(212, 175, 55, 0.09) 0%, rgba(14, 14, 14, 0.98) 45%);
            border-right: 1px solid rgba(212, 175, 55, 0.2);
            padding: 20px 18px;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .dh-hub-sidebar::-webkit-scrollbar,
        .dh-hub-content::-webkit-scrollbar,
        #modal-auth .auth-modal-container::-webkit-scrollbar {
            display: none;
        }
        .dh-hub-avatar-wrap {
            position: relative;
            width: 86px;
            height: 86px;
            border-radius: 50%;
            padding: 3px;
            background: linear-gradient(135deg, #f3d266, #b0882e, #ffeaa7);
            box-shadow: 0 0 22px rgba(212, 175, 55, 0.4);
            cursor: pointer;
            margin-bottom: 10px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
        }
        .dh-hub-avatar-wrap:hover {
            transform: scale(1.05);
        }
        .dh-hub-avatar-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #141414;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 700;
            color: #d4af37;
        }
        .dh-hub-avatar-inner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .dh-hub-cam-badge {
            position: absolute;
            bottom: 0;
            right: -4px;
            padding: 2px 7px;
            border-radius: 10px;
            background: #d4af37;
            color: #111;
            font-size: 10px;
            font-weight: 800;
            border: 2px solid #111;
        }
        .dh-hub-username {
            font-size: 1.08rem;
            font-weight: 800;
            color: #fff;
            text-align: center;
            margin-bottom: 2px;
        }
        .dh-hub-email {
            font-size: 0.75rem;
            color: #888;
            margin-bottom: 8px;
            text-align: center;
            word-break: break-all;
        }
        .dh-rank-pill {
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.2), rgba(243, 210, 102, 0.35), rgba(212, 175, 55, 0.2));
            border: 1px solid #d4af37;
            color: #f3d266;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 12px;
            border-radius: 20px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 14px;
        }
        .dh-hub-nav {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 5px;
            flex: 1;
        }
        .dh-hub-tab-btn {
            width: 100%;
            padding: 9px 13px;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid transparent;
            color: #ccc;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.22s ease;
        }
        .dh-hub-tab-btn:hover {
            background: rgba(212, 175, 55, 0.12);
            color: #fff;
            transform: translateX(3px);
        }
        .dh-hub-tab-btn.active {
            background: linear-gradient(135deg, #d4af37, #b0882e);
            color: #111;
            font-weight: 800;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35);
        }
        .dh-hub-admin-link {
            width: 100%;
            padding: 9px 12px;
            border-radius: 9px;
            background: rgba(212, 175, 55, 0.14);
            border: 1px solid #d4af37;
            color: #f3d266;
            font-size: 12.5px;
            font-weight: 800;
            text-decoration: none;
            text-align: center;
            margin-top: 8px;
            transition: 0.25s;
        }
        .dh-hub-admin-link:hover {
            background: #d4af37;
            color: #111;
        }
        .dh-hub-switch-btn {
            width: 100%;
            margin-top: 8px;
            padding: 9px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.22);
            color: #f5f5f5;
            border-radius: 9px;
            font-weight: 700;
            font-size: 12.5px;
            cursor: pointer;
            transition: 0.25s;
        }
        .dh-hub-switch-btn:hover {
            border-color: #d4af37;
            color: #f3d266;
            background: rgba(212, 175, 55, 0.12);
        }
        .dh-hub-logout {
            width: 100%;
            margin-top: 7px;
            padding: 9px;
            background: rgba(231, 76, 60, 0.15);
            border: 1px solid rgba(231, 76, 60, 0.5);
            color: #ff6b6b;
            border-radius: 9px;
            font-weight: 700;
            font-size: 12.5px;
            cursor: pointer;
            transition: 0.25s;
        }
        .dh-hub-logout:hover {
            background: #e74c3c;
            color: #fff;
        }
        .dh-hub-content {
            padding: 26px 32px;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            display: flex;
            flex-direction: column;
        }
        .dh-hub-pane {
            display: none;
            animation: dhPaneFade 0.3s ease forwards;
        }
        .dh-hub-pane.active {
            display: block;
        }
        @keyframes dhPaneFade {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .dh-pane-header {
            margin-bottom: 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 10px;
        }
        .dh-pane-header h2 {
            color: #f3d266;
            font-size: 1.38rem;
            margin-bottom: 3px;
        }
        .dh-pane-header p {
            color: #888;
            font-size: 0.85rem;
        }
        .dh-kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 18px;
        }
        .dh-kpi-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(212, 175, 55, 0.22);
            border-radius: 12px;
            padding: 13px;
            text-align: center;
        }
        .dh-kpi-num {
            font-size: 1.5rem;
            font-weight: 800;
            color: #d4af37;
            display: block;
        }
        .dh-kpi-label {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .dh-vip-pass {
            background: linear-gradient(135deg, #1f1b10 0%, #111111 55%, #2b220c 100%);
            border: 1px solid #d4af37;
            border-radius: 14px;
            padding: 16px 20px;
            margin-bottom: 18px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), inset 0 0 22px rgba(212, 175, 55, 0.12);
        }
        .dh-vip-pass-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .dh-vip-pass-brand {
            font-size: 11.5px;
            letter-spacing: 2px;
            color: #d4af37;
            font-weight: 800;
        }
        .dh-vip-pass-id {
            font-family: 'Courier New', monospace;
            font-size: 11.5px;
            color: #aaa;
        }
        .dh-vip-pass-bio {
            font-style: italic;
            color: #e0e0e0;
            font-size: 13px;
            margin-bottom: 10px;
        }
        .dh-vip-pass-footer {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #f3d266;
            font-weight: 600;
        }
        .dh-edit-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
        }
        .dh-hub-input-group label {
            display: block;
            font-size: 11px;
            color: #aaa;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .dh-hub-input-group input, .dh-hub-input-group select {
            width: 100%;
            padding: 10px 12px;
            background: #1f1f1f;
            border: 1px solid #333;
            border-radius: 9px;
            color: #fff;
            font-size: 13.5px;
            outline: none;
        }
        .dh-hub-input-group input:focus, .dh-hub-input-group select:focus {
            border-color: #d4af37;
        }
        .dh-btn-save-hub {
            padding: 11px 22px;
            background: linear-gradient(135deg, #d4af37, #b0882e);
            color: #111;
            border: none;
            border-radius: 9px;
            font-weight: 800;
            font-size: 13.5px;
            cursor: pointer;
            transition: 0.25s;
        }
        .dh-btn-save-hub:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }
        .dh-order-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid #2c2c2c;
            border-radius: 12px;
            padding: 13px 16px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        /* MODAL CAMBIAR SESIÓN / SELECTOR DE CUENTAS ACTIVAS */
        #modal-switch-account {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.82);
            backdrop-filter: blur(8px);
            z-index: 4500;
            align-items: center;
            justify-content: center;
        }
        #modal-switch-account.activo {
            display: flex;
        }
        .dh-switch-card {
            width: 92%;
            max-width: 440px;
            background: linear-gradient(155deg, #1a1a1a, #0e0e0e);
            border: 1px solid rgba(212, 175, 55, 0.5);
            border-radius: 20px;
            padding: 28px 26px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
            color: #f5f5f5;
            position: relative;
            animation: dhHubPop 0.28s ease forwards;
        }
        .dh-account-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid #2e2e2e;
            margin-bottom: 10px;
            transition: 0.22s;
        }
        .dh-account-row.current {
            border-color: #d4af37;
            background: rgba(212, 175, 55, 0.12);
        }
        .dh-account-row.other {
            cursor: pointer;
        }
        .dh-account-row.other:hover {
            border-color: #d4af37;
            background: rgba(212, 175, 55, 0.08);
            transform: translateX(3px);
        }
        .dh-acc-mini-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #222;
            border: 1px solid #d4af37;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
            color: #d4af37;
            flex-shrink: 0;
        }
        .dh-acc-mini-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .dh-badge-active-acc {
            background: #d4af37;
            color: #111;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 9px;
            border-radius: 12px;
            text-transform: uppercase;
        }

        @media (max-width: 820px) {
            .dh-hub-window {
                grid-template-columns: 1fr;
                max-height: 92vh;
            }
            .dh-hub-sidebar {
                border-right: none;
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                padding: 16px;
            }
            .dh-hub-nav {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
            }
            .dh-hub-tab-btn {
                width: auto;
                padding: 7px 11px;
                font-size: 12px;
            }
            .dh-kpi-grid, .dh-edit-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

function mostrarNotificacionAuth(titulo, subtitulo, tipo = "success", callback = null) {
    if (!document.getElementById("dh-auth-toast-styles")) {
        const style = document.createElement("style");
        style.id = "dh-auth-toast-styles";
        style.textContent = `
            .dh-toast-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.72);
                backdrop-filter: blur(6px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 0;
                animation: dhFadeIn 0.28s ease forwards;
            }
            .dh-toast-card {
                background: linear-gradient(145deg, #181818, #0e0e0e);
                border: 1px solid rgba(212, 175, 55, 0.55);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(212, 175, 55, 0.2);
                border-radius: 18px;
                padding: 34px 38px;
                text-align: center;
                max-width: 380px;
                width: 90%;
                color: #f5f5f5;
                transform: scale(0.8) translateY(15px);
                animation: dhPopUp 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            .dh-toast-card.error {
                border-color: rgba(231, 76, 60, 0.65);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(231, 76, 60, 0.2);
            }
            .dh-icon-ring {
                width: 68px;
                height: 68px;
                border-radius: 50%;
                margin: 0 auto 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(212, 175, 55, 0.12);
                border: 2px solid #d4af37;
                animation: dhPulseRing 1.4s ease infinite;
            }
            .dh-toast-card.error .dh-icon-ring {
                background: rgba(231, 76, 60, 0.12);
                border-color: #e74c3c;
            }
            .dh-check-svg {
                width: 34px;
                height: 34px;
                stroke: #d4af37;
                stroke-width: 3;
                fill: none;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 50;
                stroke-dashoffset: 50;
                animation: dhDrawCheck 0.45s 0.18s ease forwards;
            }
            .dh-toast-card.error .dh-check-svg {
                stroke: #e74c3c;
            }
            .dh-toast-title {
                font-size: 1.35rem;
                font-weight: 700;
                color: #d4af37;
                margin-bottom: 8px;
                letter-spacing: 0.5px;
            }
            .dh-toast-card.error .dh-toast-title {
                color: #ff6b6b;
            }
            .dh-toast-sub {
                font-size: 0.92rem;
                color: #bbb;
                line-height: 1.5;
            }
            .dh-progress-bar {
                height: 3px;
                width: 100%;
                background: rgba(255,255,255,0.08);
                border-radius: 3px;
                margin-top: 22px;
                overflow: hidden;
            }
            .dh-progress-fill {
                height: 100%;
                width: 100%;
                background: linear-gradient(90deg, #b8952b, #f3d266);
                transform-origin: left;
                animation: dhShrink 1.7s linear forwards;
            }
            .dh-toast-card.error .dh-progress-fill {
                background: #e74c3c;
            }
            @keyframes dhFadeIn { to { opacity: 1; } }
            @keyframes dhPopUp { to { transform: scale(1) translateY(0); } }
            @keyframes dhDrawCheck { to { stroke-dashoffset: 0; } }
            @keyframes dhShrink { to { transform: scaleX(0); } }
            @keyframes dhPulseRing {
                0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
                70% { box-shadow: 0 0 0 12px rgba(212, 175, 55, 0); }
                100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
            }
        `;
        document.head.appendChild(style);
    }

    const prev = document.getElementById("dh-active-toast");
    if (prev) prev.remove();

    const iconoSVG = tipo === "error"
        ? `<svg class="dh-check-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg class="dh-check-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    const overlay = document.createElement("div");
    overlay.id = "dh-active-toast";
    overlay.className = "dh-toast-overlay";
    overlay.innerHTML = `
        <div class="dh-toast-card ${tipo === "error" ? "error" : ""}">
            <div class="dh-icon-ring">${iconoSVG}</div>
            <div class="dh-toast-title">${titulo}</div>
            <div class="dh-toast-sub">${subtitulo}</div>
            <div class="dh-progress-bar"><div class="dh-progress-fill"></div></div>
        </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.transition = "opacity 0.25s ease";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
            if (typeof callback === "function") callback();
        }, 250);
    }, 1750);
}
window.mostrarNotificacionAuth = mostrarNotificacionAuth;

document.addEventListener("DOMContentLoaded", () => {
    inyectarEstilosAuthExtra();

    const menuBtn = document.querySelector(".menu-btn");
    const navbar = document.querySelector(".navbar");

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    const iconsContainer = document.querySelector(".icons");
    if (iconsContainer && !document.getElementById("btn-perfil-usuario")) {
        const profileBtn = document.createElement("button");
        profileBtn.id = "btn-perfil-usuario";
        profileBtn.className = "user-btn";
        profileBtn.title = "Mi Cuenta";
        profileBtn.innerHTML = "Perfil";
        profileBtn.style.fontSize = "12px";
        profileBtn.style.fontWeight = "700";
        iconsContainer.insertBefore(profileBtn, iconsContainer.firstChild);
    }

    if (iconsContainer && !document.getElementById("btn-tema-toggle")) {
        const themeBtn = document.createElement("button");
        themeBtn.id = "btn-tema-toggle";
        themeBtn.className = "theme-toggle-btn";
        themeBtn.title = "Cambiar Tema";
        themeBtn.style.fontSize = "11px";
        themeBtn.style.fontWeight = "700";

        const isDark = document.body.classList.contains("dark-mode");
        themeBtn.innerHTML = isDark ? "Oscuro" : "Claro";

        iconsContainer.insertBefore(themeBtn, iconsContainer.firstChild);

        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const nowDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("diamond_theme", nowDark ? "dark" : "light");
            themeBtn.innerHTML = nowDark ? "Oscuro" : "Claro";
        });
    }

    function inyectarModalesAuth() {
        if (!document.getElementById("modal-auth")) {
            const authHTML = `
                <div id="modal-auth" class="modal-overlay">
                    <div class="modal-container auth-modal-container" style="height:auto; max-height:92vh; overflow-y:auto;">
                        <button id="cerrar-auth" class="modal-cerrar-btn">Cerrar</button>
                        <div class="auth-tabs">
                            <button id="tab-login" class="auth-tab activo">Iniciar Sesión</button>
                            <button id="tab-register" class="auth-tab">Registrarse</button>
                        </div>
                        
                        <form id="authLoginForm" class="auth-form activo">
                            <h2>Inicia Sesión</h2>
                            <div class="checkout-field">
                                <label for="authLoginEmail">Correo Electrónico</label>
                                <input type="email" id="authLoginEmail" placeholder="correo@ejemplo.com" required>
                            </div>
                            <div class="checkout-field">
                                <label for="authLoginPass">Contraseña</label>
                                <input type="password" id="authLoginPass" placeholder="Tu contraseña" required>
                            </div>
                            <button type="submit" class="btn-checkout-pay" id="authLoginBtn">Entrar</button>
                        </form>

                        <form id="authRegisterForm" class="auth-form">
                            <h2>Crea Tu Cuenta</h2>

                            <div class="reg-avatar-picker">
                                <div class="reg-avatar-circle" id="regAvatarCircle" title="Seleccionar foto de perfil">
                                    <span id="regAvatarPreview">Foto</span>
                                </div>
                                <span class="reg-avatar-label" id="regAvatarLabel">+ Elegir foto de perfil (opcional)</span>
                                <input type="file" id="authRegAvatarInput" accept="image/*" style="display:none;">
                            </div>

                            <div class="checkout-field">
                                <label for="authRegUser">Nombre de usuario (editable)</label>
                                <input type="text" id="authRegUser" placeholder="Usuario" required autocomplete="off">
                            </div>

                            <div class="checkout-field">
                                <label for="authRegEmail">Correo Electrónico</label>
                                <input type="email" id="authRegEmail" placeholder="correo@ejemplo.com" required>
                            </div>
                            
                            <div class="checkout-field">
                                <label for="authRegPass">Contraseña</label>
                                <input type="password" id="authRegPass" placeholder="Crea tu contraseña" required>
                                
                                <div class="psw-strength-container" style="width: 100%; height: 6px; background-color: #2c2c2c; border-radius: 3px; margin-top: 7px; overflow: hidden;">
                                    <div class="psw-strength-bar" id="authPswBar" style="height: 100%; width: 0%; transition: width 0.3s ease, background-color 0.3s ease;"></div>
                                </div>
                                <span id="authPswText" class="psw-strength-text" style="font-size: 11.5px; color: #888; margin-top: 4px; display: block; text-align: left; font-weight:600;">Ingresa una contraseña segura</span>

                                <ul class="psw-checklist" id="pswChecklist">
                                    <li class="psw-req-item" id="req-len"><span class="psw-req-icon">○</span> Más de 8 caracteres (mínimo 9)</li>
                                    <li class="psw-req-item" id="req-upper"><span class="psw-req-icon">○</span> Al menos 1 letra mayúscula</li>
                                    <li class="psw-req-item" id="req-special"><span class="psw-req-icon">○</span> Al menos 1 signo especial (!@#$%&*)</li>
                                </ul>
                            </div>

                            <div class="checkout-field">
                                <label for="authRegPassConfirm">Repetir Contraseña</label>
                                <input type="password" id="authRegPassConfirm" placeholder="Vuelve a escribir tu contraseña" required>
                                <span id="authPswMatchText" style="font-size: 11.5px; margin-top: 4px; display: block; text-align: left; font-weight:600;"></span>
                            </div>

                            <button type="submit" class="btn-checkout-pay" id="authRegSubmitBtn" disabled>Crear Cuenta</button>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', authHTML);
        }

        if (!document.getElementById("modal-user-profile")) {
            const cardColors = ['card-dark', 'card-gold', 'card-blue', 'card-red', 'card-green'];
            const colorLabels = ['Clásica', 'Gold', 'Royal', 'Crimson', 'Emerald'];
            const colorPicker = cardColors.map((c, i) =>
                `<button type="button" class="card-color-pick" data-color="${c}" style="width:30px;height:30px;border-radius:50%;border:2px solid transparent;cursor:pointer;background:${i === 0 ? '#222' : i === 1 ? '#3a2a00' : i === 2 ? '#0a0e2e' : i === 3 ? '#5c0000' : '#004515'};transition:all 0.2s;" title="${colorLabels[i]}"></button>`
            ).join('');

            const hubHTML = `
                <div id="modal-user-profile" class="modal-overlay">
                    <div class="dh-hub-window">
                        <button id="cerrar-profile" class="dh-hub-close">Cerrar</button>

                        <aside class="dh-hub-sidebar">
                            <div class="dh-hub-avatar-wrap" id="profileAvatarCircle" title="Clic para cambiar foto de perfil">
                                <div class="dh-hub-avatar-inner" id="profileAvatarEmoji">Avatar</div>
                                <span class="dh-hub-cam-badge">Editar</span>
                                <input type="file" id="profileAvatarInput" accept="image/*" style="display:none;">
                            </div>

                            <div class="dh-hub-username" id="profileUserVal">Cliente</div>
                            <div class="dh-hub-email" id="profileEmailVal">correo@ejemplo.com</div>
                            <div class="dh-rank-pill" id="dhMemberRank">Bronze Collector</div>

                            <nav class="dh-hub-nav">
                                <button class="dh-hub-tab-btn active" data-hub-tab="resumen">Resumen y Pase VIP</button>
                                <button class="dh-hub-tab-btn" data-hub-tab="favoritos">Mis Favoritos</button>
                                <button class="dh-hub-tab-btn" data-hub-tab="billetera">Billetera y Tarjetas</button>
                                <button class="dh-hub-tab-btn" data-hub-tab="pedidos">Mis Pedidos</button>
                                <button class="dh-hub-tab-btn" data-hub-tab="seguridad">Seguridad</button>
                            </nav>

                            <a href="control.html" id="btn-admin-panel-profile" class="dh-hub-admin-link" style="display:none;">Abrir Panel Admin</a>
                            <button type="button" id="btn-switch-session" class="dh-hub-switch-btn">Cambiar Sesión</button>
                            <button type="button" id="btn-logout" class="dh-hub-logout">Cerrar Sesión</button>
                        </aside>

                        <section class="dh-hub-content">
                            <div class="dh-hub-pane active" id="hub-pane-resumen">
                                <div class="dh-pane-header">
                                    <h2>Diamond Club Member Hub</h2>
                                    <p>Personaliza tu identidad de coleccionista y revisa tus puntos disponibles.</p>
                                </div>

                                <div class="dh-kpi-grid">
                                    <div class="dh-kpi-box">
                                        <span class="dh-kpi-num" id="kpi-pedidos">0</span>
                                        <span class="dh-kpi-label">Compras</span>
                                    </div>
                                    <div class="dh-kpi-box">
                                        <span class="dh-kpi-num" id="kpi-favoritos">0</span>
                                        <span class="dh-kpi-label">Favoritos</span>
                                    </div>
                                    <div class="dh-kpi-box">
                                        <span class="dh-kpi-num" id="kpi-puntos">100</span>
                                        <span class="dh-kpi-label">Puntos VIP</span>
                                    </div>
                                </div>

                                <div class="dh-vip-pass">
                                    <div class="dh-vip-pass-top">
                                        <span class="dh-vip-pass-brand">DIAMOND HATS · OFFICIAL PASS</span>
                                        <span class="dh-vip-pass-id" id="vip-pass-id">ID #DH-2026</span>
                                    </div>
                                    <div class="dh-vip-pass-bio" id="vip-pass-bio">"Coleccionando estilo y actitud en cada gorra."</div>
                                    <div class="dh-vip-pass-footer">
                                        <span>Estilo preferido: <strong id="vip-pass-style">Snapback Clásica</strong></span>
                                        <span>Estado: ACTIVO</span>
                                    </div>
                                </div>

                                <div class="dh-edit-grid">
                                    <div class="dh-hub-input-group">
                                        <label for="hubEditUsername">Nombre de Usuario</label>
                                        <input type="text" id="hubEditUsername" maxlength="30" placeholder="Tu apodo o nombre">
                                    </div>
                                    <div class="dh-hub-input-group">
                                        <label for="hubEditStyle">Estilo de Gorra Favorito</label>
                                        <select id="hubEditStyle">
                                            <option value="Snapback Clásica">Snapback Clásica</option>
                                            <option value="Visera Curva (Dad Hat)">Visera Curva (Dad Hat)</option>
                                            <option value="Trucker Malla">Trucker Malla</option>
                                            <option value="Edición Limitada / Colección">Edición Limitada / Colección</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="dh-hub-input-group" style="margin-bottom: 14px;">
                                    <label for="hubEditBio">Frase o Bio de Coleccionista</label>
                                    <input type="text" id="hubEditBio" maxlength="85" placeholder="Ej. Fan de ediciones limitadas y diseños urbanos">
                                </div>
                                <button type="button" class="dh-btn-save-hub" id="btnGuardarPerfilHub">Guardar Cambios de Perfil</button>
                            </div>

                            <div class="dh-hub-pane" id="hub-pane-favoritos">
                                <div class="dh-pane-header">
                                    <h2>Mis Favoritos</h2>
                                    <p>Tus gorras guardadas listas para añadir al carrito.</p>
                                </div>
                                <div id="profile-favoritos-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:18px;"></div>
                            </div>

                            <div class="dh-hub-pane" id="hub-pane-billetera">
                                <div class="dh-pane-header">
                                    <h2>Billetera y Tarjetas de Pago</h2>
                                    <p>Guarda tarjetas aquí para seleccionarlas con un clic al pagar.</p>
                                </div>

                                <div style="display:flex; align-items:center; justify-content:center; gap:24px; margin-bottom:20px; flex-wrap:wrap;">
                                    <div id="live-card-preview" class="flip-card card-dark" style="pointer-events:none; transform: scale(0.88);">
                                        <div class="flip-card-inner" id="live-card-inner">
                                            <div class="flip-card-front">
                                                <p class="heading_8264">MASTERCARD</p>
                                                <svg class="logo" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48">
                                                    <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"></path>
                                                    <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"></path>
                                                    <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"></path>
                                                </svg>
                                                <svg class="chip" width="35px" height="35px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="40" height="30" x="5" y="10" rx="4" fill="#d4af37"/>
                                                    <path fill="none" stroke="#b08d20" stroke-width="2" d="M15 10v30M25 10v30M35 10v30M5 25h40"/>
                                                </svg>
                                                <p class="card-number-display" id="card-preview-number">•••• •••• •••• ••••</p>
                                                <p class="card-holder-display" id="card-preview-holder">NOMBRE DEL TITULAR</p>
                                            </div>
                                            <div class="flip-card-back">
                                                <div class="strip"></div>
                                                <div class="mstrip"></div>
                                                <div class="sstrip"><p class="code" id="card-preview-cvv">•••</p></div>
                                                <p class="card-expiry-back" id="card-preview-expiry">MM/AA</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p style="font-size:12px;color:#888;margin-bottom:8px;text-align:center;">Color de tarjeta:</p>
                                        <div style="display:flex;gap:8px;justify-content:center;">${colorPicker}</div>
                                    </div>
                                </div>

                                <div id="add-card-form">
                                    <div class="dh-edit-grid">
                                        <div class="dh-hub-input-group">
                                            <label>Número de Tarjeta</label>
                                            <input id="input-card-number" type="text" maxlength="19" placeholder="1234 5678 9012 3456">
                                        </div>
                                        <div class="dh-hub-input-group">
                                            <label>Titular</label>
                                            <input id="input-card-holder" type="text" placeholder="Nombre del titular">
                                        </div>
                                    </div>
                                    <div class="dh-edit-grid">
                                        <div class="dh-hub-input-group">
                                            <label>Expiración (MM/AA)</label>
                                            <input id="input-card-expiry" type="text" maxlength="5" placeholder="MM/AA">
                                        </div>
                                        <div class="dh-hub-input-group">
                                            <label>CVV</label>
                                            <input id="input-card-cvv" type="password" maxlength="3" placeholder="•••">
                                        </div>
                                    </div>
                                    <button type="button" id="btn-guardar-tarjeta" class="dh-btn-save-hub" style="width:100%;">Guardar Tarjeta</button>
                                </div>

                                <div id="saved-cards-list" style="margin-top:20px;"></div>
                            </div>

                            <div class="dh-hub-pane" id="hub-pane-pedidos">
                                <div class="dh-pane-header">
                                    <h2>Historial de Pedidos</h2>
                                    <p>Tus últimas compras realizadas en Diamond Hats.</p>
                                </div>
                                <div id="hub-pedidos-lista"></div>
                                <div style="margin-top:16px; text-align:right;">
                                    <a href="ayuda.html" class="dh-btn-save-hub" style="text-decoration:none; display:inline-block;">Ir al Rastreo Completo en Ayuda</a>
                                </div>
                            </div>

                            <div class="dh-hub-pane" id="hub-pane-seguridad">
                                <div class="dh-pane-header">
                                    <h2>Seguridad de la Cuenta</h2>
                                    <p>Actualiza tu contraseña periódicamente para mantener tu cuenta protegida.</p>
                                </div>

                                <form id="authChangePassForm" style="max-width: 440px;">
                                    <div class="dh-hub-input-group" style="margin-bottom:14px;">
                                        <label for="authCpOldPass">Contraseña Actual</label>
                                        <input type="password" id="authCpOldPass" placeholder="Escribe tu contraseña actual" required>
                                    </div>
                                    <div class="dh-hub-input-group" style="margin-bottom:14px;">
                                        <label for="authCpNewPass">Nueva Contraseña</label>
                                        <input type="password" id="authCpNewPass" placeholder="Más de 8 caracteres, 1 mayúscula y 1 signo" required>
                                    </div>
                                    <div class="dh-hub-input-group" style="margin-bottom:18px;">
                                        <label for="authCpConfPass">Confirmar Nueva Contraseña</label>
                                        <input type="password" id="authCpConfPass" placeholder="Repite tu nueva contraseña" required>
                                    </div>
                                    <button type="submit" class="dh-btn-save-hub">Actualizar Contraseña</button>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', hubHTML);
        }

        // MODAL ALTERNADOR DE SESIONES (SIRVE TANTO CON SESIÓN ACTIVA COMO AL VOLVER A ENTRAR)
        if (!document.getElementById("modal-switch-account")) {
            const switchHTML = `
                <div id="modal-switch-account">
                    <div class="dh-switch-card">
                        <button id="cerrar-switch-account" class="dh-hub-close">Cerrar</button>
                        <h2 id="dh-switch-title" style="color:#f3d266; font-size:1.3rem; margin-bottom:4px;">Cambiar Sesión</h2>
                        <p id="dh-switch-sub" style="color:#888; font-size:13px; margin-bottom:18px;">Alterna rápidamente entre tus cuentas o agrega una nueva.</p>

                        <div id="dh-switch-accounts-list"></div>

                        <button type="button" id="btn-switch-add-new" class="dh-btn-save-hub" style="width:100%; margin-top:10px;">
                            Iniciar Sesión / Registrarse con otra cuenta
                        </button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', switchHTML);
        }
    }

    inyectarModalesAuth();

    const modalAuth = document.getElementById("modal-auth");
    const modalProfile = document.getElementById("modal-user-profile");
    const modalSwitch = document.getElementById("modal-switch-account");

    const btnPerfilUsuario = document.getElementById("btn-perfil-usuario");
    const btnCerrarAuth = document.getElementById("cerrar-auth");
    const btnCerrarProfile = document.getElementById("cerrar-profile");
    const btnCerrarSwitch = document.getElementById("cerrar-switch-account");
    const btnSwitchSession = document.getElementById("btn-switch-session");
    const btnSwitchAddNew = document.getElementById("btn-switch-add-new");

    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("authLoginForm");
    const formRegister = document.getElementById("authRegisterForm");
    const formChangePass = document.getElementById("authChangePassForm");

    const profileUserVal = document.getElementById("profileUserVal");
    const profileEmailVal = document.getElementById("profileEmailVal");
    const btnLogout = document.getElementById("btn-logout");

    const inputRegPass = document.getElementById("authRegPass");
    const inputRegPassConfirm = document.getElementById("authRegPassConfirm");
    const authPswBar = document.getElementById("authPswBar");
    const authPswText = document.getElementById("authPswText");
    const authPswMatchText = document.getElementById("authPswMatchText");
    const authRegSubmitBtn = document.getElementById("authRegSubmitBtn");

    const inputLoginEmail = document.getElementById("authLoginEmail");
    const inputLoginPass = document.getElementById("authLoginPass");
    const authLoginBtn = document.getElementById("authLoginBtn");

    function sanitizar(str) {
        if (!str) return "";
        return str.replace(/<[^>]*>/g, '').trim();
    }

    if (btnSwitchSession) {
        btnSwitchSession.addEventListener("click", () => {
            modalProfile.classList.remove("activo");
            renderizarSelectorCuentas();
            modalSwitch.classList.add("activo");
        });
    }

    if (btnCerrarSwitch) {
        btnCerrarSwitch.addEventListener("click", () => modalSwitch.classList.remove("activo"));
    }

    if (btnSwitchAddNew) {
        btnSwitchAddNew.addEventListener("click", () => {
            modalSwitch.classList.remove("activo");
            if (formLogin) formLogin.reset();
            modalAuth.classList.add("activo");
        });
    }

    function renderizarSelectorCuentas() {
        const cont = document.getElementById("dh-switch-accounts-list");
        const titleEl = document.getElementById("dh-switch-title");
        const subEl = document.getElementById("dh-switch-sub");
        if (!cont) return;

        const estaLogueadoAhora = Boolean(auth.currentUser);
        const emailActual = estaLogueadoAhora ? auth.currentUser.email.toLowerCase() : "";
        const usernameActual = localStorage.getItem("username") || "Usuario";
        const avatarActual = estaLogueadoAhora ? (localStorage.getItem("avatar_" + auth.currentUser.email) || "") : "";

        const todasLasCuentas = obtenerCuentasGuardadas();
        // Solo mostrar en el alternador las cuentas que NO han cerrado sesión
        const cuentasActivas = todasLasCuentas.filter(c => c.sesionAbierta !== false && c.email.toLowerCase() !== emailActual);

        if (titleEl) {
            titleEl.textContent = estaLogueadoAhora ? "Cambiar Sesión" : "Cuentas con Sesión Activa";
        }
        if (subEl) {
            subEl.textContent = estaLogueadoAhora
                ? "Alterna entre tus sesiones abiertas sin volver a escribir tu contraseña."
                : "Selecciona una de tus cuentas abiertas para entrar directamente o inicia con otra.";
        }

        let html = "";

        if (estaLogueadoAhora) {
            html += `
                <div style="font-size:11px; color:#d4af37; text-transform:uppercase; font-weight:700; margin-bottom:6px; letter-spacing:0.6px;">Perfil en Uso</div>
                <div class="dh-account-row current">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="dh-acc-mini-avatar">
                            ${avatarActual ? `<img src="${avatarActual}" alt="Avatar">` : usernameActual.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong style="color:#fff; font-size:14px; display:block;">${usernameActual}</strong>
                            <span style="color:#aaa; font-size:12px;">${emailActual}</span>
                        </div>
                    </div>
                    <span class="dh-badge-active-acc">Sesión Actual</span>
                </div>
            `;
        }

        if (cuentasActivas.length > 0) {
            html += `<div style="font-size:11px; color:#888; text-transform:uppercase; font-weight:700; margin:14px 0 6px; letter-spacing:0.6px;">${estaLogueadoAhora ? 'Otras Sesiones Abiertas' : 'Selecciona una Cuenta'}</div>`;
            cuentasActivas.forEach((acc) => {
                const av = acc.avatar || localStorage.getItem("avatar_" + acc.email) || "";
                html += `
                    <div class="dh-account-row other" onclick="cambiarACuentaGuardada('${acc.email}')">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div class="dh-acc-mini-avatar">
                                ${av ? `<img src="${av}" alt="Avatar">` : (acc.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong style="color:#f5f5f5; font-size:14px; display:block;">${acc.username}</strong>
                                <span style="color:#888; font-size:12px;">${acc.email}</span>
                            </div>
                        </div>
                        <span style="color:#d4af37; font-size:12px; font-weight:700;">${estaLogueadoAhora ? 'Alternar' : 'Entrar'}</span>
                    </div>
                `;
            });
        }

        cont.innerHTML = html;
    }

    window.cambiarACuentaGuardada = async function (targetEmail) {
        const cuentas = obtenerCuentasGuardadas();
        const cuenta = cuentas.find(c => c.email.toLowerCase() === targetEmail.toLowerCase());
        if (!cuenta) return;

        modalSwitch.classList.remove("activo");
        const claveGuardada = decodificarSecret(cuenta.secret);

        if (claveGuardada) {
            try {
                await signInWithEmailAndPassword(auth, cuenta.email, claveGuardada);
                registrarCuentaEnSelector({ email: cuenta.email, sesionAbierta: true });
                mostrarNotificacionAuth(
                    "Sesión Iniciada",
                    `Bienvenido de vuelta, ${cuenta.username}.`,
                    "success",
                    () => window.location.reload()
                );
            } catch (err) {
                inputLoginEmail.value = cuenta.email;
                modalAuth.classList.add("activo");
                mostrarNotificacionAuth("Verifica tu Contraseña", "Ingresa tu contraseña una vez para activar el acceso directo en esta cuenta.", "error");
            }
        } else {
            // Solo ocurrirá una única vez si esa cuenta fue iniciada antes de esta actualización
            inputLoginEmail.value = cuenta.email;
            modalAuth.classList.add("activo");
            mostrarNotificacionAuth("Activar Acceso Directo", "Ingresa la contraseña de esta cuenta una sola vez para guardarla en tus sesiones abiertas.");
        }
    };

    document.querySelectorAll(".dh-hub-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-hub-tab");
            document.querySelectorAll(".dh-hub-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".dh-hub-pane").forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const pane = document.getElementById(`hub-pane-${target}`);
            if (pane) pane.classList.add("active");

            if (target === "favoritos" && typeof renderizarFavoritosSidebar === "function") {
                renderizarFavoritosSidebar();
            }
            if (target === "billetera") {
                renderizarTarjetasGuardadas();
            }
            if (target === "pedidos") {
                renderizarPedidosEnHub();
            }
        });
    });

    function refrescarDatosHub() {
        const username = localStorage.getItem("username") || "Cliente";
        const email = auth.currentUser ? auth.currentUser.email : (localStorage.getItem("userEmail") || "");
        const bio = localStorage.getItem("userBio") || "Coleccionando estilo y actitud en cada gorra.";
        const estilo = localStorage.getItem("userStyle") || "Snapback Clásica";

        if (profileUserVal) profileUserVal.textContent = username;
        if (profileEmailVal) profileEmailVal.textContent = email;

        const editUser = document.getElementById("hubEditUsername");
        const editBio = document.getElementById("hubEditBio");
        const editStyle = document.getElementById("hubEditStyle");
        if (editUser) editUser.value = username;
        if (editBio) editBio.value = bio;
        if (editStyle) editStyle.value = estilo;

        const passBio = document.getElementById("vip-pass-bio");
        const passStyle = document.getElementById("vip-pass-style");
        const passId = document.getElementById("vip-pass-id");
        if (passBio) passBio.textContent = `"${bio}"`;
        if (passStyle) passStyle.textContent = estilo;
        if (passId && auth.currentUser) {
            passId.textContent = `ID #DH-${auth.currentUser.uid.substring(0, 6).toUpperCase()}`;
        }

        const historial = JSON.parse(localStorage.getItem(getKeyHistorial()) || "[]");
        const favs = JSON.parse(localStorage.getItem(getKeyFavoritos()) || "[]");
        const puntosActuales = typeof window.obtenerPuntosUsuario === "function"
            ? window.obtenerPuntosUsuario()
            : (Number(localStorage.getItem("puntos_vip_" + getAccountEmail())) || 100);

        const kpiPedidos = document.getElementById("kpi-pedidos");
        const kpiFavs = document.getElementById("kpi-favoritos");
        const kpiPuntos = document.getElementById("kpi-puntos");
        if (kpiPedidos) kpiPedidos.textContent = historial.length;
        if (kpiFavs) kpiFavs.textContent = favs.length;
        if (kpiPuntos) kpiPuntos.textContent = puntosActuales;

        const rankPill = document.getElementById("dhMemberRank");
        if (rankPill) {
            if (email === ADMIN_EMAIL) {
                rankPill.textContent = "Founder & Admin";
            } else if (historial.length >= 5) {
                rankPill.textContent = "Diamond Elite";
            } else if (historial.length >= 2) {
                rankPill.textContent = "Gold VIP";
            } else {
                rankPill.textContent = "Bronze Collector";
            }
        }
    }

    function renderizarPedidosEnHub() {
        const cont = document.getElementById("hub-pedidos-lista");
        if (!cont) return;
        const historial = JSON.parse(localStorage.getItem(getKeyHistorial()) || "[]");
        if (historial.length === 0) {
            cont.innerHTML = `<p style="color:#888; text-align:center; padding:30px 0;">Aún no has realizado compras. Explora nuestro catálogo y estrena tu primera gorra.</p>`;
            return;
        }
        cont.innerHTML = historial.slice(0, 5).map(p => `
            <div class="dh-order-card">
                <div>
                    <strong style="color:#f3d266;">Orden ${p.ticketId}</strong>
                    <div style="font-size:12px; color:#888;">${p.date}</div>
                </div>
                <div style="text-align:right;">
                    <strong style="color:#fff;">${p.pagoConPuntos ? p.totalVal : '$' + p.totalVal + ' MXN'}</strong>
                    <div style="font-size:11px; color:#2ecc71;">${p.estado_envio || 'Confirmado'}</div>
                </div>
            </div>
        `).join("");
    }

    const btnGuardarPerfilHub = document.getElementById("btnGuardarPerfilHub");
    if (btnGuardarPerfilHub) {
        btnGuardarPerfilHub.addEventListener("click", async () => {
            const nuevoNombre = sanitizar(document.getElementById("hubEditUsername").value);
            const nuevaBio = sanitizar(document.getElementById("hubEditBio").value);
            const nuevoEstilo = document.getElementById("hubEditStyle").value;

            if (!nuevoNombre) {
                mostrarNotificacionAuth("Nombre requerido", "El nombre de usuario no puede quedar vacío.", "error");
                return;
            }

            try {
                if (auth.currentUser) {
                    await setDoc(doc(db, "usuarios", auth.currentUser.uid), {
                        username: nuevoNombre,
                        bio: nuevaBio,
                        estiloFavorito: nuevoEstilo
                    }, { merge: true });
                }
                localStorage.setItem("username", nuevoNombre);
                localStorage.setItem("userBio", nuevaBio);
                localStorage.setItem("userStyle", nuevoEstilo);
                registrarCuentaEnSelector({ email: getAccountEmail(), username: nuevoNombre, sesionAbierta: true });
                refrescarDatosHub();
                mostrarNotificacionAuth("Perfil VIP Actualizado", "Tus datos y preferencias se guardaron en la nube.");
            } catch (e) {
                mostrarNotificacionAuth("Error", "No se pudieron guardar los cambios.", "error");
            }
        });
    }

    const regAvatarCircle = document.getElementById("regAvatarCircle");
    const regAvatarLabel = document.getElementById("regAvatarLabel");
    const regAvatarInput = document.getElementById("authRegAvatarInput");
    const regAvatarPreview = document.getElementById("regAvatarPreview");

    if (regAvatarCircle && regAvatarInput) {
        regAvatarCircle.addEventListener("click", () => regAvatarInput.click());
        if (regAvatarLabel) regAvatarLabel.addEventListener("click", () => regAvatarInput.click());

        regAvatarInput.addEventListener("change", () => {
            const file = regAvatarInput.files[0];
            if (!file) return;
            procesarImagenPerfil(file, (base64) => {
                avatarRegistroBase64 = base64;
                if (regAvatarPreview) {
                    regAvatarPreview.innerHTML = `<img src="${base64}" alt="Avatar">`;
                }
                if (regAvatarLabel) {
                    regAvatarLabel.textContent = "Foto seleccionada (clic para cambiar)";
                }
            });
        });
    }

    onAuthStateChanged(auth, async (user) => {
        const btnAdminPerfil = document.getElementById("btn-admin-panel-profile");
        let navAdminBtn = document.getElementById("nav-btn-admin");
        const esPaginaGorras = window.location.pathname.toLowerCase().includes("gorras.html");

        if (user) {
            localStorage.setItem("token", user.uid);
            localStorage.setItem("userEmail", user.email);

            let avatarDeNube = null;
            let nombreFinal = user.email === ADMIN_EMAIL ? "Administrador" : user.email.split("@")[0];

            try {
                const docSnap = await getDoc(doc(db, "usuarios", user.uid));
                if (docSnap.exists()) {
                    const uData = docSnap.data();
                    nombreFinal = uData.username || nombreFinal;
                    localStorage.setItem("username", nombreFinal);
                    if (uData.bio) localStorage.setItem("userBio", uData.bio);
                    if (uData.estiloFavorito) localStorage.setItem("userStyle", uData.estiloFavorito);
                    if (typeof uData.puntosVIP === "number") {
                        localStorage.setItem("puntos_vip_" + user.email.toLowerCase(), String(uData.puntosVIP));
                    }
                    if (Array.isArray(uData.pedidos)) {
                        localStorage.setItem(getKeyHistorial(), JSON.stringify(uData.pedidos));
                    }
                    if (Array.isArray(uData.tarjetas)) {
                        localStorage.setItem(getKeyTarjetas(), JSON.stringify(uData.tarjetas));
                    }
                    if (uData.direccionDefault) {
                        localStorage.setItem(getKeyDireccionDefault(), JSON.stringify(uData.direccionDefault));
                    }
                    if (uData.avatar) {
                        avatarDeNube = uData.avatar;
                        localStorage.setItem("avatar_" + user.email, uData.avatar);
                    }
                } else {
                    localStorage.setItem("username", nombreFinal);
                }
            } catch (e) {
                localStorage.setItem("username", nombreFinal);
            }

            const avatarFinal = avatarDeNube || localStorage.getItem("avatar_" + user.email) || null;
            registrarCuentaEnSelector({ email: user.email, username: nombreFinal, avatar: avatarFinal || "", sesionAbierta: true });
            actualizarAvatarUI(avatarFinal);
            refrescarDatosHub();

            const checkoutEmail = document.getElementById("checkoutEmail");
            if (checkoutEmail) {
                checkoutEmail.value = user.email;
                checkoutEmail.readOnly = true;
            }

            if (user.email === ADMIN_EMAIL) {
                if (btnAdminPerfil) btnAdminPerfil.style.display = "block";
                if (esPaginaGorras && navbar && !navAdminBtn) {
                    navAdminBtn = document.createElement("a");
                    navAdminBtn.id = "nav-btn-admin";
                    navAdminBtn.href = "control.html";
                    navAdminBtn.textContent = "Panel Admin";
                    navAdminBtn.style.cssText = "color: #d4af37; font-weight: bold; border: 1px solid #d4af37; padding: 5px 12px; border-radius: 6px; margin-left: 10px;";
                    navbar.appendChild(navAdminBtn);
                }
            } else {
                if (btnAdminPerfil) btnAdminPerfil.style.display = "none";
                if (navAdminBtn) navAdminBtn.remove();
            }
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("username");
            actualizarAvatarUI(null);
            if (btnAdminPerfil) btnAdminPerfil.style.display = "none";
            if (navAdminBtn) navAdminBtn.remove();
        }
    });

    // Clic en el botón Perfil de la barra superior:
    // - Si hay sesión activa -> abre el Hub VIP
    // - Si NO hay sesión activa -> si existen otras cuentas abiertas muestra el selector; si no, abre Login/Registro
    if (btnPerfilUsuario) {
        btnPerfilUsuario.addEventListener("click", () => {
            if (auth.currentUser) {
                refrescarDatosHub();
                const email = localStorage.getItem("userEmail");
                const savedAvatar = email ? localStorage.getItem("avatar_" + email) : null;
                const avatarEmoji = document.getElementById("profileAvatarEmoji");
                if (avatarEmoji) {
                    avatarEmoji.innerHTML = savedAvatar
                        ? `<img src="${savedAvatar}" alt="Avatar">`
                        : "Avatar";
                }
                modalProfile.classList.add("activo");
            } else {
                const cuentasAbiertas = obtenerCuentasGuardadas().filter(c => c.sesionAbierta !== false);
                if (cuentasAbiertas.length > 0) {
                    renderizarSelectorCuentas();
                    modalSwitch.classList.add("activo");
                } else {
                    modalAuth.classList.add("activo");
                }
            }
        });
    }

    if (btnCerrarAuth) btnCerrarAuth.addEventListener("click", () => modalAuth.classList.remove("activo"));
    if (btnCerrarProfile) btnCerrarProfile.addEventListener("click", () => modalProfile.classList.remove("activo"));

    const inputNum = document.getElementById("input-card-number");
    const inputHolder = document.getElementById("input-card-holder");
    const inputExpiry = document.getElementById("input-card-expiry");
    const inputCvv = document.getElementById("input-card-cvv");
    const previewNum = document.getElementById("card-preview-number");
    const previewHolder = document.getElementById("card-preview-holder");
    const previewExpiry = document.getElementById("card-preview-expiry");
    const previewCvv = document.getElementById("card-preview-cvv");
    const liveCard = document.getElementById("live-card-preview");

    function formatCardNumber(val) {
        const digits = val.replace(/\D/g, '').substring(0, 16);
        const groups = [];
        for (let i = 0; i < 4; i++) {
            const chunk = digits.substring(i * 4, i * 4 + 4);
            groups.push(chunk.padEnd(4, '\u2022'));
        }
        return groups.join(' ');
    }

    if (inputNum) {
        inputNum.addEventListener("input", () => {
            let val = inputNum.value.replace(/\D/g, '').substring(0, 16);
            inputNum.value = val.replace(/(\d{4})/g, '$1 ').trim();
            if (previewNum) previewNum.textContent = formatCardNumber(val);
        });
    }
    if (inputHolder) {
        inputHolder.addEventListener("input", () => {
            if (previewHolder) previewHolder.textContent = inputHolder.value.toUpperCase() || 'NOMBRE DEL TITULAR';
        });
    }
    if (inputExpiry) {
        inputExpiry.addEventListener("input", () => {
            let val = inputExpiry.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
            inputExpiry.value = val;
            if (previewExpiry) previewExpiry.textContent = inputExpiry.value || 'MM/AA';
        });
    }
    if (inputCvv) {
        inputCvv.addEventListener("input", () => {
            if (previewCvv) previewCvv.textContent = inputCvv.value.replace(/\D/g, '').substring(0, 3) || '\u2022\u2022\u2022';
        });
    }

    const liveCardInner = document.getElementById("live-card-inner");
    [inputExpiry, inputCvv].forEach(inp => {
        if (inp) {
            inp.addEventListener("focus", () => { if (liveCardInner) liveCardInner.classList.add("flipped"); });
            inp.addEventListener("blur", () => { if (liveCardInner) liveCardInner.classList.remove("flipped"); });
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("card-color-pick") && liveCard) {
            liveCard.className = 'flip-card ' + e.target.dataset.color;
            document.querySelectorAll('.card-color-pick').forEach(b => b.style.border = '2px solid transparent');
            e.target.style.border = '2px solid #cca142';
        }
    });

    const btnGuardarTarjeta = document.getElementById("btn-guardar-tarjeta");
    if (btnGuardarTarjeta) {
        btnGuardarTarjeta.addEventListener("click", () => {
            const numero = (inputNum?.value || '').replace(/\s/g, '');
            const titular = inputHolder?.value || '';
            const expiry = inputExpiry?.value || '';
            const cvv = inputCvv?.value || '';
            const color = liveCard?.className.replace('flip-card', '').trim() || 'card-dark';

            if (numero.length < 16 || !titular || expiry.length < 5 || cvv.length < 3) {
                mostrarNotificacionAuth("Campos incompletos", "Completa los 16 dígitos, titular, fecha y CVV.", "error");
                return;
            }
            const tarjetas = JSON.parse(localStorage.getItem(getKeyTarjetas()) || '[]');
            tarjetas.push({ numero, titular, expiry, cvv, color });
            localStorage.setItem(getKeyTarjetas(), JSON.stringify(tarjetas));
            if (typeof window.sincronizarTarjetasFirestore === "function") {
                window.sincronizarTarjetasFirestore(tarjetas);
            }

            if (inputNum) inputNum.value = '';
            if (inputHolder) inputHolder.value = '';
            if (inputExpiry) inputExpiry.value = '';
            if (inputCvv) inputCvv.value = '';
            if (previewNum) previewNum.textContent = '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
            if (previewHolder) previewHolder.textContent = 'NOMBRE DEL TITULAR';
            if (previewExpiry) previewExpiry.textContent = 'MM/AA';
            if (previewCvv) previewCvv.textContent = '\u2022\u2022\u2022';

            renderizarTarjetasGuardadas();
            mostrarNotificacionAuth("Tarjeta Guardada", "Tu método de pago se registró exclusivamente en tu cuenta.");
        });
    }

    function renderizarTarjetasGuardadas() {
        const lista = document.getElementById('saved-cards-list');
        if (!lista) return;
        const tarjetas = JSON.parse(localStorage.getItem(getKeyTarjetas()) || '[]');
        if (tarjetas.length === 0) {
            lista.innerHTML = '<p style="color:#888;font-size:13px;text-align:center;">No tienes tarjetas guardadas aún en esta cuenta.</p>';
            return;
        }
        lista.innerHTML = '<div style="display:flex; flex-direction:column; gap:10px;">' +
            tarjetas.map((t, i) => `
                <div class="dh-order-card">
                    <div>
                        <strong style="color:#f3d266;">Tarjeta terminación •••• ${t.numero.slice(-4)}</strong>
                        <div style="font-size:12px; color:#999;">${t.titular.toUpperCase()} · Expira ${t.expiry}</div>
                    </div>
                    <button type="button" onclick="eliminarTarjeta(${i})" style="background:#e74c3c; border:none; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">Eliminar</button>
                </div>
            `).join('') + '</div>';
    }
    window.renderizarTarjetasGuardadas = renderizarTarjetasGuardadas;

    window.eliminarTarjeta = function (index) {
        const tarjetas = JSON.parse(localStorage.getItem(getKeyTarjetas()) || '[]');
        tarjetas.splice(index, 1);
        localStorage.setItem(getKeyTarjetas(), JSON.stringify(tarjetas));
        if (typeof window.sincronizarTarjetasFirestore === "function") {
            window.sincronizarTarjetasFirestore(tarjetas);
        }
        renderizarTarjetasGuardadas();
    };

    if (tabLogin && tabRegister && formLogin && formRegister) {
        tabLogin.addEventListener("click", () => {
            tabLogin.classList.add("activo");
            tabRegister.classList.remove("activo");
            formLogin.classList.add("activo");
            formRegister.classList.remove("activo");
        });
        tabRegister.addEventListener("click", () => {
            tabRegister.classList.add("activo");
            tabLogin.classList.remove("activo");
            formRegister.classList.add("activo");
            formLogin.classList.remove("activo");
        });
    }

    function validarFormularioRegistro() {
        const val = inputRegPass ? inputRegPass.value : "";
        const conf = inputRegPassConfirm ? inputRegPassConfirm.value : "";

        const tieneMasDe8 = val.length > 8;
        const tieneMayuscula = /[A-Z]/.test(val);
        const tieneEspecial = /[^A-Za-z0-9]/.test(val);

        const reqLen = document.getElementById("req-len");
        const reqUpper = document.getElementById("req-upper");
        const reqSpecial = document.getElementById("req-special");

        if (reqLen) {
            reqLen.classList.toggle("met", tieneMasDe8);
            reqLen.querySelector(".psw-req-icon").textContent = tieneMasDe8 ? "OK" : "○";
        }
        if (reqUpper) {
            reqUpper.classList.toggle("met", tieneMayuscula);
            reqUpper.querySelector(".psw-req-icon").textContent = tieneMayuscula ? "OK" : "○";
        }
        if (reqSpecial) {
            reqSpecial.classList.toggle("met", tieneEspecial);
            reqSpecial.querySelector(".psw-req-icon").textContent = tieneEspecial ? "OK" : "○";
        }

        const cumplidos = [tieneMasDe8, tieneMayuscula, tieneEspecial].filter(Boolean).length;

        if (val.length === 0) {
            authPswBar.style.width = "0%";
            authPswText.textContent = "Ingresa una contraseña segura";
            authPswText.style.color = "#888";
        } else if (cumplidos === 0 || cumplidos === 1) {
            authPswBar.style.width = "33%";
            authPswBar.style.backgroundColor = "#e74c3c";
            authPswText.textContent = "Contraseña débil";
            authPswText.style.color = "#e74c3c";
        } else if (cumplidos === 2) {
            authPswBar.style.width = "66%";
            authPswBar.style.backgroundColor = "#f39c12";
            authPswText.textContent = "Contraseña normal (completa los 3 requisitos)";
            authPswText.style.color = "#f39c12";
        } else {
            authPswBar.style.width = "100%";
            authPswBar.style.backgroundColor = "#2ecc71";
            authPswText.textContent = "Contraseña segura";
            authPswText.style.color = "#2ecc71";
        }

        const coinciden = val.length > 0 && val === conf;
        if (authPswMatchText) {
            if (conf.length === 0) {
                authPswMatchText.textContent = "";
            } else if (coinciden) {
                authPswMatchText.textContent = "Las contraseñas coinciden";
                authPswMatchText.style.color = "#2ecc71";
            } else {
                authPswMatchText.textContent = "Las contraseñas no coinciden";
                authPswMatchText.style.color = "#e74c3c";
            }
        }

        const todoListo = (cumplidos === 3) && coinciden;
        if (authRegSubmitBtn) {
            authRegSubmitBtn.disabled = !todoListo;
        }
        return todoListo;
    }

    if (inputRegPass) inputRegPass.addEventListener("input", validarFormularioRegistro);
    if (inputRegPassConfirm) inputRegPassConfirm.addEventListener("input", validarFormularioRegistro);

    let loginIntentos = 0;
    let lockoutTimer = null;
    let loginDeshabilitado = false;

    function bloquearLoginTIenda() {
        loginDeshabilitado = true;
        let segundosRestantes = 30;

        inputLoginEmail.disabled = true;
        inputLoginPass.disabled = true;
        authLoginBtn.disabled = true;
        authLoginBtn.textContent = `Bloqueado (${segundosRestantes}s)`;

        const alertMsg = document.createElement("p");
        alertMsg.className = "lockout-message";
        alertMsg.id = "lockoutAlertStore";
        alertMsg.style.color = "#d32f2f";
        alertMsg.style.fontWeight = "bold";
        alertMsg.style.marginTop = "10px";
        alertMsg.textContent = `Demasiados intentos erróneos. Acceso suspendido temporalmente.`;
        formLogin.appendChild(alertMsg);

        lockoutTimer = setInterval(() => {
            segundosRestantes--;
            authLoginBtn.textContent = `Bloqueado (${segundosRestantes}s)`;
            if (segundosRestantes <= 0) {
                clearInterval(lockoutTimer);
                loginIntentos = 0;
                loginDeshabilitado = false;
                inputLoginEmail.disabled = false;
                inputLoginPass.disabled = false;
                authLoginBtn.disabled = false;
                authLoginBtn.textContent = "Entrar";

                const alertEl = document.getElementById("lockoutAlertStore");
                if (alertEl) alertEl.remove();
            }
        }, 1000);
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loginDeshabilitado) return;

            const email = sanitizar(inputLoginEmail.value);
            const password = sanitizar(inputLoginPass.value);

            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                registrarCuentaEnSelector({ email, password, sesionAbierta: true });
                formLogin.reset();
                modalAuth.classList.remove("activo");

                const esAdmin = cred.user.email === ADMIN_EMAIL;
                mostrarNotificacionAuth(
                    esAdmin ? "Acceso de Administrador" : "Bienvenido de vuelta",
                    esAdmin ? "Has iniciado sesión como Administrador de Diamond Hats." : `Sesión iniciada como ${cred.user.email}`,
                    "success",
                    () => window.location.reload()
                );
            } catch (err) {
                loginIntentos++;
                if (loginIntentos >= 3) {
                    bloquearLoginTIenda();
                } else {
                    mostrarNotificacionAuth(
                        "Credenciales Incorrectas",
                        `Verifica tu correo o contraseña. Intento ${loginIntentos} de 3.`,
                        "error"
                    );
                }
            }
        });
    }

    if (formRegister) {
        formRegister.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!validarFormularioRegistro()) return;

            const username = sanitizar(document.getElementById("authRegUser").value);
            const email = sanitizar(document.getElementById("authRegEmail").value);
            const password = inputRegPass.value;

            try {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "usuarios", cred.user.uid), {
                    username,
                    email,
                    avatar: avatarRegistroBase64 || "",
                    bio: "Coleccionando estilo y actitud en cada gorra.",
                    estiloFavorito: "Snapback Clásica",
                    puntosVIP: 100,
                    pedidos: [],
                    tarjetas: [],
                    fechaRegistro: new Date().toISOString()
                });

                registrarCuentaEnSelector({
                    email,
                    username,
                    password,
                    avatar: avatarRegistroBase64 || "",
                    sesionAbierta: true
                });

                localStorage.setItem("puntos_vip_" + email.toLowerCase(), "100");
                if (avatarRegistroBase64) {
                    localStorage.setItem("avatar_" + email, avatarRegistroBase64);
                }

                formRegister.reset();
                avatarRegistroBase64 = "";
                if (regAvatarPreview) regAvatarPreview.innerHTML = "Foto";
                if (regAvatarLabel) regAvatarLabel.textContent = "+ Elegir foto de perfil (opcional)";
                validarFormularioRegistro();
                modalAuth.classList.remove("activo");

                mostrarNotificacionAuth(
                    "Cuenta Creada",
                    `Bienvenido a Diamond Hats, ${username}. Recibiste 100 puntos VIP de bienvenida.`,
                    "success",
                    () => window.location.reload()
                );
            } catch (err) {
                mostrarNotificacionAuth("Error al Registrar", err.message, "error");
            }
        });
    }

    // Cerrar sesión SOLO de la cuenta actual (mantiene abiertas las demás cuentas)
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            const correoQueCierra = localStorage.getItem("userEmail");
            marcarSesionCerradaEnCuenta(correoQueCierra);

            await signOut(auth);
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("username");
            actualizarAvatarUI(null);
            modalProfile.classList.remove("activo");
            mostrarNotificacionAuth("Sesión Cerrada", "Has cerrado sesión en esta cuenta.", "success", () => {
                window.location.reload();
            });
        });
    }

    if (formChangePass) {
        formChangePass.addEventListener("submit", async (e) => {
            e.preventDefault();

            const oldPassword = document.getElementById("authCpOldPass").value;
            const newPassword = document.getElementById("authCpNewPass").value;
            const confPassword = document.getElementById("authCpConfPass").value;

            if (newPassword !== confPassword) {
                mostrarNotificacionAuth("No Coinciden", "La nueva contraseña y su confirmación deben ser iguales.", "error");
                return;
            }

            if (newPassword.length <= 8 || !/[A-Z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
                mostrarNotificacionAuth("Contraseña Débil", "Debe tener más de 8 caracteres, 1 mayúscula y 1 signo especial.", "error");
                return;
            }

            try {
                const user = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, oldPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                registrarCuentaEnSelector({ email: user.email, password: newPassword, sesionAbierta: true });

                formChangePass.reset();
                mostrarNotificacionAuth("Contraseña Actualizada", "Tu clave se cambió con éxito.");
            } catch (err) {
                mostrarNotificacionAuth("Error de Verificación", "Verifica que tu contraseña anterior sea correcta.", "error");
            }
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modalAuth) modalAuth.classList.remove("activo");
        if (e.target === modalProfile) modalProfile.classList.remove("activo");
        if (e.target === modalSwitch) modalSwitch.classList.remove("activo");
    });

    function generarUsernameAleatorio() {
        const adjetivos = ["Galaxy", "Cosmic", "Shadow", "Diamond", "Neon", "Epic", "Ultra", "Stealth", "Hyper", "Flash", "Storm", "Blaze", "Night"];
        const sustantivos = ["Hat", "Guy", "Pro", "King", "Wolf", "Rider", "Boss", "Star", "Fox", "Ace", "Hunter", "Ghost"];
        const adj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
        const sust = sustantivos[Math.floor(Math.random() * sustantivos.length)];
        const num = Math.floor(10 + Math.random() * 90);
        return `${adj}${sust}${num}`;
    }

    if (tabRegister) {
        tabRegister.addEventListener("click", () => {
            const userInput = document.getElementById("authRegUser");
            if (userInput && !userInput.value.trim()) {
                userInput.value = generarUsernameAleatorio();
            }
        });
    }

    function actualizarAvatarUI(base64) {
        const btn = document.getElementById("btn-perfil-usuario");
        if (!btn) return;
        if (base64) {
            btn.innerHTML = `<img src="${base64}" style="width:36px;height:36px;object-fit:cover;border-radius:50%;border:2px solid #cca142;vertical-align:middle;">`;
        } else {
            btn.innerHTML = "Perfil";
        }
    }
    window.actualizarAvatarUI = actualizarAvatarUI;

    const avatarCircle = document.getElementById("profileAvatarCircle");
    const avatarInput = document.getElementById("profileAvatarInput");
    const avatarEmoji = document.getElementById("profileAvatarEmoji");

    if (avatarCircle && avatarInput) {
        avatarCircle.addEventListener("click", () => avatarInput.click());

        avatarInput.addEventListener("change", () => {
            const file = avatarInput.files[0];
            if (!file) return;
            procesarImagenPerfil(file, async (base64) => {
                const email = localStorage.getItem("userEmail");
                try {
                    if (auth.currentUser) {
                        await setDoc(doc(db, "usuarios", auth.currentUser.uid), { avatar: base64 }, { merge: true });
                    }
                    if (email) {
                        localStorage.setItem("avatar_" + email, base64);
                        registrarCuentaEnSelector({ email, avatar: base64, sesionAbierta: true });
                    }
                    actualizarAvatarUI(base64);
                    if (avatarEmoji) {
                        avatarEmoji.innerHTML = `<img src="${base64}" alt="Avatar">`;
                    }
                    mostrarNotificacionAuth("Foto Actualizada", "Tu foto de perfil se guardó en la nube.");
                } catch (e) {
                    mostrarNotificacionAuth("Error", "No se pudo guardar la imagen.", "error");
                }
            });
        });
    }
});