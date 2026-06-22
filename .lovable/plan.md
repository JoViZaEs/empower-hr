# Portal del Empleado — `/Funcionarios`

Portal paralelo al sistema administrativo donde cada empleado autentica con **documento + contraseña** y ve/actúa únicamente sobre lo suyo. Incluye **ciclo de vida completo de la cuenta**: alta individual, reset de clave y revocación al retiro.

---

## 1. Modelo de autenticación

Supabase Auth requiere email → generamos un **email sintético interno** por empleado:

```
{documento}@portal.{tenant_slug}.nexurh
```

- Invisible para el usuario: en el login solo escribe **documento + contraseña**.
- El frontend resuelve documento → email sintético vía RPC pública `resolve_employee_login(documento, tenant_slug?)`.
- **Contraseña inicial = el propio número de documento**; flag `must_change_password = true` fuerza el cambio en el primer ingreso.

### Nueva tabla `employee_portal_accounts`
| campo | uso |
|---|---|
| `employee_id` | FK a `employees` (unique) |
| `tenant_id` | multi-tenant |
| `user_id` | FK a `auth.users` |
| `synthetic_email` | unique, usado para login |
| `must_change_password` | bool, fuerza reset en primer login |
| `status` | `active` / `revoked` |
| `last_login_at`, `activated_at`, `revoked_at`, `revoked_reason` | telemetría |

Tabla nueva → con `GRANT` + RLS (empleado lee solo su fila; admin del tenant ve todas).

---

## 2. Ciclo de vida de la cuenta (gestión por el admin)

Todas las acciones se hacen desde **Configuración → Portal del Empleado** y desde la **Ficha Técnica de cada empleado** (botones contextuales).

### 2.1 Alta individual con un click — **"Activar portal"**
- Disponible en la Ficha Técnica de cualquier empleado sin cuenta.
- Edge function **`portal-account-create`** (service_role):
  1. Valida que el empleado existe, está activo y pertenece al tenant del admin.
  2. Crea usuario en `auth.users` con email sintético + password = documento + `email_confirm: true`.
  3. Inserta en `employee_portal_accounts` con `must_change_password = true`, `status = 'active'`.
  4. Devuelve confirmación (sin enviar email — el admin entrega las credenciales).
- UI: botón **"Activar acceso al portal"** → diálogo de confirmación que muestra "Usuario: {documento} · Contraseña inicial: {documento} · El empleado deberá cambiarla al ingresar."

### 2.2 Resetear contraseña — **"Resetear clave"**
- Disponible en cuentas activas.
- Edge function **`portal-account-reset-password`** (service_role):
  1. Resetea la contraseña en `auth.users` al número de documento.
  2. Marca `must_change_password = true`.
  3. Invalida sesiones activas del empleado (`auth.admin.signOut`).
- UI: diálogo de confirmación → al ejecutar muestra "Contraseña reseteada al documento. El empleado deberá cambiarla al ingresar."

### 2.3 Revocar acceso — **"Revocar portal"**
- Disponible en cuentas activas.
- Edge function **`portal-account-revoke`** (service_role):
  1. Elimina el usuario de `auth.users` (`auth.admin.deleteUser`) → cascada limpia sesiones/refresh tokens.
  2. Marca `status = 'revoked'`, `revoked_at = now()`, `revoked_reason` (opcional).
  3. Mantiene la fila en `employee_portal_accounts` para auditoría (histórico de quién tuvo acceso y cuándo se revocó). El `user_id` queda como referencia huérfana pero la fila sobrevive.
- UI: diálogo "¿Revocar el acceso al portal de {nombre}? Se eliminará su usuario y no podrá ingresar más."

### 2.4 Revocación automática al retiro
- Hook en `EmpleadoForm` y en cualquier flujo de cambio de estado: cuando `employees.status` pasa a `retirado` (o equivalente), se invoca automáticamente `portal-account-revoke` para esa fila.
- Trigger redundante en BD: `AFTER UPDATE ON employees` — si `NEW.status = 'retirado'` y existe `employee_portal_accounts` activo, marca `status = 'revoked'` y emite NOTIFY para que un job (o el propio frontend admin) llame a la edge function que borra el auth user.
- En la Ficha Técnica del empleado retirado: badge **"Acceso revocado el {fecha}"**.

