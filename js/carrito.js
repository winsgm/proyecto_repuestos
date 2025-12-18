// carrito.js - VERSIÓN COMPLETA ACTUALIZADA CON SISTEMA DE COMPRA PENDIENTE
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== CARRITO.JS CARGADO ===");

    // ===================================================================
    // ELEMENTOS DEL DOM
    // ===================================================================
    const cartItemsContainer = document.getElementById('carritoItems');
    const cartTotalElement = document.getElementById('totalCompra');
    const cartSubtotalElement = document.getElementById('subtotal');
    const cartEmptyMessage = document.getElementById('carritoVacio');
    const cartContent = document.getElementById('carritoContenido');
    const clearCartButton = document.getElementById('btnVaciarCarrito');
    const checkoutButton = document.getElementById('btnPagar');
    const cartCountElement = document.getElementById('cartCount');
    const totalItemsElement = document.getElementById('totalItems');

    // Elementos del modal
    const modalPago = document.getElementById('mModalPago');
    const modalProductos = document.getElementById('mModalProductos');
    const modalSubtotal = document.getElementById('mModalSubtotal');
    const modalTotal = document.getElementById('mModalTotal');
    const modalNoLogueado = document.getElementById('mModalNoLogueado');
    const modalLogueado = document.getElementById('mModalLogueado');
    const btnCancelarCompra = document.getElementById('mBtnCancelarCompra');
    const btnCancelarCompra2 = document.getElementById('mBtnCancelarCompra2');
    const btnIrLogin = document.getElementById('mBtnIrLogin');
    const btnConfirmarCompra = document.getElementById('mBtnConfirmarCompra');
    const ofertaRegistro = document.getElementById('mOfertaRegistro');
    const infoExtra = document.getElementById('mInfoExtra');
    const filaDescuento = document.getElementById('mFilaDescuento');
    const modalDescuento = document.getElementById('mModalDescuento');

    // Elementos del resumen principal
    const filaDescuentoResumen = document.getElementById('filaDescuentoResumen');
    const descuentoElement = document.getElementById('descuento');

    // ===================================================================
    // CONSTANTES Y VARIABLES
    // ===================================================================
    const DESCUENTO_POR_CANTIDAD = 0.10; // 10% de descuento por más de 3 productos
    let isPurchasePending = false;

    // ===================================================================
    // FUNCIONES PRINCIPALES
    // ===================================================================

    // Función para verificar si hay que abrir el modal automáticamente
    function checkAutoOpenModal() {
        const urlParams = new URLSearchParams(window.location.search);
        const openModal = urlParams.get('openModal');

        if (openModal === 'true') {
            console.log("Abriendo modal automáticamente por parámetro URL");

            // Verificar si hay usuario logueado
            const user = getUser();

            if (user && user.loggedIn) {
                // Usuario logueado, abrir modal después de un delay
                setTimeout(() => {
                    mostrarModalPago();
                    // Limpiar parámetro de URL sin recargar
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 800);
            } else {
                // Usuario no logueado, redirigir a login
                console.log("Usuario no logueado, redirigiendo a login...");
                savePendingPurchase();
                setTimeout(() => {
                    window.location.href = 'sesion.html?redirect=carrito.html&pendingPurchase=true';
                }, 500);
            }
        }

        // Verificar si hay compra pendiente en localStorage
        checkPendingPurchase();
    }

    // Verificar compra pendiente almacenada
    function checkPendingPurchase() {
        const pendingPurchase = localStorage.getItem('pendingPurchase');
        if (pendingPurchase) {
            console.log("Compra pendiente encontrada en localStorage");
            isPurchasePending = true;

            // Si el usuario está logueado, sugerir continuar
            const user = getUser();
            if (user && user.loggedIn) {
                setTimeout(() => {
                    if (confirm('Tienes una compra pendiente. ¿Quieres continuar con el pago?')) {
                        mostrarModalPago();
                    }
                }, 1000);
            }
        }
    }

    // Guardar compra pendiente
    function savePendingPurchase() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length > 0) {
            const purchaseData = {
                carrito: carrito,
                subtotal: calcularSubtotal(),
                totalProductos: carrito.reduce((total, item) => total + item.cantidad, 0),
                timestamp: new Date().toISOString(),
                fromCarritoPage: true
            };

            localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
            console.log("Compra pendiente guardada:", purchaseData);
            isPurchasePending = true;
            return true;
        }
        return false;
    }

    // Limpiar compra pendiente
    function clearPendingPurchase() {
        localStorage.removeItem('pendingPurchase');
        isPurchasePending = false;
        console.log("Compra pendiente eliminada");
    }

    // Obtener usuario actual
    function getUser() {
        try {
            // Intentar con sessionManager primero
            if (window.sessionManager && window.sessionManager.getUser()) {
                return window.sessionManager.getUser();
            }

            // Fallback a localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.loggedIn) {
                return user;
            }

            // Intentar otros formatos
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (currentUser && isLoggedIn) {
                return {
                    name: currentUser.name || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    loggedIn: true
                };
            }

            return null;
        } catch (error) {
            console.error("Error obteniendo usuario:", error);
            return null;
        }
    }

    // Mostrar productos del carrito
    function mostrarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        if (carrito.length === 0) {
            // Mostrar mensaje de carrito vacío
            if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            if (cartSubtotalElement) cartSubtotalElement.textContent = '$0.00';
            if (totalItemsElement) totalItemsElement.textContent = '0 productos';
            if (filaDescuentoResumen) filaDescuentoResumen.style.display = 'none';
            return;
        }

        // Ocultar mensaje de carrito vacío
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';

        // Limpiar contenedor
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';

            let subtotal = 0;
            let cantidadTotal = 0;

            carrito.forEach((producto, index) => {
                const productoSubtotal = producto.precio * producto.cantidad;
                subtotal += productoSubtotal;
                cantidadTotal += producto.cantidad;

                const itemElement = document.createElement('div');
                itemElement.className = 'carrito-item';
                itemElement.innerHTML = `
                    <div class="carrito-item-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Producto'">
                    </div>
                    <div class="carrito-item-info">
                        <h3 class="carrito-item-nombre">${producto.nombre}</h3>
                        <p class="carrito-item-precio">$${producto.precio.toFixed(2)}</p>
                        <div class="carrito-item-cantidad">
                            <button class="cantidad-btn minus" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="cantidad-value">${producto.cantidad}</span>
                            <button class="cantidad-btn plus" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="carrito-item-subtotal">
                        $${productoSubtotal.toFixed(2)}
                    </div>
                    <button class="carrito-item-eliminar" data-index="${index}" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                cartItemsContainer.appendChild(itemElement);
            });

            // Calcular descuento
            let descuento = 0;
            if (cantidadTotal > 3) {
                descuento = subtotal * DESCUENTO_POR_CANTIDAD;
            }

            // Calcular total (subtotal - descuento) - ENVÍO GRATIS
            const total = subtotal - descuento;

            // Actualizar resumen principal
            if (cartSubtotalElement) cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
            if (totalItemsElement) totalItemsElement.textContent = `${cantidadTotal} ${cantidadTotal === 1 ? 'producto' : 'productos'}`;

            // Mostrar/ocultar fila de descuento en resumen principal
            if (filaDescuentoResumen) {
                if (cantidadTotal > 3) {
                    filaDescuentoResumen.style.display = 'flex';
                    if (descuentoElement) {
                        descuentoElement.textContent = `-$${descuento.toFixed(2)}`;
                    }
                } else {
                    filaDescuentoResumen.style.display = 'none';
                }
            }

            // Configurar eventos para los botones
            configurarEventosCarrito();
        }
    }

    // Configurar eventos de los elementos del carrito
    function configurarEventosCarrito() {
        // Botones de cantidad (-)
        document.querySelectorAll('.cantidad-btn.minus').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad -= 1;
                } else {
                    carrito.splice(index, 1);
                }

                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Carrito actualizado');
            });
        });

        // Botones de cantidad (+)
        document.querySelectorAll('.cantidad-btn.plus').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                carrito[index].cantidad += 1;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Carrito actualizado');
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.carrito-item-eliminar').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

                carrito.splice(index, 1);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                mostrarNotificacion('Producto eliminado');

                // Si el carrito queda vacío, limpiar compra pendiente
                if (carrito.length === 0) {
                    clearPendingPurchase();
                }
            });
        });
    }

    // Función para mostrar el modal de pago
    function mostrarModalPago() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const user = getUser();

        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío');
            return;
        }

        // Calcular valores
        const subtotal = calcularSubtotal();
        const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);

        // Calcular descuento
        let descuento = 0;
        if (totalProductos > 3) {
            descuento = subtotal * DESCUENTO_POR_CANTIDAD;
        }

        // Calcular total FINAL (subtotal - descuento) - ENVÍO GRATIS
        const total = subtotal - descuento;

        // Actualizar valores en el modal en el ORDEN CORRECTO
        if (modalProductos) modalProductos.textContent = totalProductos;
        if (modalSubtotal) modalSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (modalTotal) modalTotal.textContent = `$${total.toFixed(2)}`;

        // Mostrar/ocultar fila de descuento en modal
        if (filaDescuento) {
            if (totalProductos > 3) {
                filaDescuento.classList.add('visible');
                if (modalDescuento) {
                    modalDescuento.textContent = `-$${descuento.toFixed(2)}`;
                    modalDescuento.style.color = '#27ae60';
                }
            } else {
                filaDescuento.classList.remove('visible');
            }
        }

        // Actualizar oferta especial
        if (ofertaRegistro) {
            if (totalProductos > 3) {
                // Califica para el descuento del 10%
                ofertaRegistro.innerHTML = `
                    <div class="m-oferta-icono">🎁</div>
                    <h3 class="m-oferta-titulo">¡Descuento Aplicado!</h3>
                    <p class="m-oferta-descripcion">Por llevar <strong>${totalProductos} productos</strong>, obtienes un <strong>10% de descuento</strong>.</p>
                    <div class="m-info-extra">
                        <i class="fas fa-check-circle"></i> Descuento aplicado: <strong>$${descuento.toFixed(2)}</strong>
                    </div>
                `;
            } else {
                // NO califica para el descuento
                ofertaRegistro.innerHTML = `
                    <div class="m-oferta-icono">🎁</div>
                    <h3 class="m-oferta-titulo">¡Obtén un 10% de descuento!</h3>
                    <p class="m-oferta-descripcion">Lleva <strong>más de 3 productos</strong> y obtén un <strong>10% de descuento</strong> en tu compra.</p>
                    <div class="m-info-extra">
                        <i class="fas fa-info-circle"></i> Actualmente tienes <strong>${totalProductos} productos</strong>. ¡Agrega ${4 - totalProductos} más para obtener el descuento!
                    </div>
                `;
            }
        }

        // Mostrar info extra
        if (infoExtra) {
            infoExtra.innerHTML = totalProductos > 3
                ? `<i class="fas fa-percentage"></i> <strong>10% de descuento</strong> por comprar más de 3 productos`
                : `<i class="fas fa-info-circle"></i> Compra más de 3 productos para obtener el 10% de descuento`;
        }

        // Mostrar sección correcta según si está logueado
        if (user && user.loggedIn) {
            if (modalNoLogueado) modalNoLogueado.classList.remove('active');
            if (modalLogueado) modalLogueado.classList.add('active');
        } else {
            // Usuario no logueado - GUARDAR COMPRA PENDIENTE
            savePendingPurchase();

            if (modalNoLogueado) modalNoLogueado.classList.add('active');
            if (modalLogueado) modalLogueado.classList.remove('active');
        }

        // Mostrar modal
        if (modalPago) {
            modalPago.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Función para calcular subtotal
    function calcularSubtotal() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let subtotal = 0;
        carrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });
        return subtotal;
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, type = 'info') {
        // Eliminar notificaciones anteriores
        const notificacionesAnteriores = document.querySelectorAll('.m-notificacion-carrito');
        notificacionesAnteriores.forEach(notif => notif.remove());

        const notificacion = document.createElement('div');
        notificacion.className = 'm-notificacion-carrito';
        notificacion.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${mensaje}</span>
        `;

        document.body.appendChild(notificacion);

        // Mostrar con animación
        setTimeout(() => {
            notificacion.classList.add('show');
        }, 10);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }, 3000);
    }

    // Actualizar contador del carrito
    function actualizarContador() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        let totalProductos = 0;
        carrito.forEach(item => {
            totalProductos += item.cantidad || 1;
        });

        if (cartCountElement) {
            cartCountElement.textContent = totalProductos;
        }
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================

    // Botón para vaciar carrito
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                localStorage.setItem('carrito', JSON.stringify([]));
                window.dispatchEvent(new Event('carritoActualizado'));
                mostrarCarrito();
                clearPendingPurchase();
                mostrarNotificacion('Carrito vaciado');
            }
        });
    }

    // Botón para proceder al pago (abre el modal)
    if (checkoutButton) {
        checkoutButton.addEventListener('click', mostrarModalPago);
    }

    // Cancelar compra
    if (btnCancelarCompra) {
        btnCancelarCompra.addEventListener('click', function () {
            if (modalPago) modalPago.classList.remove('active');
            document.body.style.overflow = 'auto';
            mostrarNotificacion('Compra cancelada');
        });
    }

    if (btnCancelarCompra2) {
        btnCancelarCompra2.addEventListener('click', function () {
            if (modalPago) modalPago.classList.remove('active');
            document.body.style.overflow = 'auto';
            mostrarNotificacion('Compra cancelada');
        });
    }

    // Ir a login (ACTUALIZADO PARA GUARDAR COMPRA PENDIENTE)
    if (btnIrLogin) {
        btnIrLogin.addEventListener('click', function () {
            // Guardar compra pendiente antes de redirigir
            savePendingPurchase();

            if (modalPago) modalPago.classList.remove('active');
            document.body.style.overflow = 'auto';

            // Redirigir a login con parámetros
            window.location.href = 'sesion.html?redirect=carrito.html&pendingPurchase=true';
        });
    }

    // Confirmar compra
    if (btnConfirmarCompra) {
        btnConfirmarCompra.addEventListener('click', function () {
            const user = getUser();
            if (!user) {
                mostrarNotificacion('Debes iniciar sesión para finalizar la compra');
                return;
            }

            // Obtener valores actuales del carrito para el resumen final
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const subtotal = calcularSubtotal();
            const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);

            // Recalcular descuento
            let descuento = 0;
            if (totalProductos > 3) {
                descuento = subtotal * DESCUENTO_POR_CANTIDAD;
            }

            const totalFinal = subtotal - descuento;

            // Mostrar resumen final antes de confirmar
            const resumenCompra = `
                📋 RESUMEN DE COMPRA:
                -------------------------
                • Total de productos: ${totalProductos}
                ${totalProductos > 3 ? `• Descuento (10%): -$${descuento.toFixed(2)}` : ''}
                • Subtotal productos: $${subtotal.toFixed(2)}
                • Envío: GRATIS 🚚
                • TOTAL A PAGAR: $${totalFinal.toFixed(2)}
                -------------------------
                
                ¿Confirmar esta compra?
            `;

            if (confirm(resumenCompra)) {
                // Simulación de proceso de pago
                mostrarNotificacion('Procesando pago...');

                // Simular procesamiento
                setTimeout(() => {
                    if (modalPago) modalPago.classList.remove('active');
                    document.body.style.overflow = 'auto';

                    // LIMPIAR COMPRA PENDIENTE
                    clearPendingPurchase();

                    // Mostrar confirmación
                    mostrarNotificacion('¡Compra realizada con éxito!');

                    // Generar número de pedido
                    const numeroPedido = 'PED-' + Date.now().toString().slice(-8);

                    // Vaciar carrito después de la compra
                    setTimeout(() => {
                        localStorage.setItem('carrito', JSON.stringify([]));
                        window.dispatchEvent(new Event('carritoActualizado'));
                        mostrarCarrito();
                    }, 1000);

                    // Mostrar mensaje de agradecimiento con detalles
                    setTimeout(() => {
                        alert(`✅ ¡Gracias por tu compra ${user.name || ''}!\n\n📦 Número de pedido: ${numeroPedido}\n📋 Resumen:\n   - Productos: ${totalProductos}\n   ${totalProductos > 3 ? `   - Descuento 10%: -$${descuento.toFixed(2)}\n` : ''}   - Subtotal: $${subtotal.toFixed(2)}\n   - Envío: GRATIS 🚚\n   - TOTAL: $${totalFinal.toFixed(2)}\n\n📧 Recibirás un correo con los detalles de tu compra.\n\n¡Vuelve pronto!`);
                    }, 1500);

                }, 2000);
            }
        });
    }

    // Cerrar modal haciendo clic fuera
    if (modalPago) {
        modalPago.addEventListener('click', function (e) {
            if (e.target === modalPago) {
                modalPago.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ===================================================================
    // FUNCIONES GLOBALES PARA EL HTML
    // ===================================================================

    // Función para guardar compra pendiente y redirigir a login (se llama desde HTML)
    // En carrito.js, actualiza SOLO estas funciones:

    // Función para guardar compra pendiente y redirigir a login (MODIFICADA)
    window.savePendingPurchaseAndRedirect = function () {
        // Guardar compra pendiente
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length > 0) {
            const purchaseData = {
                carrito: carrito,
                subtotal: calcularSubtotal(),
                totalProductos: carrito.reduce((total, item) => total + item.cantidad, 0),
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
            console.log("Compra pendiente guardada antes de login");
        }

        // Redirigir a login CON PARÁMETRO ESPECIAL
        window.location.href = 'sesion.html?redirect=carrito.html&fromCarritoModal=true&pendingPurchase=true';
    };

    // Función para guardar compra pendiente y redirigir a registro (MODIFICADA)
    window.savePendingPurchaseAndRedirectToRegister = function () {
        // Guardar compra pendiente
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length > 0) {
            const purchaseData = {
                carrito: carrito,
                subtotal: calcularSubtotal(),
                totalProductos: carrito.reduce((total, item) => total + item.cantidad, 0),
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
            console.log("Compra pendiente guardada antes de registro");
        }

        // Redirigir a registro CON PARÁMETRO ESPECIAL
        window.location.href = 'registro.html?redirect=carrito.html&fromCarritoModal=true&pendingPurchase=true';
    };

    // ===================================================================
    // INICIALIZACIÓN
    // ===================================================================

    // Mostrar carrito inicial
    mostrarCarrito();

    // Verificar si hay que abrir modal automáticamente
    checkAutoOpenModal();

    // Escuchar actualizaciones del carrito
    window.addEventListener('carritoActualizado', mostrarCarrito);
    window.addEventListener('carritoActualizado', actualizarContador);
    window.addEventListener('storage', function (e) {
        if (e.key === 'carrito') {
            mostrarCarrito();
            actualizarContador();
        }
    });

    // Actualizar contador inicial
    actualizarContador();

    console.log("=== CARRITO.JS INICIALIZADO CORRECTAMENTE ===");
});