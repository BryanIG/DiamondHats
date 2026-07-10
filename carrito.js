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


abrirCarrito.addEventListener("click",()=>{

    carritoPanel.classList.add("activo");

});


cerrarCarrito.addEventListener("click",()=>{

    carritoPanel.classList.remove("activo");

});




// ============================
// AGREGAR PRODUCTO
// ============================


function agregarCarrito(producto){


    const existe = carrito.find(
        item => item.nombre === producto.nombre
    );


    if(existe){

        existe.cantidad++;

    }else{

        carrito.push({

            ...producto,

            cantidad:1

        });

    }


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// MOSTRAR CARRITO
// ============================


function actualizarCarrito(){


    productosCarrito.innerHTML="";


    let total = 0;



    carrito.forEach(producto=>{


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
        (acc,item)=>acc + item.cantidad,
        0
    );


    totalElemento.textContent = total;


}






// ============================
// AUMENTAR
// ============================


function aumentar(nombre){


    const producto = carrito.find(
        item=>item.nombre===nombre
    );


    producto.cantidad++;


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// DISMINUIR
// ============================


function disminuir(nombre){


    const producto = carrito.find(
        item=>item.nombre===nombre
    );


    if(producto.cantidad > 1){

        producto.cantidad--;

    }else{

        eliminarProducto(nombre);

        return;

    }


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// ELIMINAR
// ============================


function eliminarProducto(nombre){


    carrito = carrito.filter(
        item=>item.nombre!==nombre
    );


    guardarCarrito();

    actualizarCarrito();


}





// ============================
// GUARDAR CARRITO
// ============================


function guardarCarrito(){


    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


}



// Cargar carrito al entrar

actualizarCarrito();