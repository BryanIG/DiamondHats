document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const authWall = document.getElementById("ayuda-auth-wall");
    const dashboard = document.getElementById("ayuda-dashboard");
    const userNameSpan = document.getElementById("ayuda-user-name");

    const timelineHTML = `
        <div class="timeline-container">
            <div class="timeline-line">
                <div class="timeline-fill" id="timeline-fill-bar" style="width: 0%;"></div>
                
                <div class="timeline-step" id="step-1">
                    <span class="timeline-label">Confirmado</span>
                </div>
                <div class="timeline-step" id="step-2">
                    <span class="timeline-label">Empacado</span>
                </div>
                <div class="timeline-step" id="step-3">
                    <span class="timeline-label">En Camino</span>
                </div>
                <div class="timeline-step" id="step-4">
                    <span class="timeline-label">Entregado</span>
                </div>
            </div>
            
            <p id="timeline-status-text" style="text-align:center; margin-top:40px; color:#cca142; font-weight:600; font-size:14px;"></p>
        </div>
    `;

    if (!token) {
        authWall.style.display = "block";
        dashboard.style.display = "none";
    } else {
        authWall.style.display = "none";
        dashboard.style.display = "block";
        userNameSpan.textContent = localStorage.getItem("username") || "Cliente";

        cargarHistorial();
    }

    function cargarHistorial() {
        const historial = JSON.parse(localStorage.getItem("historial_compras") || "[]");
        const tabla = document.getElementById("tabla-historial");
        const noMsg = document.getElementById("no-history-msg");
        const tContainer = document.getElementById("timeline-container-render");

        if (historial.length === 0) {
            noMsg.style.display = "block";
            tContainer.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">No tienes pedidos activos. Explora el catálogo.</p>';
            return;
        }

        // --- RENDERIZAR TABLA HISTORIAL ---
        tabla.innerHTML = '';
        historial.forEach((ticket, idx) => {
            tabla.innerHTML += `
                <tr>
                    <td>#${ticket.ticketId}</td>
                    <td>${ticket.date}</td>
                    <td>$${ticket.totalVal} MXN</td>
                    <td>
                        <button class="btn-descargar-mini" onclick="descargarTicket(${idx})">📄 Recuperar</button>
                    </td>
                </tr>
            `;
        });

        // --- RENDERIZAR TIMELINE DEL PEDIDO MAS RECIENTE ---
        const ultimoPedido = historial[0];
        if (ultimoPedido && ultimoPedido.en_progreso) {
            tContainer.innerHTML = timelineHTML;
            setTimeout(() => animarTimeline(ultimoPedido.estado_envio), 100);
        } else {
            tContainer.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">No hay pedidos en tránsito actualmente.</p>';
        }
    }

    function animarTimeline(estado) {
        const fillBar = document.getElementById("timeline-fill-bar");
        const step1 = document.getElementById("step-1");
        const step2 = document.getElementById("step-2");
        const step3 = document.getElementById("step-3");
        const step4 = document.getElementById("step-4");
        const text = document.getElementById("timeline-status-text");

        let width = "0%";

        // Reset
        [step1, step2, step3, step4].forEach(s => { s.classList.remove("active", "completed"); });

        setTimeout(() => {
            if (estado === "Confirmado") {
                width = "10%";
                step1.classList.add("active");
                text.textContent = "Tu pago ha sido validado. Preparando tu orden...";
            } else if (estado === "Empacado") {
                width = "33%";
                step1.classList.add("completed");
                step2.classList.add("active");
                text.textContent = "Estamos empacando tus gorras con máxima protección.";
            } else if (estado === "En Camino") {
                width = "66%";
                step1.classList.add("completed");
                step2.classList.add("completed");
                step3.classList.add("active");
                text.textContent = "El paquete ha salido a ruta, llegando próximamente.";
            } else if (estado === "Entregado") {
                width = "100%";
                step1.classList.add("completed");
                step2.classList.add("completed");
                step3.classList.add("completed");
                step4.classList.add("completed"); // o active sin brillar
                text.textContent = "Paquete entregado. ¡Disfruta tus Diamond Hats!";
            }
            fillBar.style.width = width;
        }, 300);
    }
});

// GLOBAL FUNC PARA RECUPERAR TICKET
window.descargarTicket = function (index) {
    const historial = JSON.parse(localStorage.getItem("historial_compras") || "[]");
    const t = historial[index];
    if (!t) return;

    const hiddenContainer = document.getElementById("hidden-pdf-render");

    // Remasterizamos el layout del ticket tal cual como en carrito.js
    const d = new Date(t.date);
    const dateFormatted = d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    hiddenContainer.innerHTML = `
        <div id="pdf-reprint-content" style="padding: 40px; background: #fff; color: #111; font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="font-size: 28px; margin-bottom: 5px; color: #000; font-family: Times New Roman, serif;">DIAMOND HATS</h1>
                <p style="margin: 0; font-size: 14px; color: #555;">RECIBO DE COMPRA (Oficial)</p>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6; border-bottom: 1px dashed #ccc; padding-bottom: 15px;">
                <p><strong>Folio:</strong> ${t.ticketId}</p>
                <p><strong>Fecha y Hora:</strong> ${dateFormatted}</p>
                <p><strong>Cliente:</strong> ${t.activeUser} (${t.emailFacturacion})</p>
                <p><strong>Dirección:</strong> ${t.direccionCompleta}</p>
            </div>

            <div style="margin-bottom: 20px; font-size: 14px; border-bottom: 1px dashed #ccc; padding-bottom: 15px;">
                <p><strong>Titular de Tarjeta:</strong> ${t.cardHolder}</p>
                <p><strong>Método de Pago:</strong> Tarjeta Termina en *${t.rawCard.substring(12)}</p>
            </div>

            <div style="margin-bottom: 30px; font-size: 14px;">
                ${t.itemsHtml}
            </div>

            <div style="font-size: 18px; text-align: right; margin-bottom: 40px; border-top: 2px solid #ccc; padding-top: 15px;">
                <span>Total Pagado:</span>
                <strong>$${t.totalVal} MXN</strong>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <div style="display: inline-block; padding: 15px 30px; border: 3px double #000; transform: rotate(-3deg); font-weight: bold; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; color: #000; font-size: 16px;">
                    COPIA - PAGADO
                </div>
            </div>
        </div>
    `;

    hiddenContainer.style.display = "block";
    const elementToPDF = document.getElementById("pdf-reprint-content");

    const opt = {
        margin: 0.5,
        filename: `DiamondHats_Recuperado_${t.ticketId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elementToPDF).save().then(() => {
        hiddenContainer.style.display = "none";
        hiddenContainer.innerHTML = '';
    });
};
