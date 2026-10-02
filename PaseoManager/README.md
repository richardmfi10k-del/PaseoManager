# 🌴 PaseoManager - Control de Abonos y Participantes

Plataforma moderna y transparente para organizar viajes grupales, excursiones y paseos. Permite a los participantes consultar sus abonos y saldos en vivo desde el navegador de su teléfono o computador, mientras el organizador mantiene el control total con clave de administración.

---

## 🚀 Despliegue Rápido en Vercel (Gratis en 2 Minutos)

### Paso 1: Subir el código a GitHub
1. Abre tu cuenta en [GitHub.com](https://github.com) y crea un nuevo repositorio (por ejemplo: `paseo-manager`).
2. En tu terminal o consola en la carpeta de este proyecto, ejecuta los siguientes comandos:

```bash
git init
git add .
git commit -m "Primer lanzamiento PaseoManager"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

*(Si prefieres no usar terminal, también puedes arrastrar y subir los archivos directamente en la página web de GitHub).*

---

### Paso 2: Desplegar en Vercel
1. Ve a [Vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** ➡️ **"Project"**.
3. Selecciona tu repositorio recién subido (`paseo-manager`) y haz clic en **"Import"**.
4. Vercel detectará automáticamente que es un proyecto **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Haz clic en el botón azul **"Deploy"**.
6. En menos de 60 segundos, Vercel te entregará una URL pública y gratuita (por ejemplo: `https://paseo-manager-tuusuario.vercel.app`).

---

### Paso 3: Asignar tu propio Dominio en Vercel (Opcional)
Si compraste un dominio propio (por ejemplo `www.mipaseo2026.com`):
1. En el panel de tu proyecto en Vercel, ve a **Settings** ➡️ **Domains**.
2. Escribe tu dominio (ej. `mipaseo2026.com` o `paseo.mitrabajo.com`).
3. Vercel te mostrará los registros DNS (CNAME o Registro A) para agregar en tu proveedor de dominio (GoDaddy, Namecheap, etc.).
4. ¡Listo! Vercel le genera certificado SSL HTTPS gratis automáticamente.

---

## 🛠️ Desarrollo Local

Si deseas probarlo y ejecutarlo en tu computador local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

Abre en tu navegador: `http://localhost:3000`

---

## 🔐 Contraseña de Administrador

- **Contraseña inicial de fábrica**: `admin`
- **¿Cómo cambiarla?**: Haz clic en **Acceso Organizador** en la esquina superior derecha ➡️ botón **Configuración** ➡️ sección **Contraseña Maestra**.

---

## ✨ Características Principales
- 📱 **100% Móvil y Web**: Funciona en cualquier navegador sin instalar aplicaciones.
- 💳 **Cuentas bancarias a 1 clic**: Muestra los datos de Nequi, Daviplata o bancos con botón para copiar.
- 🟢 **Paz y Salvo**: Cálculo automático de porcentaje pagado y saldo pendiente.
- 💬 **Compartir a WhatsApp**: Genera fichas con formato listo para enviar a los chats de los viajeros.
- 📊 **Exportar a Excel**: Descarga reportes completos en formato CSV compatible con Microsoft Excel y Google Sheets.
- 💾 **Copias de Seguridad JSON**: Descarga y restaura respaldos completos en cualquier momento.
