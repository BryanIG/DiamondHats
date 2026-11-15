import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ADMIN_EMAIL = "admin@diamondhats.com";
let usuarioSesion = null;
let pruebaUsuarioBase64 = "";
let ticketSeleccionadoAdminId = null;
let ticketACerrarId = null;
let todasLasQuejas = [];

function optimizarImagenPrueba(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_W = 700;
            let w = img.width;
            let h = img.height;
            if (w > MAX_W) {
                h = Math.round((h * MAX_W) / w);
                w = MAX_W;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function escaparHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function inyectarModalCierreReclamo() {
    if (document.getElementById("modal-cerrar-reclamo-dh")) return;

    const style = document.createElement("style");
    style.textContent = `
        #modal-cerrar-reclamo-dh {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.78);
            backdrop-filter: blur(8px);
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }
        #modal-cerrar-reclamo-dh.activo {
            display: flex;
        }
        .dh-close-claim-card {
            width: 92%;
            max-width: 470px;
            background: linear-gradient(155deg, #1a1a1a, #0e0e0e);
            border: 1px solid rgba(212, 175, 55, 0.55);
            border-radius: 20px;
            padding: 30px 28px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.15);
            color: #f5f5f5;
            animation: dhPopClaim 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
        }
        @keyframes dhPopClaim {
            from { opacity: 0; transform: scale(0.9) translateY(15px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dh-quick-reasons {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-bottom: 14px;
        }
        .dh-reason-chip {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #383838;
            color: #ccc;
            font-size: 11.5px;
            padding: 5px 11px;
            border-radius: 20px;
            cursor: pointer;
            transition: 0.2s;
        }
        .dh-reason-chip:hover {
            border-color: #d4af37;
            color: #f3d266;
            background: rgba(212, 175, 55, 0.12);
        }
        .dh-claim-textarea {
            width: 100%;
            padding: 12px 14px;
            background: #222222;
            border: 1px solid #3a3a3a;
            border-radius: 10px;
            color: #fff;
            font-size: 14px;
            outline: none;
            resize: vertical;
            margin-bottom: 18px;
        }
        .dh-claim-textarea:focus {
            border-color: #d4af37;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }
        .dh-claim-actions {
            display: flex;
            gap: 12px;
        }
        .dh-claim-btn-cancel {
            flex: 1;
            padding: 12px;
            background: #282828;
            border: 1px solid #444;
            color: #ddd;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13.5px;
            cursor: pointer;
        }
        .dh-claim-btn-cancel:hover {
            background: #353535;
            color: #fff;
        }
        .dh-claim-btn-confirm {
            flex: 1.3;
            padding: 12px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border: none;
            color: #fff;
            border-radius: 10px;
            font-weight: 800;
            font-size: 13.5px;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(231, 76, 60, 0.35);
        }
        .dh-claim-btn-confirm:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 22px rgba(231, 76, 60, 0.5);
        }
    `;
    document.head.appendChild(style);

    const modalHTML = `
        <div id="modal-cerrar-reclamo-dh">
            <div class="dh-close-claim-card">
                <h2 style="color:#f3d266; font-size:1.35rem; margin-bottom:6px;">Finalizar y Cerrar Reclamo</h2>
                <p style="color:#aaa; font-size:13px; line-height:1.5; margin-bottom:16px;">
                    Indica el motivo de cierre. El cliente recibirá esta notificación y ya no podrá enviar más respuestas en este hilo.
                </p>

                <label style="display:block; font-size:11px; text-transform:uppercase; color:#888; font-weight:700; margin-bottom:7px;">Motivos rápidos</label>
                <div class="dh-quick-reasons">
                    <button type="button" class="dh-reason-chip" onclick="seleccionarMotivoRapido('Problema resuelto satisfactoriamente.')">Problema resuelto</button>
                    <button type="button" class="dh-reason-chip" onclick="seleccionarMotivoRapido('Solicitud atendida y reembolso/ajuste aplicado.')">Solicitud atendida</button>
                    <button type="button" class="dh-reason-chip" onclick="seleccionarMotivoRapido('Caso cerrado por falta de respuesta del cliente.')">Falta de respuesta</button>
                </div>

                <label for="input-motivo-cierre-dh" style="display:block; font-size:11px; text-transform:uppercase; color:#aaa; font-weight:700; margin-bottom:6px;">Mensaje oficial para el cliente</label>
                <textarea id="input-motivo-cierre-dh" class="dh-claim-textarea" rows="3" placeholder="Escribe el motivo del cierre del reclamo..."></textarea>

                <div class="dh-claim-actions">
                    <button type="button" class="dh-claim-btn-cancel" id="btn-cancelar-cierre-dh">Cancelar</button>
                    <button type="button" class="dh-claim-btn-confirm" id="btn-confirmar-cierre-dh">Cerrar Reclamo</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalEl = document.getElementById("modal-cerrar-reclamo-dh");
    const inputMotivo = document.getElementById("input-motivo-cierre-dh");

    document.getElementById("btn-cancelar-cierre-dh").addEventListener("click", () => {
        modalEl.classList.remove("activo");
        ticketACerrarId = null;
    });

    modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) {
            modalEl.classList.remove("activo");
            ticketACerrarId = null;
        }
    });

    document.getElementById("btn-confirmar-cierre-dh").addEventListener("click", async () => {
        const motivo = inputMotivo.value.trim();
        if (!motivo) {
            inputMotivo.focus();
            inputMotivo.style.borderColor = "#e74c3c";
            return;
        }
        if (!ticketACerrarId) return;

        const btnConfirm = document.getElementById("btn-confirmar-cierre-dh");
        btnConfirm.disabled = true;
        btnConfirm.textContent = "Cerrando...";

        try {
            await updateDoc(doc(db, "quejas", ticketACerrarId), {
                estado: "cerrado",
                motivoCierre: motivo,
                timestamp: Date.now()
            });
            modalEl.classList.remove("activo");
            inputMotivo.value = "";
            ticketACerrarId = null;

            if (typeof window.mostrarNotificacionAuth === "function") {
                window.mostrarNotificacionAuth("Reclamo Cerrado", "El ticket quedó cerrado y el cliente fue notificado.");
            }
        } catch (err) {
            alert("Error al cerrar el reclamo: " + err.message);
        } finally {
            btnConfirm.disabled = false;
            btnConfirm.textContent = "Cerrar Reclamo";
        }
    });
}

window.seleccionarMotivoRapido = function (texto) {
    const input = document.getElementById("input-motivo-cierre-dh");
    if (input) {
        input.value = texto;
        input.style.borderColor = "#d4af37";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    inyectarModalCierreReclamo();

    const vistaGuest = document.getElementById("soporte-guest-wall");
    const vistaUsuario = document.getElementById("soporte-usuario-grid");
    const vistaAdmin = document.getElementById("soporte-admin-inbox");

    const formQueja = document.getElementById("form-nueva-queja");
    const inputNombre = document.getElementById("queja-nombre");
    const inputCorreo = document.getElementById("queja-correo");
    const inputCategoria = document.getElementById("queja-categoria");
    const inputAsunto = document.getElementById("queja-asunto");
    const inputDescripcion = document.getElementById("queja-descripcion");
    const boxPruebaUser = document.getElementById("box-prueba-usuario");
    const inputFileUser = document.getElementById("queja-file-usuario");
    const textPruebaUser = document.getElementById("text-prueba-usuario");
    const previewPruebaUser = document.getElementById("preview-prueba-usuario");

    if (boxPruebaUser && inputFileUser) {
        boxPruebaUser.addEventListener("click", () => inputFileUser.click());
        inputFileUser.addEventListener("change", () => {
            const file = inputFileUser.files[0];
            if (!file) return;
            optimizarImagenPrueba(file, (b64) => {
                pruebaUsuarioBase64 = b64;
                previewPruebaUser.src = b64;
                previewPruebaUser.style.display = "block";
                textPruebaUser.textContent = "Prueba adjuntada: " + file.name;
            });
        });
    }

    onAuthStateChanged(auth, (user) => {
        usuarioSesion = user;

        if (!user) {
            vistaGuest.style.display = "block";
            vistaUsuario.style.display = "none";
            vistaAdmin.style.display = "none";
            return;
        }

        vistaGuest.style.display = "none";

        if (user.email === ADMIN_EMAIL) {
            vistaUsuario.style.display = "none";
            vistaAdmin.style.display = "grid";
        } else {
            vistaAdmin.style.display = "none";
            vistaUsuario.style.display = "grid";

            const nombreGuardado = localStorage.getItem("username") || user.email.split("@")[0];
            if (inputNombre) inputNombre.value = nombreGuardado;
            if (inputCorreo) {
                inputCorreo.value = user.email;
                inputCorreo.readOnly = true;
            }
        }

        renderizarInterfazSoporte();
    });

    if (formQueja) {
        formQueja.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!usuarioSesion) return;

            const nombre = inputNombre.value.trim();
            const correo = usuarioSesion.email;
            const categoria = inputCategoria.value;
            const asunto = inputAsunto.value.trim();
            const descripcion = inputDescripcion.value.trim();
            const avatar = localStorage.getItem("avatar_" + correo) || "";

            if (!nombre || !asunto || !descripcion) return;

            const btnEnviar = document.getElementById("btn-enviar-queja");
            btnEnviar.disabled = true;
            btnEnviar.textContent = "Enviando reporte...";

            const fechaStr = new Date().toLocaleString();

            try {
                await addDoc(collection(db, "quejas"), {
                    uid: usuarioSesion.uid,
                    nombre,
                    correo,
                    avatar,
                    categoria,
                    asunto,
                    estado: "abierto",
                    motivoCierre: "",
                    timestamp: Date.now(),
                    fechaCreacion: fechaStr,
                    mensajes: [
                        {
                            autor: "usuario",
                            remitenteNombre: nombre,
                            asunto,
                            texto: descripcion,
                            imagen: pruebaUsuarioBase64 || "",
                            fecha: fechaStr
                        }
                    ]
                });

                formQueja.reset();
                inputNombre.value = localStorage.getItem("username") || nombre;
                inputCorreo.value = correo;
                pruebaUsuarioBase64 = "";
                previewPruebaUser.style.display = "none";
                textPruebaUser.textContent = "Seleccionar captura o prueba (opcional)";

                if (typeof window.mostrarNotificacionAuth === "function") {
                    window.mostrarNotificacionAuth(
                        "Reporte Enviado",
                        "Hemos recibido tu solicitud. Pronto recibirás una respuesta en tu bandeja de seguimiento."
                    );
                }
            } catch (err) {
                alert("Error al enviar el reporte: " + err.message);
            } finally {
                btnEnviar.disabled = false;
                btnEnviar.textContent = "Enviar Reporte";
            }
        });
    }

    const qQuejas = query(collection(db, "quejas"), orderBy("timestamp", "desc"));
    onSnapshot(qQuejas, (snapshot) => {
        todasLasQuejas = [];
        snapshot.forEach((docSnap) => {
            todasLasQuejas.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderizarInterfazSoporte();
    });
});

function renderizarInterfazSoporte() {
    if (!usuarioSesion) return;

    if (usuarioSesion.email === ADMIN_EMAIL) {
        renderizarBandejaAdmin();
    } else {
        renderizarAcordeonUsuario();
    }
}

// ============================================================
// VISTA USUARIO: ACORDEÓN DE CORREOS ENVIADOS Y RESPUESTAS
// ============================================================
function renderizarAcordeonUsuario() {
    const contenedor = document.getElementById("usuario-quejas-acordeon");
    if (!contenedor) return;

    const misQuejas = todasLasQuejas.filter(q => q.correo === usuarioSesion.email);
    const contadorBadge = document.getElementById("contador-mis-quejas");
    if (contadorBadge) contadorBadge.textContent = misQuejas.length;

    if (misQuejas.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding:45px 20px; color:#888;">
                <p style="font-size:14px; margin-bottom:6px;">No tienes reportes o quejas enviadas aún.</p>
                <small>Cuando envíes un formulario, aquí aparecerá el hilo de seguimiento estilo correo.</small>
            </div>
        `;
        return;
    }

    const abiertosIds = new Set();
    contenedor.querySelectorAll(".dh-mail-item.abierto").forEach(el => {
        abiertosIds.add(el.getAttribute("data-qid"));
    });

    contenedor.innerHTML = misQuejas.map((queja, index) => {
        const estaAbierto = abiertosIds.has(queja.id) || (abiertosIds.size === 0 && index === 0);
        const cerrado = queja.estado === "cerrado";
        const mensajes = queja.mensajes || [];

        const hiloHTML = mensajes.map(m => {
            const esAdmin = m.autor === "admin";
            return `
                <div class="dh-mail-msg ${esAdmin ? 'msg-admin' : 'msg-user'}">
                    <div class="dh-mail-msg-meta">
                        <strong>${esAdmin ? 'Soporte Diamond Hats (Admin)' : escaparHTML(m.remitenteNombre)}</strong>
                        <span>${escaparHTML(m.fecha)}</span>
                    </div>
                    ${m.asunto ? `<div class="dh-mail-msg-subj">Asunto: ${escaparHTML(m.asunto)}</div>` : ''}
                    <p class="dh-mail-msg-body">${escaparHTML(m.texto).replace(/\n/g, "<br>")}</p>
                    ${m.imagen ? `<img src="${m.imagen}" class="dh-mail-proof-img" alt="Adjunto" onclick="window.open(this.src, '_blank')">` : ''}
                </div>
            `;
        }).join("");

        const zonaRespuestaHTML = cerrado
            ? `
                <div class="dh-closed-notice">
                    <strong>Reclamo Cerrado por el Administrador</strong>
                    <p>Motivo: ${escaparHTML(queja.motivoCierre || "Caso resuelto y finalizado.")}</p>
                    <small>Este hilo ya no admite más respuestas, pero puedes crear un nuevo reporte en el formulario si lo necesitas.</small>
                </div>
            `
            : `
                <form class="dh-reply-box" onsubmit="enviarRespuestaUsuario(event, '${queja.id}')">
                    <input type="text" id="reply-subj-${queja.id}" placeholder="Asunto de respuesta (opcional)" class="dh-reply-input">
                    <textarea id="reply-text-${queja.id}" rows="2" placeholder="Escribe tu respuesta para soporte..." required class="dh-reply-input"></textarea>
                    <div class="dh-reply-actions">
                        <label class="dh-attach-label">
                            Adjuntar imagen
                            <input type="file" accept="image/*" style="display:none;" onchange="previsualizarAdjuntoHilo(this, 'prev-user-${queja.id}')">
                        </label>
                        <button type="submit" class="dh-btn-send-reply">Enviar Respuesta</button>
                    </div>
                    <img id="prev-user-${queja.id}" data-base64="" style="display:none; max-width:110px; border-radius:6px; margin-top:8px; border:1px solid #d4af37;">
                </form>
            `;

        return `
            <div class="dh-mail-item ${estaAbierto ? 'abierto' : ''}" data-qid="${queja.id}">
                <div class="dh-mail-header" onclick="toggleAcordeonQueja('${queja.id}')">
                    <div>
                        <span class="dh-mail-cat-tag">${escaparHTML(queja.categoria)}</span>
                        <strong class="dh-mail-title">${escaparHTML(queja.asunto)}</strong>
                        <div class="dh-mail-date">${escaparHTML(queja.fechaCreacion)} · ${mensajes.length} mensaje(s)</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="dh-status-pill ${cerrado ? 'closed' : 'open'}">${cerrado ? 'Cerrado' : 'En Seguimiento'}</span>
                        <span class="dh-chevron">▼</span>
                    </div>
                </div>
                <div class="dh-mail-body-wrap">
                    <div class="dh-mail-thread">
                        ${hiloHTML}
                        ${zonaRespuestaHTML}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

window.toggleAcordeonQueja = function (qid) {
    const el = document.querySelector(`.dh-mail-item[data-qid="${qid}"]`);
    if (el) el.classList.toggle("abierto");
};

window.previsualizarAdjuntoHilo = function (inputEl, imgId) {
    const file = inputEl.files[0];
    if (!file) return;
    optimizarImagenPrueba(file, (b64) => {
        const imgEl = document.getElementById(imgId);
        if (imgEl) {
            imgEl.src = b64;
            imgEl.setAttribute("data-base64", b64);
            imgEl.style.display = "block";
        }
    });
};

window.enviarRespuestaUsuario = async function (e, qid) {
    e.preventDefault();
    if (!usuarioSesion) return;

    const subjEl = document.getElementById(`reply-subj-${qid}`);
    const textEl = document.getElementById(`reply-text-${qid}`);
    const prevEl = document.getElementById(`prev-user-${qid}`);

    const texto = textEl.value.trim();
    if (!texto) return;

    const nuevoMensaje = {
        autor: "usuario",
        remitenteNombre: localStorage.getItem("username") || usuarioSesion.email.split("@")[0],
        asunto: subjEl ? subjEl.value.trim() : "",
        texto,
        imagen: prevEl ? (prevEl.getAttribute("data-base64") || "") : "",
        fecha: new Date().toLocaleString()
    };

    try {
        await updateDoc(doc(db, "quejas", qid), {
            mensajes: arrayUnion(nuevoMensaje),
            timestamp: Date.now()
        });
    } catch (err) {
        alert("No se pudo enviar tu respuesta: " + err.message);
    }
};

// ============================================================
// VISTA ADMINISTRADOR: BANDEJA DE ENTRADA ESTILO GMAIL
// ============================================================
function renderizarBandejaAdmin() {
    const listaEl = document.getElementById("admin-inbox-list");
    const lecturaEl = document.getElementById("admin-inbox-reader");
    const badgeTotal = document.getElementById("admin-inbox-count");

    if (!listaEl || !lecturaEl) return;

    const abiertos = todasLasQuejas.filter(q => q.estado !== "cerrado").length;
    if (badgeTotal) badgeTotal.textContent = `${abiertos} abiertos / ${todasLasQuejas.length} total`;

    if (todasLasQuejas.length === 0) {
        listaEl.innerHTML = `<p style="color:#888; text-align:center; padding:35px 15px;">No hay quejas o reportes recibidos aún.</p>`;
        lecturaEl.innerHTML = `<div style="text-align:center; color:#777; padding:60px 20px;">Bandeja vacía</div>`;
        return;
    }

    if (!ticketSeleccionadoAdminId || !todasLasQuejas.some(q => q.id === ticketSeleccionadoAdminId)) {
        ticketSeleccionadoAdminId = todasLasQuejas[0].id;
    }

    const esOscuro = document.body.classList.contains("dark-mode");
    const colorTextoPrincipal = esOscuro ? "#ffffff" : "#111111";

    listaEl.innerHTML = todasLasQuejas.map(q => {
        const activo = q.id === ticketSeleccionadoAdminId;
        const cerrado = q.estado === "cerrado";
        const avatarHTML = q.avatar
            ? `<img src="${q.avatar}" alt="User">`
            : `<span>${escaparHTML((q.nombre || "U").charAt(0).toUpperCase())}</span>`;

        return `
            <div class="dh-admin-mail-row ${activo ? 'active' : ''}" onclick="seleccionarQuejaAdmin('${q.id}')">
                <div class="dh-admin-user-avatar">${avatarHTML}</div>
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                        <strong style="color:${colorTextoPrincipal}; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escaparHTML(q.nombre)}</strong>
                        <span class="dh-status-pill ${cerrado ? 'closed' : 'open'}" style="font-size:10px; padding:2px 7px;">${cerrado ? 'Cerrado' : 'Abierto'}</span>
                    </div>
                    <div style="font-size:11.5px; color:#888; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escaparHTML(q.correo)}</div>
                    <div style="font-size:12.5px; color:#cca142; font-weight:700; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escaparHTML(q.asunto)}</div>
                </div>
            </div>
        `;
    }).join("");

    const actual = todasLasQuejas.find(q => q.id === ticketSeleccionadoAdminId);
    if (!actual) return;

    const cerrado = actual.estado === "cerrado";
    const avatarGrande = actual.avatar
        ? `<img src="${actual.avatar}" alt="Avatar">`
        : `<span>${escaparHTML((actual.nombre || "U").charAt(0).toUpperCase())}</span>`;

    const mensajesHTML = (actual.mensajes || []).map(m => {
        const esAdmin = m.autor === "admin";
        return `
            <div class="dh-mail-msg ${esAdmin ? 'msg-admin' : 'msg-user'}">
                <div class="dh-mail-msg-meta">
                    <strong>${esAdmin ? 'Tú (Administrador Diamond Hats)' : escaparHTML(m.remitenteNombre)}</strong>
                    <span>${escaparHTML(m.fecha)}</span>
                </div>
                ${m.asunto ? `<div class="dh-mail-msg-subj">Asunto: ${escaparHTML(m.asunto)}</div>` : ''}
                <p class="dh-mail-msg-body">${escaparHTML(m.texto).replace(/\n/g, "<br>")}</p>
                ${m.imagen ? `<img src="${m.imagen}" class="dh-mail-proof-img" alt="Adjunto" onclick="window.open(this.src, '_blank')">` : ''}
            </div>
        `;
    }).join("");

    lecturaEl.innerHTML = `
        <div class="dh-reader-top">
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="dh-admin-user-avatar" style="width:48px; height:48px;">${avatarGrande}</div>
                <div>
                    <h3 style="color:${colorTextoPrincipal}; font-size:16px; margin-bottom:2px;">${escaparHTML(actual.nombre)}</h3>
                    <span style="color:#888; font-size:12.5px;">${escaparHTML(actual.correo)}</span> ·
                    <span class="dh-mail-cat-tag">${escaparHTML(actual.categoria)}</span>
                </div>
            </div>
            ${!cerrado ? `<button type="button" class="dh-btn-close-ticket" onclick="cerrarReclamoAdmin('${actual.id}')">Cerrar Reclamo</button>` : ''}
        </div>

        <div style="margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid rgba(150,150,150,0.2);">
            <strong style="color:#cca142; font-size:15px;">Asunto: ${escaparHTML(actual.asunto)}</strong>
            <div style="font-size:11.5px; color:#888;">Recibido: ${escaparHTML(actual.fechaCreacion)}</div>
        </div>

        <div class="dh-mail-thread" style="max-height:320px; overflow-y:auto; padding-right:6px;">
            ${mensajesHTML}
        </div>

        ${cerrado
            ? `
                <div class="dh-closed-notice" style="margin-top:16px;">
                    <strong>Reclamo Cerrado</strong>
                    <p>Motivo registrado: ${escaparHTML(actual.motivoCierre)}</p>
                </div>
            `
            : `
                <form class="dh-reply-box" style="margin-top:16px;" onsubmit="responderQuejaAdmin(event, '${actual.id}')">
                    <strong style="display:block; font-size:12px; color:#cca142; margin-bottom:8px; text-transform:uppercase;">Responder al Cliente</strong>
                    <input type="text" id="admin-reply-subj" placeholder="Asunto de respuesta (Ej. Re: ${escaparHTML(actual.asunto)})" class="dh-reply-input">
                    <textarea id="admin-reply-text" rows="3" placeholder="Escribe la solución o respuesta oficial..." required class="dh-reply-input"></textarea>
                    <div class="dh-reply-actions">
                        <label class="dh-attach-label">
                            Adjuntar imagen
                            <input type="file" accept="image/*" style="display:none;" onchange="previsualizarAdjuntoHilo(this, 'prev-admin-reply')">
                        </label>
                        <button type="submit" class="dh-btn-send-reply">Enviar Respuesta</button>
                    </div>
                    <img id="prev-admin-reply" data-base64="" style="display:none; max-width:120px; border-radius:6px; margin-top:8px; border:1px solid #d4af37;">
                </form>
            `
        }
    `;
}

window.seleccionarQuejaAdmin = function (qid) {
    ticketSeleccionadoAdminId = qid;
    renderizarBandejaAdmin();
};

window.responderQuejaAdmin = async function (e, qid) {
    e.preventDefault();
    const subj = document.getElementById("admin-reply-subj").value.trim();
    const texto = document.getElementById("admin-reply-text").value.trim();
    const prevEl = document.getElementById("prev-admin-reply");
    if (!texto) return;

    const respuestaAdmin = {
        autor: "admin",
        remitenteNombre: "Soporte Diamond Hats",
        asunto: subj,
        texto,
        imagen: prevEl ? (prevEl.getAttribute("data-base64") || "") : "",
        fecha: new Date().toLocaleString()
    };

    try {
        await updateDoc(doc(db, "quejas", qid), {
            mensajes: arrayUnion(respuestaAdmin),
            timestamp: Date.now()
        });
        if (typeof window.mostrarNotificacionAuth === "function") {
            window.mostrarNotificacionAuth("Respuesta Enviada", "El cliente ya puede ver tu respuesta en su bandeja.");
        }
    } catch (err) {
        alert("Error al enviar respuesta: " + err.message);
    }
};

window.cerrarReclamoAdmin = function (qid) {
    ticketACerrarId = qid;
    const modalEl = document.getElementById("modal-cerrar-reclamo-dh");
    const inputMotivo = document.getElementById("input-motivo-cierre-dh");
    if (inputMotivo) {
        inputMotivo.value = "";
        inputMotivo.style.borderColor = "#3a3a3a";
    }
    if (modalEl) {
        modalEl.classList.add("activo");
        setTimeout(() => { if (inputMotivo) inputMotivo.focus(); }, 100);
    }
};