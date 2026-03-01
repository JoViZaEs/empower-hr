

## Plan: Módulo de Eventos y Firmas

### Contexto
La página de Eventos actualmente usa datos hardcodeados. Necesitamos crear las tablas en la base de datos, conectar el frontend y permitir CRUD completo con gestión de participantes y firmas.

### 1. Migración de base de datos

Crear tres tablas:

- **`event_types`** - Tipos de evento parametrizables (patrón estándar/custom como los demás maestros). Tipos por defecto: Inducción, Reinducción, Capacitación, Reunión, Simulacro.

- **`events`** - Tabla principal de eventos con campos: `tenant_id`, `title`, `event_type` (text), `event_date` (date), `description`, `location`, `status` (enum: borrador, en_progreso, completado, cancelado), `created_by`, timestamps. RLS con permisos granulares sobre módulo `eventos`.

- **`event_participants`** - Participantes por evento: `event_id`, `employee_id`, `signed` (boolean default false), `signature_url` (text), `signed_at` (timestamptz), `invited_at` (timestamptz default now()). RLS via evento padre (misma estrategia que `committee_members`).

### 2. Maestros - Tipos de Evento

Agregar pestaña "Tipos de Evento" en `MasterDataSettings.tsx` siguiendo el mismo patrón que Tipos de Dotación y Roles de Comité.

### 3. Formulario de Evento (`EventoForm.tsx`)

Formulario en dialog para crear/editar eventos:
- Título, tipo (select dinámico desde `event_types`), fecha, descripción, ubicación
- Selector múltiple de empleados para agregar participantes al crear

### 4. Detalle de Evento (`EventoDetailDialog.tsx`)

Dialog para gestionar un evento:
- Ver lista de participantes con estado de firma (firmado/pendiente)
- Agregar más participantes
- Marcar firmas individuales
- Barra de progreso de firmas

### 5. Página principal (`Eventos.tsx`)

Reemplazar datos mock con queries reales:
- Stats dinámicas (eventos activos, firmas recolectadas, pendientes, participantes totales)
- Lista de eventos con tabs funcionales (Todos, En progreso, Completados)
- Panel lateral de firmas pendientes con datos reales
- Botones de crear, editar, eliminar eventos

### 6. Tipos de datos en `types.ts`

Se actualizará automáticamente tras la migración.

### Archivos a crear/editar
- **Crear**: migración SQL, `src/components/eventos/EventoForm.tsx`, `src/components/eventos/EventoDetailDialog.tsx`
- **Editar**: `src/pages/Eventos.tsx`, `src/components/settings/MasterDataSettings.tsx`, `src/integrations/supabase/types.ts`

