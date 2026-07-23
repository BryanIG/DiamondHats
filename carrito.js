// ============================
// VARIABLES DEL CARRITO
// ============================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// Elementos HTML

const carritoPanel = document.getElementById("carrito");

const abrirCarrito = document.getElementById("abrir-carrito");

const cerrarCarrito = document.getElementById("cerrar-carrito");

const productosCarrito = document.getElementById("productos-carrito");

const contador = document.getElementById("contador");

const totalElemento = document.getElementById("total");




// ============================
// ABRIR Y CERRAR
// ============================


abrirCarrito.addEventListener("click", () => {

    carritoPanel.classList.add("activo");

});


cerrarCarrito.addEventListener("click", () => {

    carritoPanel.classList.remove("activo");

});




// ============================
// AGREGAR PRODUCTO
// ============================


function agregarCarrito(producto) {


    const existe = carrito.find(
        item => item.nombre === producto.nombre
    );


    if (existe) {

        existe.cantidad++;

    } else {

        carrito.push({

            ...producto,

            cantidad: 1

        });

    }


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// MOSTRAR CARRITO
// ============================


function actualizarCarrito() {


    productosCarrito.innerHTML = "";


    let total = 0;



    carrito.forEach(producto => {


        total += producto.precio * producto.cantidad;



        productosCarrito.innerHTML += `


        <div class="producto-carrito">


            <img src="Imagenes page/${producto.imagen}">



            <div>


                <h4>
                ${producto.nombre}
                </h4>



                <p>
                $${producto.precio} MXN
                </p>



                <div class="acciones">


                    <button onclick="disminuir('${producto.nombre}')">
                    -
                    </button>



                    <span>
                    ${producto.cantidad}
                    </span>



                    <button onclick="aumentar('${producto.nombre}')">
                    +
                    </button>



                    <button 
                    class="eliminar"
                    onclick="eliminarProducto('${producto.nombre}')">

                    🗑

                    </button>


                </div>



            </div>


        </div>


        `;


    });



    contador.textContent = carrito.reduce(
        (acc, item) => acc + item.cantidad,
        0
    );


    totalElemento.textContent = total;


}






// ============================
// AUMENTAR
// ============================


function aumentar(nombre) {


    const producto = carrito.find(
        item => item.nombre === nombre
    );


    producto.cantidad++;


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// DISMINUIR
// ============================


function disminuir(nombre) {


    const producto = carrito.find(
        item => item.nombre === nombre
    );


    if (producto.cantidad > 1) {

        producto.cantidad--;

    } else {

        eliminarProducto(nombre);

        return;

    }


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// ELIMINAR
// ============================


function eliminarProducto(nombre) {


    carrito = carrito.filter(
        item => item.nombre !== nombre
    );


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// GUARDAR CARRITO
// ============================


function guardarCarrito() {


    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


}

// Cargar carrito al entrar
actualizarCarrito();


// ==========================================
// SIMULACIÓN DE COMPRA & PASARELA DE PAGO
// ==========================================

// Inyección dinámica de modales en el DOM
function inyectarModalesDinamicos() {
    if (!document.getElementById("modal-checkout")) {
        const checkoutHTML = `
            <div id="modal-checkout" class="modal-overlay">
                <div class="modal-container checkout-container">
                    <button id="cerrar-checkout" class="modal-cerrar-btn">✖</button>
                    <div class="checkout-content">
                        <h2>  Realizar  Pago </h2>
                        <p class="checkout-subtitle">Ingresa los datos para procesar tu orden.</p>
                        
                        <form id="checkoutForm">
                            <div class="checkout-field">
                                <label for="checkoutEmail">Email de Facturación</label>
                                <input type="email" id="checkoutEmail" placeholder="correo@ejemplo.com" required>
                            </div>

                            <div class="checkout-field">
                                <label for="checkoutName">Titular de la Tarjeta</label>
                                <input type="text" id="checkoutName" placeholder="Nombre en tarjeta" required>
                            </div>

                            <div class="checkout-field">
                                <label for="checkoutCard">Número de Tarjeta </label>
                                <div class="card-input-wrapper">
                                    <input type="text" id="checkoutCard" placeholder="•••• •••• •••• ••••" maxlength="19" required>
                                </div>
                            </div>

                            <div class="checkout-row">
                                <div class="checkout-field half">
                                    <label for="checkoutExpiry">Expira (MM/AA)</label>
                                    <input type="text" id="checkoutExpiry" placeholder="MM/AA" maxlength="5" required>
                                </div>
                                <div class="checkout-field half">
                                    <label for="checkoutCvv">CVV</label>
                                    <input type="password" id="checkoutCvv" placeholder="•••" maxlength="3" required>
                                </div>
                            </div>

                            <button type="submit" class="btn-checkout-pay">Realizar Pago</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
    }

    if (!document.getElementById("modal-exito-compra")) {
        const successHTML = `
            <div id="modal-exito-compra" class="modal-overlay">
                <div class="modal-container ticket-container">
                    <button id="cerrar-exito" class="modal-cerrar-btn">✖</button>
                    <div class="ticket-content">
                        <div class="success-icon-wrapper">
                            <div class="success-circle">
                                <span class="success-checkmark">✓</span>
                            </div>
                        </div>
                        <h2>Tu compra se realizó correctamente</h2>
                        
                        <!-- Recibo Ficticio -->
                        <div class="ticket-receipt" id="ticketReceipt">
                            <!-- Dinámico -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', successHTML);
    }
}

// Inicializar la inyección
inyectarModalesDinamicos();

const modalCheckout = document.getElementById("modal-checkout");
const btnCerrarCheckout = document.getElementById("cerrar-checkout");
const formCheckout = document.getElementById("checkoutForm");
const inputCheckoutEmail = document.getElementById("checkoutEmail");
const btnFinalizar = document.querySelector(".finalizar");

const modalExito = document.getElementById("modal-exito-compra");
const btnCerrarExito = document.getElementById("cerrar-exito");
const containerTicket = document.getElementById("ticketReceipt");

// Función globalisable para abrir el modal desde carrito u otros JS
function abrirCheckoutModal() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega gorras para comprar.");
        return;
    }

    // Auto-completar correo si hay sesión activa
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
        inputCheckoutEmail.value = userEmail;
        inputCheckoutEmail.readOnly = true;
    } else {
        inputCheckoutEmail.value = "";
        inputCheckoutEmail.readOnly = false;
    }

    // Cerrar panel lateral del carrito
    if (typeof carritoPanel !== 'undefined' && carritoPanel) {
        carritoPanel.classList.remove("activo");
    } else {
        const lateralEl = document.getElementById("carrito-lateral");
        if (lateralEl) lateralEl.classList.remove("activo");
    }

    // Abrir Checkout
    if (modalCheckout) {
        modalCheckout.classList.add("activo");
    }
}

// Hacer abrirCheckoutModal global para que gorras.js lo pueda ver
window.abrirCheckoutModal = abrirCheckoutModal;

// Abrir portal de pago desde el botón del carrito
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", abrirCheckoutModal);
}