### 2.5 Reactivación
- Si un empleado revocado vuelve a la empresa: botón **"Reactivar portal"** sobre la misma fila → vuelve a crear el `auth.users`, asigna password = documento, marca `status = 'active'` y `must_change_password = true`.

### 2.6 Panel admin de cuentas
Nueva pestaña en Configuración: **Portal del Empleado**.
- Tabla con: empleado, documento, estado (Sin cuenta / Activo / Revocado), último login, debe cambiar clave.
- Filtros por estado y búsqueda.
- Acciones por fila: Activar / Resetear / Revocar / Reactivar.
- Acción masiva opcional (solo botón "Activar para todos los activos sin cuenta") — sin bulk upload de archivos, simplemente toma a quienes ya están en la tabla `employees`.

---

## 3. Ruta y layout del portal

Ruta **`/Funcionarios`** (case-insensitive con alias `/funcionarios`):

```
/Funcionarios               → Login (documento + contraseña)
/Funcionarios/cambiar-clave → Forzado si must_change_password
/Funcionarios/inicio        → Dashboard personal
/Funcionarios/pendientes/firmar
/Funcionarios/pendientes/hacer
/Funcionarios/cursos
/Funcionarios/evaluaciones
/Funcionarios/eventos
/Funcionarios/examenes
/Funcionarios/vigilancias
/Funcionarios/dotacion
/Funcionarios/reglamento
/Funcionarios/desprendibles
/Funcionarios/certificados
/Funcionarios/perfil
```

- **Layout independiente** `EmployeePortalLayout` (header con foto + nombre + tenant + cerrar sesión; sidebar simplificado con iconos grandes y texto, pensado para baja alfabetización digital).
- **Guardia** `EmployeePortalProtectedRoute`: valida sesión, que exista `employee_portal_accounts` con `status='active'` para el `user_id`, y redirige a `cambiar-clave` si `must_change_password = true`. Si el empleado fue revocado mientras tenía sesión activa, lo expulsa.
- **Aislamiento de sesión:** cliente Supabase del portal con `storageKey: 'nexurh-portal-auth'` para que no choque con la sesión del admin abierta en la misma máquina.

---

## 4. Vistas (todas filtradas por `employee_id` del usuario logueado)

### Dashboard `/Funcionarios/inicio`
Tarjetas grandes:
- 🖊️ **N pendientes por firmar**
- ✅ **N pendientes por hacer** (cursos, evaluaciones, eventos, reglamento)
- 💰 **Último desprendible disponible**
- 📄 **Certificados disponibles**
- Alertas personales (exámenes vencidos, dotación próxima a vencer)

### Pendientes por firmar
Consulta cruzada sobre `evaluations`, `dotacion`, `exams`, `regulation_acknowledgments`, `event_participants`, `courses`. Botón **Firmar ahora** abre `SignatureDialog` ya existente.

### Pendientes por hacer
Cursos sin completar, evaluaciones sin responder, eventos sin asistencia confirmada, reglamentos vigentes sin acknowledgment.

### Módulos con consulta + acción
| Módulo | Acción del empleado |
|---|---|
| Cursos | Marcar completado, subir evidencia, firmar |
| Evaluaciones | Responder autoevaluación / 360 |
| Eventos | Confirmar asistencia, firmar |
| Exámenes | Ver resultado, firmar consentimiento |
| Vigilancias | Solo consulta |
| Dotación | Firmar recibido |
| Reglamento | Leer (scroll-verify) + marcar leído |
| Desprendibles | Ver y descargar PDF |
| Certificados | Generar + descargar según plantillas disponibles |
| Perfil | Editar datos básicos (teléfono, dirección, contacto emergencia) |

---

## 5. Seguridad / RLS

Función security-definer **`get_current_employee_id()`** → devuelve el `employee_id` activo del `auth.uid()` actual.

Políticas **adicionales** (no reemplazan las admin) en tablas operativas:
- `SELECT` permitido si `employee_id = get_current_employee_id()` y la cuenta está `active`.
- `UPDATE/INSERT` permitido solo en campos firma/respuesta/asistencia/acknowledge sobre filas propias.
- `payroll_records`, `payroll_items`: SELECT solo de las propias.
- `signatures`, `evidences`: INSERT propias.

