//DECLARACIÓN DE VARIABLES
let carritoTotal = 0;
let detalle = "";
let catalogo = document.getElementById("catalogo");
let productos = [];
let btnMarcas = document.getElementById("btnradio1");
let btnCategorias = document.getElementById("btnradio2");
let filtro = document.getElementById("filtro");
let borrarFiltro = document.getElementById("borrarFiltro");
let marcas = [];
let categorias = [];
let carro = document.getElementById("carrito");
let carrito = JSON.parse(localStorage.getItem("carrito"));
localStorage.setItem("filtro", JSON.stringify([]));

//ESTADO AL RECARGAR LA PÁGINA
if(carrito !== null && carrito.length !== 0){
    renderizarCarrito(carrito);
    eliminarProducto(carrito);
} else {
    carro.innerHTML = `
    <p class="carroVacio">EL CARRITO ESTÁ VACÍO</p>
    <p class="total">TOTAL: $0</p>`;
}

//FUNCIÓN PRECIO*PRODUCTO
function sumaProducto(precio, cantidad){
    return (precio * cantidad);
}

//RESETEAR CATÁLOGO
function resetearCatalogo(){
    localStorage.setItem("filtro", JSON.stringify([]));
    catalogo.innerHTML = "";
    productos.forEach(item => {
        renderizarCard(item);
    });
}

//RENDERIZAR LISTADOS FILTRO
function renderizarListado(criterio, array){
    filtro.innerHTML = "";
    array.forEach(obj => {
        let id = array.indexOf(obj) + 1;
        let listado = document.createElement("label");
        listado.innerHTML = `
        <input type="checkbox" class="mb-2" id="${criterio}${id}" value="${obj}" /> ${obj}
        `;
        filtro.append(listado);
    });
    filtrar(criterio, array);
}

//FUNCIÓN PARA ELIMINAR TILDES PARA EL BUSCADOR (sacada de internet)
function sinDiacriticos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
}

//FUNCIÓN PARA FILTRAR MARCAS/CATEGORIAS
function filtrar(criterio, array){
    for(let id = 1; id <= array.length; id++){
        let checkbox = document.getElementById(criterio+id);
        checkbox.addEventListener("change", () => {
            let productosFiltro = JSON.parse(localStorage.getItem("filtro"));
            let filtrado = productos.filter(item => item[criterio] === checkbox.value);

            if(productosFiltro.length === 0){
                productosFiltro = checkbox.checked && filtrado;
            } else {
                for(let i = 0; i < filtrado.length; i++){
                    if(checkbox.checked){
                        productosFiltro.push(filtrado[i]);
                    } else {
                        productosFiltro = productosFiltro.filter(item => item[criterio] != checkbox.value);
                    }                              
                }
            }

            localStorage.setItem("filtro", JSON.stringify(productosFiltro));

            if(productosFiltro.length === 0){
                catalogo.innerHTML = "";
                productos.forEach(item => {
                    renderizarCard(item);
                });
            } else {
                catalogo.innerHTML = "";
                productosFiltro.forEach(item => {
                    renderizarCard(item);
                });
            }
        });
    }
}

//FUNCIÓN PARA RENDERIZAR CARD DE PRODUCTO
let renderizarCard = (objeto) => {
    let card = document.createElement("div");
    let valor = 0;
    if(carrito !== null){
        let encontrado = carrito.find(obj => obj.id === objeto.id);
        valor = encontrado && encontrado.cantidad;
    } 
    
    card.innerHTML = `
        <img src="${objeto.imagen}" class="card-img-top p-3" alt="...">
        <div class="card-body cardBody">
            <h6 class="card-titl text-center">${objeto.nombre}</h6>
            <div class="card-text precio text-center">$${objeto.precio}</div>
            <div class="d-flex justify-content-center align-items-center gap-2">
                <button class="inputSpinner" id="decSpinner${objeto.id}">-</button>
                <input class="p-2 w-50 rounded-3 text-center" type="number" id="cant${objeto.id}" min="0" value="${valor}" />
                <button class="inputSpinner" id="incSpinner${objeto.id}">+</button>
            </div>
            <button id="agregar${objeto.id}" class="agregar">Agregar</button>
        </div>
    `;
    card.className = "card";
    catalogo.append(card);

    let input = document.getElementById("cant"+objeto.id);
    let inputDown = document.getElementById("decSpinner"+objeto.id);
    inputDown.addEventListener("click", () => {
        if(input.value > 1){
            input.value--;
        } else {
            input.value = 0;
        }
    });

    let inputUp = document.getElementById("incSpinner"+objeto.id);
    inputUp.addEventListener("click", () => {
        input.value++;
    });


    let agregar = document.getElementById("agregar"+objeto.id);
    agregar.addEventListener("click", () => {
        carrito = carrito || [];
                
        let encontrado = carrito.find(prod => prod.id === objeto.id);
        if(encontrado != undefined){
            encontrado.cantidad = input.value;
            if(encontrado.cantidad == 0){
                Swal.fire({
                    text: 'Desea eliminar el producto del carrito?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí!',
                    cancelButtonText: 'Cancelar'
                    }).then((result) => {
                    if (result.isConfirmed) {
                        carrito = carrito.filter(item => item.cantidad != 0); 
                        localStorage.setItem("carrito", JSON.stringify(carrito));

                        Swal.fire({
                        text: 'Producto eliminado con éxito',
                        icon: 'success'
                    })
                    }
                    });
            } else {
                encontrado.subt = sumaProducto(encontrado.precio, encontrado.cantidad);
                localStorage.setItem("carrito", JSON.stringify(carrito));

                Toastify({
                    text: `Se ha agregado
                    ${encontrado.cantidad} ${encontrado.nombre} $${encontrado.subt}            
                    `,
                    gravity: "bottom",
                    duration: 2000,
                    style: {
                        color: "#f8f5ef",
                        background: "#eb8e37",
                    },
                }).showToast();
            }
                
        } else if(input.value != 0) {
            objeto.cantidad = input.value;
                carrito.push({
                    ...objeto,
                    subt: sumaProducto(objeto.precio, objeto.cantidad)
                });            
                
            localStorage.setItem("carrito", JSON.stringify(carrito));
        
            let index = carrito.length - 1;
        
            Toastify({
                text: `Se ha agregado
                ${objeto.cantidad} ${objeto.nombre} $${carrito[index].subt}            
                `,
                gravity: "bottom",
                duration: 2000,
                style: {
                    color: "#f8f5ef",
                    background: "#eb8e37",
                },
            }).showToast();
        }
        
        renderizarCarrito(carrito);
        eliminarProducto(carrito);
    });   
};