// Cerrar portal de pago
if (btnCerrarCheckout) {
    btnCerrarCheckout.addEventListener("click", () => {
        modalCheckout.classList.remove("activo");
    });
}

// Enmascaramiento de datos de tarjeta en tiempo real (separado por espacios)
const inputCard = document.getElementById("checkoutCard");

if (inputCard) {
    inputCard.addEventListener("input", (e) => {
        const cursorPos = inputCard.selectionStart;
        const oldLen = inputCard.value.length;

        // Only digits, max 16
        let digits = inputCard.value.replace(/\D/g, '').substring(0, 16);
        // Format with spaces every 4 digits
        let formatted = digits.replace(/(.{4})/g, '$1 ').trim();

        inputCard.value = formatted;

        // Restore cursor: compensate for added spaces
        const newLen = inputCard.value.length;
        const diff = newLen - oldLen;
        const newCursor = Math.max(0, cursorPos + diff);
        inputCard.setSelectionRange(newCursor, newCursor);
    });

    // Allow backspace on space characters (skip them)
    inputCard.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            const pos = inputCard.selectionStart;
            if (pos > 0 && inputCard.value[pos - 1] === " ") {
                e.preventDefault();
                // Remove the digit before the space as well
                const val = inputCard.value;
                inputCard.value = val.substring(0, pos - 2) + val.substring(pos);
                inputCard.setSelectionRange(pos - 2, pos - 2);
                // Re-trigger formatter
                inputCard.dispatchEvent(new Event("input"));
            }
        }
    });
}

const inputExpiry = document.getElementById("checkoutExpiry");
if (inputExpiry) {
    inputExpiry.addEventListener("input", (e) => {
        let val = inputExpiry.value.replace(/\D/g, '');

        // Evitamos que al presionar Backspace el slash auto-formateado bloquee la acción
        if (e.inputType === "deleteContentBackward" && val.length === 2) {
            inputExpiry.value = val;
            return;
        }

        if (val.length >= 2) {
            inputExpiry.value = val.substring(0, 2) + '/' + val.substring(2, 4);
        } else {
            inputExpiry.value = val;
        }
    });
}

// Nota: Eliminamos inputCvv listener para permitir que el CVV se pueda borrar y escribir nativamente en el input type="password"


