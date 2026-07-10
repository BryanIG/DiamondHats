// Contenedor donde se mostrarán las tarjetas
const contenedor = document.getElementById("contenedor-productos");

// Función para crear una tarjeta
function crearProducto(nombre, descripcion, precio, imagen){

    contenedor.innerHTML += `
    
        <div class="card">

            <img src="Imagenes page/${imagen}" alt="${nombre}">

            <div class="info">

                <h2>${nombre}</h2>

                <p>${descripcion}</p>

                <div class="precio">$${precio} Mxn</div>

                <button 
                 class="comprar"
                 onclick='agregarCarrito(${JSON.stringify({
                 nombre:nombre,
                 descripcion:descripcion,
                 precio:precio,
                     imagen:imagen
                  })})'>

                   Comprar
                    
                </button>

            </div>

        </div>

    `;

}

// ==========================
// PRODUCTOS
// ==========================

crearProducto(
    "Gorra Negra",
    "Gorra clásica de estilo urbano.",
    699 ,
    "Gorra1.jpeg"
);

crearProducto(
    "Gorra Negra y Blanca",
    "Diseño moderno para cualquier ocasión.",
    599,
    "Gorra2.jpeg"
);

crearProducto(
    "Kirby Hats",
    "Edición premium Jordan.",
    899,
    "Gorra3.jpeg"
);

crearProducto(
    "Jonas Hats",
    "Gorra deportiva .",
    649,
    "Gorra4.jpeg"
);
crearProducto(
    "Colab Nintendo",
    "Gorra Yoshi.",
    579,
    "Gorra5.jpeg"
);
crearProducto(
    "Colab Nintendo",
    "Gorra Champ.",
    629,
    "Gorra6.jpeg"
);  
crearProducto(
    "Colab Vocaloid",
    "Gorra Hatsune Miku.",         
    699,
    "Gorra7.jpeg"
);
crearProducto(
    "Colab Nintendo",
    "Gorra Koopa.",                 
    699,
    "Gorra8.jpeg"
);

// ==========================
// BOTÓN VOLVER
// ==========================

document.getElementById("volver").addEventListener("click", () => {
    window.location.href = "tienda.html";
});