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
        // Permitimos borrar y escribir de forma nativa sin balas intermedias que bloqueen el borrado
        let val = inputCard.value.replace(/\D/g, '').substring(0, 16);
        let formatted = "";
        for (let i = 0; i < val.length; i++) {
            formatted += val[i];
            if ((i + 1) % 4 === 0 && (i + 1) < 16) {
                formatted += " ";
            }
        }
        inputCard.value = formatted;
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
            `;
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