// Procesar Pago
if (formCheckout) {
    formCheckout.addEventListener("submit", (e) => {
        e.preventDefault();

        const rawCard = inputCard ? inputCard.value.replace(/\s/g, '') : "";
        if (rawCard.length < 16) {
            alert("Por favor, ingresa los 16 dígitos de tu tarjeta.");
            return;
        }

        const cardHolder = document.getElementById("checkoutName").value;
        const emailFacturacion = inputCheckoutEmail.value;

        // Generar items del ticket
        let itemsHtml = "";
        let totalVal = 0;

        carrito.forEach(p => {
            const subtotal = p.precio * p.cantidad;
            totalVal += subtotal;
            itemsHtml += `
                <div class="ticket-item-row">
                    <span>${p.nombre} x${p.cantidad}</span>
                    <span>$${subtotal} MXN</span>
                </div>
            `;
        });

        const ticketId = `DH-${Math.floor(100000 + Math.random() * 900000)}-MX`;
        const activeUser = localStorage.getItem("username") || "Cliente";

        // Escribir el ticket a HTML
        if (containerTicket) {
            containerTicket.innerHTML = `
                <div class="ticket-header-brand">
                    <h3>DIAMOND HATS</h3>
                    <p class="ticket-slogan">Estilo con actitud y distinción</p>
                </div>
                <div class="ticket-meta">
                    <p><strong>Ticket ID:</strong> ${ticketId}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <hr class="ticket-hr">
                <div class="ticket-billing">
                    <p><strong>Cliente:</strong> ${activeUser}</p>
                    <p><strong>Titular de Tarjeta:</strong> ${cardHolder}</p>
                    <p><strong>Método de Pago:</strong> Tarjeta Termina en *${rawCard.substring(12)}</p>
                </div>
                <hr class="ticket-hr">
                <div class="ticket-products">
                    ${itemsHtml}
                </div>
                <hr class="ticket-hr">
                <div class="ticket-total-row">
                    <span>Total Pagado:</span>
                    <strong>$${totalVal} MXN</strong>
                </div>
                <p class="ticket-receipt-alert">Hemos enviado este ticket de compra ficticio al correo: <strong>${emailFacturacion}</strong></p>
                <div style="text-align:center;margin-top:15px;">
                    <button id="btn-descargar-pdf" onclick="generarPDFTicket()" style="display:inline-flex;align-items:center;gap:8px;padding:11px 28px;background:rgba(20,20,20,0.75);color:#fff;border:1.5px solid rgba(255,255,255,0.45);border-radius:30px;font-size:14px;font-weight:700;letter-spacing:0.5px;cursor:pointer;backdrop-filter:blur(6px);transition:all 0.3s ease;">
                        📄 Descargar Ticket PDF
                    </button>
                </div>
            `;

            // Obtener dirección del usuario (si está registrado)
            const userCalle = localStorage.getItem("userCalle") || "No registrada";
            const userNumExt = localStorage.getItem("userNumExt") || "";
            const userColonia = localStorage.getItem("userColonia") || "";
            const direccionCompleta = userCalle !== "No registrada" ? `${userCalle} ${userNumExt}, Col. ${userColonia}` : "Recoger en sucursal / No registrada";

            // Store ticket data for PDF generation
            window._ticketData = {
                ticketId,
                activeUser,
                emailFacturacion,
                cardHolder,
                rawCard,
                itemsHtml,
                totalVal,
                direccionCompleta,
                date: new Date().toLocaleString()
            };
        }

        // Vaciar Carrito
        carrito = [];
        guardarCarrito();
        actualizarCarrito();

        // Limpiar Formulario
        formCheckout.reset();

        // Cerrar Checkout, abrir modals de Exito
        modalCheckout.classList.remove("activo");
        modalExito.classList.add("activo");
    });
}

// Cerrar Modal de Éxito
if (btnCerrarExito) {
    btnCerrarExito.addEventListener("click", () => {
        modalExito.classList.remove("activo");
    });
}

// Cerrar si se da click al fondo gris del overlay
window.addEventListener("click", (e) => {
    if (e.target === modalCheckout) {
        modalCheckout.classList.remove("activo");
    }
    if (e.target === modalExito) {
        modalExito.classList.remove("activo");
    }
});

// =============================================
// GENERACIÓN DE PDF - TICKET DE COMPRA
// =============================================
function generarPDFTicket() {
    const d = window._ticketData;
    if (!d) { alert("No hay datos de ticket disponibles."); return; }

    // QR code URL: points to a URL that would trigger a download/view of the ticket pseudo-endpoint
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
    .stamp { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #cca142; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #cca142; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 10px; }
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
    <h1>💎 DIAMOND HATS</h1>
    <p>Estilo con actitud y distinción</p>
  </div>
  <div class="meta">
    <span><strong>Ticket ID:</strong> ${d.ticketId}</span>
    <span><strong>Fecha:</strong> ${d.date}</span>
  </div>

  <div class="section-title">Datos del Cliente</div>
  <div class="info-row"><span>Usuario</span><span>${d.activeUser}</span></div>
  <div class="info-row"><span>Correo</span><span>${d.emailFacturacion}</span></div>
  <div class="info-row"><span>Titular de Tarjeta</span><span>${d.cardHolder}</span></div>
  <div class="info-row"><span>Tarjeta</span><span>**** **** **** ${d.rawCard.substring(12)}</span></div>
  <div class="info-row"><span>Dirección de Envío</span><span style="font-size:12px;text-align:right;">${d.direccionCompleta}</span></div>

  <div class="section-title">Productos</div>
  ${d.itemsHtml.replace(/ticket-item-row/g, 'info-row')}

  <div class="total-row">
    <span>Total Pagado</span>
    <span>$${d.totalVal} MXN</span>
  </div>

  <div class="stamp-qr">
    <div class="stamp">
      <div class="diamond">💎</div>
      <div>DIAMOND<br>HATS</div>
      <div style="font-size:8px;margin-top:4px;color:#888;">TIKET VERIFICADO</div>
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