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
    const d = historial[index];
    if (!d) {
        alert("No hay datos de ticket disponibles.");
        return;
    }

    const downloadUrl = window.location.origin + `/descargar-ticket.html?id=${d.ticketId}`;
    const qrContent = encodeURIComponent(downloadUrl);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrContent}`;

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
    .stamp { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #cca142; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #cca142; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 10px; opacity: 0.8; transform: rotate(-5deg); }
    .stamp .diamond { font-size: 22px; margin-bottom: 4px; }
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
  <div class="info-row"><span>Usuario</span><span>${d.activeUser || 'Cliente'}</span></div>
  <div class="info-row"><span>Correo</span><span>${d.emailFacturacion || '-'}</span></div>
  <div class="info-row"><span>Titular de Tarjeta</span><span>${d.cardHolder || '-'}</span></div>
  <div class="info-row"><span>Tarjeta</span><span>**** **** **** ${d.rawCard ? d.rawCard.substring(12) : '----'}</span></div>
  <div class="info-row"><span>Dirección de Envío</span><span style="font-size:12px;text-align:right;">${d.direccionCompleta || '-'}</span></div>

  <div class="section-title">Productos</div>
  ${d.itemsHtml ? d.itemsHtml.replace(/ticket-item-row/g, 'info-row') : ''}

  <div class="total-row">
    <span>Total Pagado</span>
    <span>$${d.totalVal || '0.00'} MXN</span>
  </div>

  <div class="stamp-qr">
    <div class="stamp">
      <div class="diamond">💎</div>
      <div>DIAMOND<br>HATS</div>
      <div style="font-size:8px;margin-top:4px;color:#888;">COPIA DE OFICINA</div>
    </div>
    <div class="qr-block">
      <img src="${qrUrl}" alt="QR Ticket">
      <p>Escanea para verificar tu compra</p>
    </div>
  </div>

  <div class="footer">
    © 2026 Diamond Hats · Copia del Historial
  </div>

  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
  </script>
</body>
</html>`;

    const popup = window.open("", "_blank", "width=680,height=920,scrollbars=yes");
    if (popup) {
        popup.document.write(html);
        popup.document.close();
    } else {
        alert("El navegador bloqueó la ventana emergente del Ticket. Habilita los popups.");
    }
};
