console.log("Diamond Hats - Control de Cuentas y Navegación");

document.addEventListener("DOMContentLoaded", () => {
    // 1. Control del menú hamburguesa móvil existente
    const menuBtn = document.querySelector(".menu-btn");
    const navbar = document.querySelector(".navbar");

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    // 2. Inyección dinámica del botón de perfil 👤 en .icons
    const iconsContainer = document.querySelector(".icons");
    if (iconsContainer && !document.getElementById("btn-perfil-usuario")) {
        const profileBtn = document.createElement("button");
        profileBtn.id = "btn-perfil-usuario";
        profileBtn.className = "user-btn";
        profileBtn.title = "Mi Cuenta";
        profileBtn.innerHTML = "👤";
        // Prependemos para colocarlo al lado izquierdo del carrito
        iconsContainer.insertBefore(profileBtn, iconsContainer.firstChild);
    }

    // 3. Inyección dinámica de modales en el Body
    function inyectarModalesAuth() {
        if (!document.getElementById("modal-auth")) {
            const authHTML = `
                <div id="modal-auth" class="modal-overlay">
                    <div class="modal-container auth-modal-container">
                        <button id="cerrar-auth" class="modal-cerrar-btn">✖</button>
                        <div class="auth-tabs">
                            <button id="tab-login" class="auth-tab activo">Iniciar Sesión</button>
                            <button id="tab-register" class="auth-tab">Registrarse</button>
                        </div>
                        
                        <form id="authLoginForm" class="auth-form activo">
                            <h2>Logeate</h2>
                            <div class="checkout-field">
                                <label for="authLoginEmail">Correo Electrónico</label>
                                <input type="email" id="authLoginEmail" placeholder="correo@ejemplo.com" required>
                            </div>
                            <div class="checkout-field">
                                <label for="authLoginPass">Contraseña</label>
                                <input type="password" id="authLoginPass" placeholder="Tu contraseña" required>
                            </div>
                            <button type="submit" class="btn-checkout-pay" id="authLoginBtn">Inicia Sesion</button>
                        </form>

                        <form id="authRegisterForm" class="auth-form">
                            <h2>Crea Tu Cuenta</h2>
                            <div class="checkout-field">
                                <label for="authRegUser">Usuario</label>
                                <input type="text" id="authRegUser" placeholder="Usuario" required>
                            </div>
                            <div class="checkout-field">
                                <label for="authRegEmail">Correo Electrónico</label>
                                <input type="email" id="authRegEmail" placeholder="Correo" required>
                            </div>
                            <div class="checkout-field">
                                <label for="authRegPass">Contraseña</label>
                                <input type="password" id="authRegPass" placeholder="Contraseña" required>
                                <div class="psw-strength-container" style="width: 100%; height: 6px; background-color: #e5dfd8; border-radius: 3px; margin-top: 5px; overflow: hidden;">
                                    <div class="psw-strength-bar" id="authPswBar" style="height: 100%; width: 0%; transition: width 0.3s ease, background-color 0.3s ease;"></div>
                                </div>
                                <span id="authPswText" class="psw-strength-text" style="font-size: 11px; color: #666; margin-top: 4px; display: block; text-align: left;">La contraseña debe tener min. 8 letras/números</span>
                            </div>
                            <button type="submit" class="btn-checkout-pay">Registrate</button>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', authHTML);
        }

        if (!document.getElementById("modal-user-profile")) {
            const profileHTML = `
                <div id="modal-user-profile" class="modal-overlay">
                    <div class="modal-container profile-modal-container">
                        <button id="cerrar-profile" class="modal-cerrar-btn">✖</button>
                        <div class="profile-content">
                            <h2>Mi Perfil</h2>
                            <div class="profile-details">
                                <div class="profile-avatar-circle">👤</div>
                                <p><strong>Usuario:</strong> <span id="profileUserVal">Cliente</span></p>
                                <p><strong>Correo:</strong> <span id="profileEmailVal">correo@ejemplo.com</span></p>
                            </div>
                            <hr class="ticket-hr">
                            <div class="profile-actions">
                                <button id="btn-show-change-pass" class="profile-action-btn">Cambiar Contraseña</button>
                                <button id="btn-switch-account" class="profile-action-btn sec">Cambiar de Cuenta</button>
                                <button id="btn-logout" class="profile-action-btn danger">Cerrar Sesión</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', profileHTML);
        }

        if (!document.getElementById("modal-change-password")) {
            const changePassHTML = `
                <div id="modal-change-password" class="modal-overlay">
                    <div class="modal-container cp-modal-container">
                        <button id="cerrar-cp" class="modal-cerrar-btn">✖</button>
                        <div class="cp-content">
                            <h2>Cambiar Contraseña</h2>
                            <form id="authChangePassForm">
                                <div class="checkout-field">
                                    <label for="authCpOldPass">Contraseña Anterior</label>
                                    <input type="password" id="authCpOldPass" placeholder="Escribe tu contraseña actual" required>
                                </div>
                                <div class="checkout-field">
                                    <label for="authCpNewPass">Nueva Contraseña</label>
                                    <input type="password" id="authCpNewPass" placeholder="Min. 8 letras/números" required>
                                </div>
                                <div class="checkout-field">
                                    <label for="authCpConfPass">Confirmar Nueva Contraseña</label>
                                    <input type="password" id="authCpConfPass" placeholder="Repite tu nueva contraseña" required>
                                </div>
                                <button type="submit" class="btn-checkout-pay">Actualizar Contraseña</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', changePassHTML);
        }
    }

    inyectarModalesAuth();

    // 4. Referencias de los modales inyectados
    const modalAuth = document.getElementById("modal-auth");
    const modalProfile = document.getElementById("modal-user-profile");
    const modalCP = document.getElementById("modal-change-password");

    const btnPerfilUsuario = document.getElementById("btn-perfil-usuario");
    const btnCerrarAuth = document.getElementById("cerrar-auth");
    const btnCerrarProfile = document.getElementById("cerrar-profile");
    const btnCerrarCP = document.getElementById("cerrar-cp");

    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("authLoginForm");
    const formRegister = document.getElementById("authRegisterForm");
    const formChangePass = document.getElementById("authChangePassForm");

    const profileUserVal = document.getElementById("profileUserVal");
    const profileEmailVal = document.getElementById("profileEmailVal");

    const btnShowChangePass = document.getElementById("btn-show-change-pass");
    const btnSwitchAccount = document.getElementById("btn-switch-account");
    const btnLogout = document.getElementById("btn-logout");

    // Inputs y validaciones
    const inputRegPass = document.getElementById("authRegPass");
    const authPswBar = document.getElementById("authPswBar");
    const authPswText = document.getElementById("authPswText");

    const inputLoginEmail = document.getElementById("authLoginEmail");
    const inputLoginPass = document.getElementById("authLoginPass");
    const authLoginBtn = document.getElementById("authLoginBtn");

    // 5. Sanitización Anti-XSS
    function sanitizar(str) {
        if (!str) return "";
        return str.replace(/<[^>]*>/g, '').trim();
    }

    // 6. Listener del botón de perfil en la cabecera
    if (btnPerfilUsuario) {
        btnPerfilUsuario.addEventListener("click", () => {
            const token = localStorage.getItem("token");
            if (token) {
                // Logueado: abrir perfil
                profileUserVal.textContent = localStorage.getItem("username") || "Cliente";
                profileEmailVal.textContent = localStorage.getItem("userEmail") || "correo@ejemplo.com";
                modalProfile.classList.add("activo");
            } else {
                // No logueado: abrir logins
                modalAuth.classList.add("activo");
            }
        });
    }

    // Cerrar modales
    if (btnCerrarAuth) btnCerrarAuth.addEventListener("click", () => modalAuth.classList.remove("activo"));
    if (btnCerrarProfile) btnCerrarProfile.addEventListener("click", () => modalProfile.classList.remove("activo"));
    if (btnCerrarCP) btnCerrarCP.addEventListener("click", () => modalCP.classList.remove("activo"));

    // Intercambio de pestañas Login / Register
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

    // 7. Fuerza de contraseña en el registro de la tienda
    if (inputRegPass) {
        inputRegPass.addEventListener("input", () => {
            const val = inputRegPass.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
            if (/\d/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            let color = "#f44336";
            let text = "La contraseña debe tener min. 8 letras/números";
            let width = "0%";

            if (val.length === 0) {
                width = "0%";
                text = "La contraseña debe tener min. 8 letras/números";
            } else if (score <= 1) {
                width = "25%";
                color = "#f44336";
                text = "Débil. Agrega mayúsculas, números y símbolos.";
            } else if (score === 2) {
                width = "50%";
                color = "#ff9800";
                text = "Media. Agrega mayúsculas y símbolos especiales.";
            } else if (score === 3) {
                width = "75%";
                color = "#2196f3";
                text = "Aceptable. Nivel de seguridad recomendado.";
            } else if (score === 4) {
                width = "100%";
                color = "#4caf50";
                text = "Fuerte. Nivel de seguridad óptimo.";
            }

            authPswBar.style.width = width;
            authPswBar.style.backgroundColor = color;
            authPswText.textContent = text;
            authPswText.style.color = color;
        });
    }

    // 8. Fuerza bruta: Rate Limiting en Login
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
                authLoginBtn.textContent = "Inicia Sesion";

                const alertEl = document.getElementById("lockoutAlertStore");
                if (alertEl) alertEl.remove();
            }
        }, 1000);
    }

    // 9. EVENTO DE INICIAR SESIÓN
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (loginDeshabilitado) return;

            const email = sanitizar(inputLoginEmail.value);
            const password = sanitizar(inputLoginPass.value);

            try {
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("userEmail", data.user.email);
                    localStorage.setItem("username", data.user.username);
                    localStorage.setItem("token", data.token);

                    alert(`¡Bienvenido de vuelta, ${data.user.username}!`);
                    formLogin.reset();
                    modalAuth.classList.remove("activo");

                    // Si el checkout de carrito.js está activo, rellenar el email de facturación
                    const checkoutEmail = document.getElementById("checkoutEmail");
                    if (checkoutEmail) {
                        checkoutEmail.value = data.user.email;
                        checkoutEmail.readOnly = true;
                    }
                } else {
                    loginIntentos++;
                    if (loginIntentos >= 3) {
                        bloquearLoginTIenda();
                    } else {
                        alert(`Credenciales incorrectas. Intento ${loginIntentos} de 3 antes de bloquear.`);
                    }
                }
            } catch (err) {
                console.error(err);
                alert("Error de red o conexión al backend. Asegúrate de encender el servidor.");
            }
        });
    }

    // 10. EVENTO DE REGISTRO
    if (formRegister) {
        formRegister.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = sanitizar(document.getElementById("authRegUser").value);
            const email = sanitizar(document.getElementById("authRegEmail").value);
            const password = sanitizar(inputRegPass.value);

            // Validar fuerza
            let score = 0;
            if (password.length >= 8) score++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
            if (/\d/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;

            if (score < 2) {
                alert("Por seguridad, la contraseña debe ser al menos Media o Fuerte.");
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("¡Registro exitoso! Por favor inicia sesión ahora.");
                    formRegister.reset();
                    authPswBar.style.width = "0%";
                    authPswText.textContent = "La contraseña debe tener min. 8 letras/números";
                    authPswText.style.color = "#666";

                    // Switch to login tab
                    tabLogin.click();
                } else {
                    alert("Error: " + (data.error || "No se pudo registrar."));
                }
            } catch (err) {
                console.error(err);
                alert("Error de conexión al backend. Asegúrate de que el servidor esté activo.");
            }
        });
    }

    // 11. EVENTOS DE ACCIONES DEL PERFIL
    // Cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("username");

            const checkoutEmail = document.getElementById("checkoutEmail");
            if (checkoutEmail) {
                checkoutEmail.value = "";
                checkoutEmail.readOnly = false;
            }

            alert("Has cerrado sesión correctamente.");
            modalProfile.classList.remove("activo");
        });
    }

    // Cambiar de Cuenta
    if (btnSwitchAccount) {
        btnSwitchAccount.addEventListener("click", () => {
            // Limpia sesión anterior
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("username");

            const checkoutEmail = document.getElementById("checkoutEmail");
            if (checkoutEmail) {
                checkoutEmail.value = "";
                checkoutEmail.readOnly = false;
            }

            modalProfile.classList.remove("activo");
            modalAuth.classList.add("activo");
        });
    }

    // Mostrar Cambio de Contraseña
    if (btnShowChangePass) {
        btnShowChangePass.addEventListener("click", () => {
            modalProfile.classList.remove("activo");
            modalCP.classList.add("activo");
        });
    }

    // EVENTO DE CAMBIO DE CONTRASEÑA (Fetch a backend)
    if (formChangePass) {
        formChangePass.addEventListener("submit", async (e) => {
            e.preventDefault();

            const oldPassword = sanitizar(document.getElementById("authCpOldPass").value);
            const newPassword = sanitizar(document.getElementById("authCpNewPass").value);
            const confPassword = sanitizar(document.getElementById("authCpConfPass").value);
            const email = localStorage.getItem("userEmail");

            if (newPassword !== confPassword) {
                alert("La nueva contraseña y la confirmación no coinciden.");
                return;
            }

            if (newPassword.length < 8) {
                alert("La nueva contraseña debe tener mínimo 8 caracteres.");
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, oldPassword, newPassword })
                });

                const data = await response.json();
                if (response.ok) {
                    alert("¡Contraseña cambiada exitosamente!");
                    formChangePass.reset();
                    modalCP.classList.remove("activo");
                    modalProfile.classList.add("activo");
                } else {
                    alert("Error: " + (data.error || "No se pudo actualizar la contraseña."));
                }
            } catch (err) {
                console.error(err);
                alert("Error de red al actualizar la contraseña.");
            }
        });
    }

    // Cerrar modales si se presiona fuera
    window.addEventListener("click", (e) => {
        if (e.target === modalAuth) modalAuth.classList.remove("activo");
        if (e.target === modalProfile) modalProfile.classList.remove("activo");
        if (e.target === modalCP) modalCP.classList.remove("activo");
    });
});