Storage:
- `signatures`, `evidences`: empleado puede subir bajo prefijo `employee/{employee_id}/...`.
- `exam-documents`: empleado puede SELECT sólo los vinculados a sus `exams`.

Edge functions de gestión (`portal-account-create`, `portal-account-reset-password`, `portal-account-revoke`):
- Verifican Bearer JWT del admin que llama.
- Validan que el admin es del mismo tenant que el empleado objetivo.
- Validan permiso de módulo `portal_accounts` (`manage`) o `is_super_admin`.

---

## 6. UX para baja alfabetización digital

- Tipografía grande (16-18px base), iconos por sección, botones primarios anchos.
- Login: campo grande con `inputMode="numeric"` para documento.
- Mensajes en español claro sin tecnicismos.
- Mobile-first responsive (la mayoría accederá desde celular).

---

## 7. Detalles técnicos

**Archivos nuevos**
- Páginas portal: `src/pages/portal/PortalLogin.tsx`, `PortalChangePassword.tsx`, `PortalDashboard.tsx`, `PortalPendientesFirmar.tsx`, `PortalPendientesHacer.tsx`, `PortalCursos.tsx`, `PortalEvaluaciones.tsx`, `PortalEventos.tsx`, `PortalExamenes.tsx`, `PortalVigilancias.tsx`, `PortalDotacion.tsx`, `PortalReglamento.tsx`, `PortalDesprendibles.tsx`, `PortalCertificados.tsx`, `PortalPerfil.tsx`
- Componentes portal: `src/components/portal/EmployeePortalLayout.tsx`, `EmployeePortalSidebar.tsx`, `EmployeePortalHeader.tsx`, `EmployeePortalProtectedRoute.tsx`, `PendingSummaryCard.tsx`
- Cliente y hook: `src/integrations/supabase/portalClient.ts` (storageKey separado), `src/hooks/useEmployeePortalAuth.tsx`
- Admin: `src/components/settings/PortalAccountsSettings.tsx`, botones `PortalAccountActions.tsx` reutilizables en Ficha Técnica
- Edge functions: `portal-account-create`, `portal-account-reset-password`, `portal-account-revoke`

**Migraciones SQL**
1. Tabla `employee_portal_accounts` + GRANT + RLS.
2. Función `get_current_employee_id()`.
3. RPC pública `resolve_employee_login(p_documento text, p_tenant_slug text)`.
4. Trigger `AFTER UPDATE ON employees` para marcar `status='revoked'` cuando el empleado pase a retirado.
5. Políticas RLS portal en: `employees` (perfil propio), `payroll_records`, `payroll_items`, `evaluations`, `evaluation_responses`, `courses`, `events`, `event_participants`, `exams`, `vigilancias`, `dotacion`, `regulations`, `regulation_acknowledgments`, `signatures`, `evidences`, `certificate_templates`.
6. Storage policies portal en `signatures`, `evidences`, `exam-documents`.

**Integración con admin**
- Ficha Técnica → tarjeta **"Acceso al portal"** con estado actual + botones Activar / Resetear / Revocar / Reactivar.
- Configuración → pestaña **"Portal del Empleado"**.
- Cambio de estado del empleado a "retirado" dispara revocación automática.

---

## 8. Entrega por fases

1. **Fase 1 (esta iteración):**
   - Schema + RLS + las 3 edge functions de gestión.
   - Login del portal + cambio de clave forzado.
   - Dashboard + Pendientes por firmar + Desprendibles + Reglamento.
   - Tarjeta de gestión en Ficha Técnica (Activar / Resetear / Revocar / Reactivar).
   - Pestaña "Portal del Empleado" en Configuración con la lista y acciones.
   - Revocación automática al retiro.
2. **Fase 2:** cursos, evaluaciones, eventos, exámenes, dotación, certificados, perfil editable del empleado.
3. **Fase 3:** notificaciones push/email al empleado, PWA mobile, evidencias del lado del empleado.

Confirma para arrancar con la **Fase 1**.
