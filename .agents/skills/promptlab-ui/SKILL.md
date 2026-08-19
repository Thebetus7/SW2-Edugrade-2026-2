---
name: promptlab-ui
description: Guía y sistema de diseño UI plano (Flat Design), minimalista, sobrio y limpio para el frontend. Úsalo para crear y refactorizar interfaces de usuario con colores planos y sólidos, sin difuminados ni efectos extravagantes, con soporte completo para Modo Claro y Oscuro.
---

# EduGrade / PromptLab - Flat & Clean UI Design System Skill

Este skill define los lineamientos estrictos de **diseño plano (Flat Design), sobrio, minimalista y directo** para el frontend de la plataforma. Su objetivo es mantener una interfaz limpia, sin efectos visuales pesados, sin colores difuminados, sin gradientes complejos y sin tipografías extravagantes.

---

## 1. Principios y Reglas de Diseño Estricto

1. **Colores Planos y Sólidos (Flat Colors)**:
   - Utilizar únicamente colores sólidos y fondos planos uniformes.
   - **Prohibido**: Textos con degradados (`bg-gradient-to-r`, `bg-clip-text text-transparent`), fondos difuminados con orbes de luz (`blur-3xl`, `blur-[120px]`, `blur-xl`) o efectos de cristal pesado (`backdrop-blur-xl`).
2. **Bordes Definidos de 1px**:
   - La separación y jerarquía visual se logra mediante bordes nítidos y sólidos (`border border-slate-700` o `border-slate-200`) en lugar de sombras coloreadas o halos difusos.
