## Fase 2 del Portal del Empleado

Completar las vistas operativas restantes para que el empleado vea y actúe sobre todos sus registros desde `/Funcionarios`.

### Módulos a habilitar

1. **Cursos y certificaciones** (`/Funcionarios/cursos`)
   - Listado de cursos asignados al empleado con estado (pendiente, en curso, completado, vencido).
   - Detalle del curso: proveedor, fechas, certificado adjunto (descargable).
   - Acción: marcar progreso si aplica + firmar constancia de asistencia.

2. **Evaluaciones** (`/Funcionarios/evaluaciones`)
   - Evaluaciones pendientes por responder (autoevaluación y 360 donde el empleado es evaluador).
   - Evaluaciones donde fue evaluado: ver resultado y firmar de enterado.
   - Reutilizar `EvaluacionExecForm` en modo portal.

3. **Eventos / inducciones / capacitaciones** (`/Funcionarios/eventos`)
   - Eventos donde participa con estado de asistencia.
   - Acción: confirmar asistencia y firmar acta del evento.

4. **Exámenes médicos** (`/Funcionarios/examenes`)
   - Historial de exámenes ocupacionales (ingreso, periódicos, egreso).
   - Descarga de documento del examen (respetando privacidad: solo los suyos).
   - Firma de constancia cuando aplique.

5. **Dotación / EPP** (`/Funcionarios/dotacion`)
   - Entregas recibidas con tallas y fechas.
   - Pendientes por firmar entrega.

6. **Certificados laborales** (`/Funcionarios/certificados`)
   - Generación de certificados a partir de plantillas habilitadas para el empleado.
   - Descarga en PDF e historial de descargas.

7. **Perfil editable** (`/Funcionarios/perfil`)
   - Datos personales editables permitidos (teléfono, dirección, contacto emergencia, EPS, ARL, foto).
   - Datos laborales en solo lectura.
   - Cambio de contraseña en cualquier momento.

8. **Vigilancia epidemiológica** (`/Funcionarios/vigilancias`)
   - Vigilancias en las que está incluido (solo lectura) con próximas fechas de seguimiento.

### Cambios transversales

- **Dashboard del portal**: ampliar contadores para incluir cursos vencidos, evaluaciones pendientes y exámenes próximos.
- **Sidebar del portal**: añadir las nuevas entradas con íconos grandes y etiquetas en español sencillo.
- **Firmas**: centralizar la apertura de `SignatureDialog` desde cada módulo, escribiendo en `signatures` con `signer_id = employee_id` actual.
- **Hook `usePortalEmployee`**: extender para exponer helpers (`canEditField`, `currentEmployeeId`, `tenantId`).
- **RLS adicional**: revisar y, si falta, añadir políticas para que el empleado pueda:
  - `SELECT/UPDATE` en `evaluation_responses` propias.
  - `SELECT` en `event_participants`, `courses`, `exams`, `vigilancias`, `dotacion`, `certificate_templates` filtrados por `employee_id = get_current_employee_id()`.
  - `INSERT` en `signatures` y `evidences` ligados a su `employee_id`.
- **Storage**: políticas para que el empleado descargue solo archivos cuyo `employee_id` coincida (`exam-documents`, `evidences`, `signatures`).

### Detalles técnicos

- Reutilizar componentes existentes (`SignatureDialog`, `EvaluacionExecForm`, `RegulationViewer`, `CertificateGenerator`) envueltos en wrappers de portal que fuercen `employee_id = currentEmployeeId`.
- Cliente: `portalSupabase` (ya creado) para todas las queries del portal.
- Tipografía 16–18px, botones grandes, mensajes en español claro.
- Mobile-first: layout de una sola columna en <768px, tarjetas apilables.
- Sin cambios al esquema más allá de políticas RLS adicionales y, si fuera necesario, una vista materializada de "pendientes por empleado" para el dashboard.

### Fuera de alcance (Fase 3)

- Notificaciones push/email al empleado.
- PWA / instalación móvil.
- Carga de evidencias desde el lado empleado (ya cubierto parcialmente; se ampliará en Fase 3).
