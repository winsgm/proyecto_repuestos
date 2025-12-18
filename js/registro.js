// registro.js - VERSIÓN COMPLETA Y FUNCIONAL
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== FORMULARIO DE REGISTRO INICIANDO ===");

    // ===================================================================
    // 1. ELEMENTOS DEL DOM
    // ===================================================================
    const registrationForm = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    // Campos del formulario
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const newsletterCheckbox = document.getElementById('newsletter');

    // Elementos de contraseña
    const showPasswordBtn = document.getElementById('showPassword');
    const showConfirmPasswordBtn = document.getElementById('showConfirmPassword');
    
    // Barras de fortaleza
    const strengthBars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4')
    ];
    const strengthText = document.getElementById('strengthText');

    // Requisitos de contraseña
    const reqLength = document.getElementById('reqLength');
    const reqUppercase = document.getElementById('reqUppercase');
    const reqLowercase = document.getElementById('reqLowercase');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');

    console.log("Elementos encontrados:", {
        formulario: !!registrationForm,
        mensajeExito: !!successMessage,
        botonSubmit: !!submitBtn
    });

    // ===================================================================
    // 2. INICIALIZACIÓN
    // ===================================================================
    
    // Ocultar mensaje de éxito al inicio
    if (successMessage) {
        successMessage.style.display = 'none';
    } else {
        console.error("ERROR: No se encontró el elemento successMessage");
    }
    
    // Enfocar el primer campo
    if (fullNameInput) {
        fullNameInput.focus();
    }

    // ===================================================================
    // 3. EVENT LISTENERS BÁSICOS
    // ===================================================================
    
    // Mostrar/ocultar contraseña
    if (showPasswordBtn && passwordInput) {
        showPasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(passwordInput, this);
        });
    }

    if (showConfirmPasswordBtn && confirmPasswordInput) {
        showConfirmPasswordBtn.addEventListener('click', function () {
            togglePasswordVisibility(confirmPasswordInput, this);
        });
    }

    // Validación en tiempo real
    if (fullNameInput) fullNameInput.addEventListener('input', validateFullName);
    if (emailInput) emailInput.addEventListener('input', validateEmail);
    if (phoneInput) phoneInput.addEventListener('input', validatePhone);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    // ENVÍO DEL FORMULARIO - ¡ESTO ES LO MÁS IMPORTANTE!
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
        console.log("✅ Event listener de submit CONFIGURADO");
    } else {
        console.error("❌ ERROR CRÍTICO: No se encontró registrationForm");
        alert("Error: No se puede cargar el formulario. Recarga la página.");
    }

    // ===================================================================
    // 4. FUNCIONES DE VALIDACIÓN
    // ===================================================================
    
    function validateFullName() {
        if (!fullNameInput) return false;
        
        const name = fullNameInput.value.trim();
        const errorElement = document.getElementById('fullNameError');

        if (name.length < 2) {
            showError(errorElement, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            showError(errorElement, 'El nombre solo puede contener letras y espacios');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validateEmail() {
        if (!emailInput) return false;
        
        const email = emailInput.value.trim();
        const errorElement = document.getElementById('emailError');

        if (!email) {
            showError(errorElement, 'El correo electrónico es requerido');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(errorElement, 'Ingresa un correo electrónico válido');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validatePhone() {
        if (!phoneInput) return false;
        
        const phone = phoneInput.value.trim();
        const errorElement = document.getElementById('phoneError');

        if (!phone) {
            showError(errorElement, 'El teléfono es requerido');
            return false;
        }

        // Expresión regular mejorada
        const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
        const cleanPhone = phone.replace(/[\s\(\)\-]/g, '');

        if (!phoneRegex.test(phone) || cleanPhone.length < 10) {
            showError(errorElement, 'Ingresa un número de teléfono válido (mínimo 10 dígitos)');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validatePassword() {
        if (!passwordInput) return false;
        
        const password = passwordInput.value;
        const errorElement = document.getElementById('passwordError');

        // Verificar requisitos
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        // Actualizar indicadores visuales
        updateRequirement(reqLength, hasLength);
        updateRequirement(reqUppercase, hasUppercase);
        updateRequirement(reqLowercase, hasLowercase);
        updateRequirement(reqNumber, hasNumber);
        updateRequirement(reqSpecial, hasSpecial);

        // Calcular fortaleza
        let strength = 0;
        if (hasLength) strength++;
        if (hasUppercase) strength++;
        if (hasLowercase) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;

        // Actualizar barras de fortaleza
        updateStrengthBars(strength);

        if (password.length === 0) {
            showError(errorElement, 'La contraseña es requerida');
            return false;
        }

        if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            showError(errorElement, 'La contraseña no cumple con todos los requisitos');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function validateConfirmPassword() {
        if (!confirmPasswordInput || !passwordInput) return false;
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const errorElement = document.getElementById('confirmPasswordError');

        if (confirmPassword.length === 0) {
            showError(errorElement, 'Confirma tu contraseña');
            return false;
        }

        if (password !== confirmPassword) {
            showError(errorElement, 'Las contraseñas no coinciden');
            return false;
        }

        hideError(errorElement);
        return true;
    }

    function updateRequirement(element, isValid) {
        if (element) {
            const icon = element.querySelector('i');
            if (icon) {
                if (isValid) {
                    element.classList.add('valid');
                    icon.style.color = '#4CAF50';
                    icon.className = 'fas fa-check-circle';
                } else {
                    element.classList.remove('valid');
                    icon.style.color = '#8888aa';
                    icon.className = 'fas fa-circle';
                }
            }
        }
    }

    function updateStrengthBars(strength) {
        if (!strengthBars[0]) return;
        
        // Resetear todas las barras
        strengthBars.forEach(bar => {
            if (bar) bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        // Colores según la fortaleza
        let color, text;
        switch (strength) {
            case 1: color = '#ff6b6b'; text = 'Muy débil'; break;
            case 2: color = '#ffa726'; text = 'Débil'; break;
            case 3: color = '#ffd54f'; text = 'Regular'; break;
            case 4: color = '#4CAF50'; text = 'Buena'; break;
            case 5: color = '#2E7D32'; text = 'Excelente'; break;
            default: color = '#8888aa'; text = 'Muy débil';
        }

        // Activar barras según fortaleza
        for (let i = 0; i < strength; i++) {
            if (strengthBars[i]) {
                strengthBars[i].style.backgroundColor = color;
            }
        }

        if (strengthText) {
            strengthText.textContent = `Seguridad: ${text}`;
            strengthText.style.color = color;
        }
    }

    function togglePasswordVisibility(input, button) {
        if (!input || !button) return;
        
        const icon = button.querySelector('i');
        if (!icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    function showError(element, message) {
        if (element) {
            element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            element.classList.add('show');
        }
    }

    function hideError(element) {
        if (element) {
            element.classList.remove('show');
            element.textContent = '';
        }
    }

    // ===================================================================
    // 5. FUNCIÓN PRINCIPAL DE REGISTRO - ¡CORREGIDA Y FUNCIONAL!
    // ===================================================================
    
    async function handleRegistration(e) {
        console.log("⏳ Iniciando proceso de registro...");
        e.preventDefault(); // ¡IMPORTANTE!

        // 1. Validar todo el formulario
        if (!validateAll()) {
            console.log("❌ Validación fallida");
            return;
        }

        console.log("✅ Validación exitosa");

        // 2. Mostrar estado de carga
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

        // 3. Pequeña pausa para feedback visual
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // 4. Crear objeto de usuario
            const user = {
                id: 'user_' + Date.now(),
                name: fullNameInput.value.trim(),
                email: emailInput.value.trim().toLowerCase(),
                phone: phoneInput.value.trim(),
                address: addressInput.value.trim(),
                password: passwordInput.value,
                createdAt: new Date().toISOString(),
                newsletter: newsletterCheckbox ? newsletterCheckbox.checked : false,
                role: 'customer',
                lastLogin: null
            };

            console.log("📝 Usuario creado:", { 
                name: user.name, 
                email: user.email,
                phone: user.phone 
            });

            // 5. VERIFICAR SI EL EMAIL YA EXISTE
            const existingUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
            const emailExists = existingUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());

            if (emailExists) {
                console.log("❌ Email ya registrado");
                
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                // Mostrar error
                showError(document.getElementById('emailError'), 'Este email ya está registrado');
                if (emailInput) emailInput.focus();
                return;
            }

            // 6. GUARDAR USUARIO EN EL SISTEMA
            console.log("💾 Guardando usuario...");
            
            // 6.1 Guardar en lista de usuarios
            existingUsers.push(user);
            localStorage.setItem('allUsers', JSON.stringify(existingUsers));
            
            // 6.2 Guardar usuario actual (formato que usa tu navbar)
            const userForNavbar = {
                name: user.name,
                email: user.email,
                loggedIn: true,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(userForNavbar));
            
            // 6.3 Para compatibilidad futura
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            
            // 6.4 Marcar como nuevo usuario
            localStorage.setItem('isNewUser', 'true');

            console.log('✅ Usuario registrado y guardado exitosamente');

            // 7. VERIFICAR PARÁMETROS DE URL PARA REDIRECCIÓN
            const urlParams = new URLSearchParams(window.location.search);
            const fromCarritoModal = urlParams.get('fromCarritoModal') === 'true';
            const hasPendingPurchase = urlParams.get('pendingPurchase') === 'true';
            const redirectTo = urlParams.get('redirect') || 'index.html';
            
            let destination = redirectTo;
            let customMessage = '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.';
            
            // 8. DECIDIR A DÓNDE REDIRIGIR
            if (fromCarritoModal || hasPendingPurchase) {
                destination = 'carrito.html?openModal=true';
                customMessage = '¡Cuenta creada! Redirigiendo a tu compra...';
                console.log("🛒 Redirigiendo al carrito (viene del modal)");
            } else {
                console.log("🏠 Redirigiendo a página principal");
            }

            // 9. MOSTRAR MENSAJE DE ÉXITO
            console.log("🎉 Mostrando mensaje de éxito...");
            showSuccessMessage(user, customMessage);

            // 10. REDIRIGIR DESPUÉS DE 2 SEGUNDOS
            setTimeout(() => {
                console.log("➡️ Redirigiendo a:", destination);
                window.location.href = destination;
            }, 2000);

        } catch (error) {
            console.error("❌ Error en el registro:", error);
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Mostrar error al usuario
            alert("Hubo un error al crear la cuenta. Por favor, intenta nuevamente.");
        }
    }

    // ===================================================================
    // 6. FUNCIONES AUXILIARES
    // ===================================================================
    
    function validateAll() {
        console.log("🔍 Validando todo el formulario...");
        
        const validations = [
            validateFullName(),
            validateEmail(),
            validatePhone(),
            validatePassword(),
            validateConfirmPassword()
        ];

        // Validar términos
        if (termsCheckbox && !termsCheckbox.checked) {
            alert('Debes aceptar los términos y condiciones para continuar');
            if (termsCheckbox) termsCheckbox.focus();
            return false;
        }

        const allValid = validations.every(v => v === true);
        console.log("✅ Todas las validaciones:", allValid ? "PASÓ" : "FALLÓ");
        
        return allValid;
    }

    function showSuccessMessage(user, customMessage = null) {
        console.log("📨 Mostrando mensaje de éxito...");
        
        // 1. Actualizar datos en el mensaje de éxito
        const registeredName = document.getElementById('registeredName');
        const registeredEmail = document.getElementById('registeredEmail');
        
        if (registeredName) {
            registeredName.textContent = user.name;
            console.log("✅ Nombre actualizado:", user.name);
        }
        
        if (registeredEmail) {
            registeredEmail.textContent = user.email;
            console.log("✅ Email actualizado:", user.email);
        }
        
        // 2. Actualizar mensaje personalizado si existe
        if (customMessage) {
            const successText = successMessage.querySelector('p');
            if (successText) {
                successText.textContent = customMessage;
            }
        }
        
        // 3. Ocultar formulario
        if (registrationForm) {
            registrationForm.style.display = 'none';
            console.log("✅ Formulario ocultado");
        }
        
        // 4. Mostrar mensaje de éxito
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.style.opacity = '0';
            
            // Animación de fade in
            setTimeout(() => {
                successMessage.style.transition = 'opacity 0.5s ease';
                successMessage.style.opacity = '1';
            }, 10);
            
            console.log("✅ Mensaje de éxito mostrado");
        } else {
            console.error("❌ ERROR: No se pudo mostrar el mensaje de éxito");
        }
        
        // 5. Restaurar botón (por si acaso)
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
        }
        
        // 6. Hacer scroll al mensaje de éxito
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 7. Disparar evento de autenticación
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        
        console.log("🎉 Proceso de registro completado con éxito!");
    }

    // ===================================================================
    // 7. FUNCIONES GLOBALES
    // ===================================================================
    
    // Función para resetear formulario (se llama desde el HTML)
    window.resetForm = function () {
        console.log("🔄 Reseteando formulario...");

        // 1. Mostrar formulario y ocultar mensaje de éxito
        if (successMessage) {
            successMessage.style.display = 'none';
            successMessage.style.opacity = '0';
        }
        
        if (registrationForm) {
            registrationForm.style.display = 'block';
            registrationForm.reset();
        }

        // 2. Resetear botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
        }

        // 3. Resetear validaciones visuales
        if (strengthBars) {
            strengthBars.forEach(bar => {
                if (bar) bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
        }

        if (strengthText) {
            strengthText.textContent = 'Seguridad: Muy débil';
            strengthText.style.color = '#8888aa';
        }

        // 4. Resetear requisitos
        const reqs = [reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial];
        reqs.forEach(el => {
            if (el) {
                el.classList.remove('valid');
                const icon = el.querySelector('i');
                if (icon) {
                    icon.style.color = '#8888aa';
                    icon.className = 'fas fa-circle';
                }
            }
        });

        // 5. Limpiar mensajes de error
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });

        // 6. Enfocar primer campo
        if (fullNameInput) {
            fullNameInput.focus();
        }
        
        console.log("✅ Formulario reseteado exitosamente");
    };

    // Función para depuración
    window.debugUsers = function () {
        console.log("=== DEBUG USUARIOS ===");
        console.log("allUsers:", JSON.parse(localStorage.getItem('allUsers')) || []);
        console.log("user (navbar):", JSON.parse(localStorage.getItem('user')) || 'No hay usuario');
        console.log("currentUser:", JSON.parse(localStorage.getItem('currentUser')) || 'No hay usuario');
        console.log("isLoggedIn:", localStorage.getItem('isLoggedIn'));
        console.log("isNewUser:", localStorage.getItem('isNewUser'));
        console.log("======================");
    };

    // ===================================================================
    // 8. VERIFICACIÓN INICIAL
    // ===================================================================
    
    // Verificar si ya hay sesión activa
    function checkExistingSession() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (isLoggedIn && currentUser && window.location.pathname.includes('registro.html')) {
            console.log("⚠️ Usuario ya logueado en página de registro");
            
            // Verificar parámetros para redirigir
            const urlParams = new URLSearchParams(window.location.search);
            const fromCarritoModal = urlParams.get('fromCarritoModal') === 'true';
            
            let destination = 'index.html';
            if (fromCarritoModal) {
                destination = 'carrito.html?openModal=true';
            }
            
            setTimeout(() => {
                console.log("➡️ Redirigiendo usuario ya logueado a:", destination);
                window.location.href = destination;
            }, 1000);
        }
    }

    // Ejecutar verificación
    checkExistingSession();

    console.log("=== FORMULARIO DE REGISTRO LISTO ===");
});