3. **Tipografía Limpia y Directa**:
   - Usar tipografía legible y estándar del sistema o sans-serif limpia (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
   - Evitar tracking exagerado, mayúsculas desmedidas o contrastes tipográficos extravagantes.
4. **Componentes Ligeros y Funcionales**:
   - Botones con colores sólidos y hover directo.
   - Badges planos rectangulares con esquinas redondeadas estándar (`rounded`).
   - Formularios e inputs con fondos sólidos y foco en un solo color plano (`focus:border-blue-500`).

---

## 2. Paleta de Colores Planos (Dark & Light Mode)

### Matriz de Colores Semánticos

| Rol de Color | Modo Oscuro (Dark) | Modo Claro (Light) | Uso y Aplicación |
| :--- | :--- | :--- | :--- |
| **Fondo Principal** | `#0f172a` (`bg-slate-900`) | `#f8fafc` (`bg-slate-50`) | Fondo base de la pantalla |
| **Superficie / Card** | `#1e293b` (`bg-slate-800`) | `#ffffff` (`bg-white`) | Tarjetas, contenedores, sidebars |
| **Superficie Secundaria** | `#0f172a` (`bg-slate-900`) | `#f1f5f9` (`bg-slate-100`) | Sub-cajas, inputs, código, estados vacíos |
| **Borde Sólido** | `#334155` (`border-slate-700`)| `#cbd5e1` (`border-slate-300`)| Separadores, bordes de cards y botones |
| **Borde Hover** | `#475569` (`border-slate-600`)| `#94a3b8` (`border-slate-400`)| Estados de foco o hover en listas |
| **Texto Principal** | `#ffffff` / `#f8fafc` | `#0f172a` (`text-slate-900`) | Títulos, encabezados, contenido activo |
| **Texto Secundario** | `#94a3b8` (`text-slate-400`)| `#64748b` (`text-slate-500`) | Descripciones, fechas, subtítulos |
| **Acento Primario** | `#2563eb` (`bg-blue-600`) | `#2563eb` (`bg-blue-600`) | Botones de acción, enlaces activos, foco |
| **Éxito (Success)** | `#16a34a` / `#22c55e` | `#16a34a` (`text-emerald-600`)| Notas aprobadas, estado en línea, badges |
| **Advertencia (Warning)**| `#d97706` (`text-amber-400`)| `#d97706` (`text-amber-600`)| Estados en proceso, pendientes |
| **Error (Danger)** | `#dc2626` (`text-red-400`) | `#dc2626` (`text-red-600`) | Notas desaprobadas, alertas, desconexión |

---

## 3. Catálogo de Componentes Planos (Flat UI Components)

### 1. Botones Planos (Buttons)

```tsx
// Botón Primario Sólido
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg border border-blue-500 transition-colors flex items-center gap-1.5">
  <Plus className="w-3.5 h-3.5" />
  <span>Crear Registro</span>
</button>

// Botón Secundario
<button className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors">
  Cancelar
</button>

// Botón de Acción Peligrosa / Eliminar
<button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg border border-red-500 transition-colors">
  Eliminar
</button>
```

---

### 2. Tarjetas y Paneles (Cards & Panels)

```tsx
// Tarjeta Plana Estándar
<div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold text-white">Título de la Tarjeta</h3>
    <span className="text-xs text-slate-400">ID: #104</span>
  </div>
  <p className="text-xs text-slate-300">
    Contenido descriptivo con tipografía limpia y fondo plano uniforme.
  </p>
</div>

// Tarjeta de Selección con Hover Activo
<div className="p-3.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:border-slate-500 cursor-pointer transition-colors">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-blue-400">MAT-101</span>
    <span className="text-xs text-emerald-400 font-bold">18.5 pts</span>
  </div>
  <h4 className="text-xs font-semibold text-white mt-1">Examen Parcial de Cálculo</h4>
</div>
```

---

### 3. Badges e Indicadores de Estado (Badges & Status)

```tsx
// Badge de Éxito
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
  Aprobado
</span>

// Badge Informativo / Primario
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/60">
  Evaluado IA
</span>

// Badge de Error / Desaprobado
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/60 text-red-300 border border-red-700/60">
  Desaprobado
</span>

// Indicador Circular de Conexión
<div className="flex items-center gap-2 text-xs text-slate-300">
  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
  <span>Conectado</span>
</div>
```

---

### 4. Formularios e Inputs (Inputs & Search)

```tsx
// Input con Icono Frontal
<div className="space-y-1 text-left">
  <label className="block text-xs font-medium text-slate-300">Correo Electrónico</label>
  <div className="relative">
    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input 
      type="email" 
      placeholder="usuario@ejemplo.com" 
      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
    />
  </div>
</div>

// Barra de Búsqueda Compacta
<div className="relative w-64">
  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
  <input 
    type="text" 
    placeholder="Buscar..." 
    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
  />
</div>
```

---

### 5. Navegación y Tabs (Navigation & Tabs)

```tsx
// Selector Segmentado de Tabs Plano
<div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700 text-xs">
  <button className="flex-1 py-1.5 rounded-md font-medium bg-blue-600 text-white transition-colors">
    Acceso Rápido
  </button>
  <button className="flex-1 py-1.5 rounded-md font-medium text-slate-400 hover:text-slate-200 transition-colors">
    Login Manual
  </button>
</div>

// Item de Barra de Navegación
<a href="/exams" className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white border border-slate-700">
  <BookOpen className="w-4 h-4 text-emerald-400" />
  <span>Exámenes</span>
</a>
```

---

### 6. Alertas y Mensajes de Validación

```tsx
// Aviso de Error
<div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
  <span>Credenciales incorrectas o error en el servidor.</span>
</div>

// Caja de Criterio / Rúbrica
<div className="bg-slate-900 p-2.5 rounded border border-slate-700 space-y-0.5">
  <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
    Rúbrica Esperada:
  </span>
  <p className="text-xs text-slate-300 font-mono">
    Identifica correctamente las variables y formula la ecuación cuadrática.
  </p>
</div>
```

---

## 4. Checklist para Nuevas Vistas y Componentes

- [ ] ¿El fondo es un color sólido (`bg-slate-900` o `bg-slate-800`) sin degradados ni difuminados?
- [ ] ¿Los bordes son nítidos de 1px (`border-slate-700`) sin sombras difusas ni colores de neón?
- [ ] ¿Los botones usan colores planos sólidos (`bg-blue-600`, `bg-slate-800`)?
- [ ] ¿Las tipografías son sobrias, con pesos estándar (`font-medium`, `font-semibold`) y tamaños limpios (`text-xs`, `text-sm`)?
- [ ] ¿La interfaz responde con precisión en dark mode (`slate-900`/`slate-800`) y light mode (`slate-50`/`white`)?