//FUNCIÓN PARA RENDERIZAR CARRITO
function renderizarCarrito(carrito){
    carro.innerHTML = "";
    detalle = "";
    carritoTotal = 0;
    carrito.forEach(item => {
        let {id, nombre, cantidad, subt} = item;
        if(cantidad != 0){
            carritoTotal += subt;
            detalle += `
            <div class="detalleCarrito">
            <p>${cantidad}</p>
            <p>${nombre}</p>
            <strong>$${subt}</strong>
            <button class="trashCart" id="trash${id}"><i class="fa-solid fa-trash"></i></button>
            </div>`;
            carro.innerHTML = `
            ${detalle}
            `;
        }        
    });
    
    let total = document.createElement("p");
    total.innerHTML = `
    TOTAL: $${carritoTotal}`;
    total.className = "total";
    carro.append(total);
}

//FUNCIÓN PARA ELIMINAR ELEMENTO DEL CARRITO
function eliminarProducto(carrito){
    carrito.forEach(item => {
        let trash = document.getElementById("trash"+item.id);
        trash.addEventListener("click", () => {
            Swal.fire({
                text: 'Desea eliminar el producto del carrito?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí!',
                cancelButtonText: 'Cancelar'
                }).then((result) => {
                if (result.isConfirmed) {
                    let inputCard = document.getElementById("cant"+item.id);
                    inputCard.value = 0;
                    item.cantidad = 0;
                    carrito = carrito.filter(item => item.cantidad != 0); 
                    localStorage.setItem("carrito", JSON.stringify(carrito));
                    renderizarCarrito(carrito);
                    location.reload()
                    //refresco la página porque fue la única manera que pude hacer para que funcione siempre, si no funcionaba una sola vez y nunca más                   
                }
            });
        });
    });
}

//CARGA DE PRODUCTOS
fetch("json/productos.json")
.then(response => response.json())
.then(data => {
    data.forEach(item => productos.push(item))

    //RENDERIZANDO TODOS LOS PRODUCTOS
    productos.forEach(item => {
        let encontrarMarca = marcas.find(obj => obj === item.marca);
        if(encontrarMarca == undefined){
            marcas.push(item.marca);
        }

        let encontrarCategoria = categorias.find(obj => obj === item.categoria);
        if(encontrarCategoria == undefined){
            categorias.push(item.categoria);
        }

        renderizarCard(item);
    });    

    //CREACIÓN DEL LISTADO DE MARCAS
    renderizarListado("marca", marcas);

    //BOTÓN PARA CAMBIAR EL FILTRADO A CATEGORÍAS
    btnCategorias.addEventListener("change", () => {
        if(btnCategorias.checked){
            resetearCatalogo();
            renderizarListado("categoria", categorias);
        }
    });

    //BOTÓN PARA CAMBIAR EL FILTRADO A MARCAS
    btnMarcas.addEventListener("change", () => {
        if(btnMarcas.checked){
            resetearCatalogo();
            renderizarListado("marca", marcas);
        }
    });
});

//BORRAR FILTROS
borrarFiltro.addEventListener("click", () => {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(item => item.checked = false);
    localStorage.setItem("filtro", JSON.stringify([]));
    resetearCatalogo();
});

//BUSCADOR
let search = document.getElementById("buscar");
let inputSearch = document.getElementById("busqueda");
inputSearch.addEventListener("input", () => {
    if(inputSearch.value === ""){
        resetearCatalogo();
    }
});
search.addEventListener("click", (e) => {
    e.preventDefault();
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(item => item.checked = false);
    localStorage.setItem("filtro", JSON.stringify([]));
    let busq = document.getElementById("busqueda");
    let query = sinDiacriticos(busq.value);
    let resultado = (query) => {
        return productos.filter(item => (sinDiacriticos(item.nombre).toLowerCase().indexOf(query.toLowerCase())) > -1);
    }
    let filtro = resultado(query);

    if(filtro.length == 0){
        catalogo.innerHTML = "No se han encontrado resultados";
    }

    catalogo.innerHTML = "";
    filtro.forEach(item => {
        renderizarCard(item);
    });
});

//VACIAR EL CARRITO
let vaciar = document.getElementById("borrar");
vaciar.addEventListener("click", () => {
    Swal.fire({
        title: '¿Seguro quiere vaciar el carrito?',
        text: "Esta acción es irreversible",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#eba32e',
        cancelButtonColor: '#939393',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí!'
      }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            localStorage.setItem("carrito", JSON.stringify(carrito));

            productos.forEach(item => {
                let input = document.getElementById("cant"+item.id);
                input.value = 0;
            });

            carro.innerHTML = `
            <p>EL CARRITO ESTÁ VACÍO</p>
            <p class="total">TOTAL: $0</p>`;

            Swal.fire({
                title: '¡Listo!',
                text: 'El carrito se vació con éxito',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });
        }
  })
});
