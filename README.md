# 3DNA – SISTEMA DE GESTIÓN ONLINE DE IMPRESIÓN 3D
**Hecho en Itá Ibaté, Corrientes, Argentina**

Sistema web moderno, colaborativo y multiusuario para administrar pedidos, precios, producción, clientes, ingresos, gastos y rentabilidad en tiempo real.

---

## 🚀 Despliegue Rápido en Vercel (Paso a Paso)

Este proyecto está 100% optimizado para ejecutarse en la nube y desplegarse en **Vercel** conectado a **Supabase**.

### Paso 1: Crear la Base de Datos en Supabase (Gratis)
1. Ve a [supabase.com](https://supabase.com) e inicia sesión o regístrate.
2. Haz clic en **"New Project"**.
3. Elige un nombre (ejemplo: `3dna-gestion`) y una contraseña segura para tu base de datos.
4. Una vez creado el proyecto, ve al menú lateral izquierdo y entra en **SQL Editor**.
5. Haz clic en **"New Query"**, copia todo el contenido del archivo `supabase/schema.sql` de este repositorio y pégalo en el editor.
6. Presiona el botón verde **"Run"**. ¡Listo! Todas las tablas, políticas de seguridad RLS y el canal de tiempo real (Realtime) quedarán configurados.
7. Ve a **Project Settings** (ícono de engranaje) -> **API** y copia:
   - **Project URL** (ejemplo: `https://xyzcompany.supabase.co`)
   - **anon / public key** (clave pública anónima)

### Paso 2: Subir el Proyecto a tu GitHub
1. Descarga el código completo de este proyecto o haz push a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "3DNA Sistema de Gestión Online"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/3dna-gestion.git
   git push -u origin main
   ```

### Paso 3: Desplegar en Vercel
1. Ingresa a [vercel.com](https://vercel.com) con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio `3dna-gestion` e impórtalo.
4. En la sección **Environment Variables**, añade las dos variables copiadas de Supabase:
   - `VITE_SUPABASE_URL` = tu Project URL
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Haz clic en **"Deploy"**. En menos de 60 segundos tu sistema estará online en una dirección permanente (por ejemplo: `https://3dna.vercel.app`), accesible desde cualquier celular, tablet o computadora del mundo.

---

## 🎨 Identidad Visual y Colores 3DNA
- **Violeta Intenso & Púrpura:** Fondos de barra, tarjetas de métricas destacadas y títulos (`#4c1d95`, `#6d28d9`).
- **Amarillo Brillante:** Botones de acción primaria, badges de atención y nuevo pedido (`#facc15`, `#eab308`).
- **Cian Tecnológico:** Indicadores positivos, entregados, litofanía y estado de conexión en vivo (`#06b6d4`).
- **Fucsia Neón:** Detalles de diseño, pedidos en producción y resaltados (`#d946ef`).
- **Blanco & Gris Suave:** Superficies de trabajo limpias y contrastadas para máxima legibilidad.

---

## 💼 Características Principales
1. **Acceso Multi-dispositivo:** Carga pedidos desde tu celular, actualiza estados desde la notebook del taller y consulta finanzas desde cualquier lugar.
2. **Tablero Kanban de Producción:** Visualiza y cambia estados arrastrando o con un clic (Recibido -> En Producción -> Terminado -> Listo para retirar -> Entregado).
3. **Control Automático de Precios y Ganancias:** Margen minorista y mayorista calculado al instante.
4. **Clientes y WhatsApp Directo:** Botón para chatear directamente por WhatsApp con mensaje prearmado para informar señas, avances o retiro de piezas.
5. **Caja y Finanzas con Separación de Maquinaria:** Diferencia los gastos operativos habituales (filamentos, luz, repuestos) de las compras de equipamiento (impresoras 3D, herramientas de taller).
6. **Exportación Real a Excel y CSV:** Descargas de pedidos, ingresos, gastos, clientes y balance con filtro por período (mes, año, todo).
7. **Impresión de Orden de Trabajo:** Ficha técnica imprimible con parámetros de impresión 3D (altura de capa, boquilla, material, relleno y observaciones).
