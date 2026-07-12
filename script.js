const checkbox = document.getElementById("checkbox");
const entrar = document.getElementById("entrar");
const mensaje = document.getElementById("mensaje");

let verificado = false;

checkbox.addEventListener("click", () => {
    checkbox.classList.toggle("active");
    verificado = !verificado;
});

entrar.addEventListener("click", () => {
    if (verificado) {
        mensaje.style.color = "green";
        mensaje.textContent = "Acceso correcto";

        setTimeout(() => {
            // Cambiado de "tienda.html" a "login.html" para redirigir al login
            window.location.href = "login.html";
        }, 1000);

    } else {
        mensaje.style.color = "red";
        mensaje.textContent = "Debes verificar que eres humano";
    }
});