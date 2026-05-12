
# Migrar el proyecto a tu Supabase propio

## Contexto

Hoy el proyecto corre sobre **Lovable Cloud** (un Supabase administrado por Lovable, ref `mxcoufmuydqeelbmqogk`). Lo que vamos a hacer es desconectarlo y conectar **tu propio proyecto Supabase** (cuenta del otro correo). Como confirmaste que los datos actuales son solo de demo, no hay export/import — partimos limpio.

## Paso 1 — Tú: conectar tu Supabase en Lovable

Esto **lo tienes que hacer tú** porque requiere autenticarte con tu cuenta de Supabase. Yo no tengo permisos para hacerlo.

1. En Lovable, arriba a la derecha abre **Integrations** (o el menú **Connectors** del sidebar).
2. Busca **Supabase** y pulsa **Connect Supabase**.
3. Inicia sesión con la cuenta del otro correo y autoriza Lovable.
4. Selecciona la **organización** y **crea un proyecto nuevo** vacío (ej. `nexurh-app`). No lo apuntes a la base central — esa queda como segunda instancia separada.
5. Confirma. Lovable reescribirá automáticamente:
   - `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`)
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   
> Aviso de Lovable: al conectar tu Supabase se desconecta Lovable Cloud y los datos de demo se pierden. Está bien.

## Paso 2 — Yo: recrear todo el esquema en tu Supabase

Cuando me confirmes que ya conectaste, yo ejecuto en orden:

1. **Migraciones de esquema completo**: tablas (`tenants`, `profiles`, `employees`, `roles`, `permissions`, `evaluations`, `nomina*`, `signatures`, `evidences`, etc.), enums, funciones (`has_role`, `has_permission`, `is_super_admin`, `get_user_tenant_id`, `handle_new_user`, etc.), triggers y políticas RLS — exactamente las que ya tienes hoy.
2. **Storage buckets**: `company-logos` (público), `signatures`, `evidences`, `regulations`, `exam-documents` (privados) con sus políticas.
3. **Auth config**: email/password habilitado, redirect URLs.
4. **Re-cargar secrets** en el nuevo proyecto:
   - `CENTRAL_SUPABASE_URL` y `CENTRAL_SUPABASE_SERVICE_KEY` (los que ya tienes para la central — los pediré de nuevo porque son a nivel proyecto Supabase).
   - `RESEND_API_KEY` u otros que ya tuvieras.
5. **Re-desplegar todas las edge functions** (`generate-notifications`, `send-summary-notifications`, etc.) — Lovable lo hace automático al detectar el cambio de proyecto.
6. **Datos semilla mínimos**: módulos del sistema, permisos estándar, tipos maestros marcados como `is_standard = true` (países/cargos/EPS/ARL/tipos de examen, etc.).

## Paso 3 — Yo: validar que todo funciona

1. Crear un usuario de prueba vía signup.
2. Verificar que `handle_new_user` crea tenant + perfil + rol Administrador.
3. Probar una mutación con RLS (crear empleado).
4. Probar una edge function (notificaciones).
5. Confirmar que los buckets de storage aceptan upload.

## Paso 4 — Continuar con la integración a la central

Una vez el proyecto vive en tu Supabase, retomamos el plan anterior:
- Espejo de tenant + `tenant_plan_cache` + `ref_*` catálogos.
- Edge functions `central-tenant-provision`, `central-sync-*`, `central-checkout`, `central-webhook`, `enforce-action`.
- Wizard de signup con país/moneda/zona/plan inicial.
- Banner de plan + guard de límites.

## Lo que necesito de ti ahora

1. **Conectar tu Supabase** siguiendo el Paso 1.
2. Confirmarme aquí cuando esté listo, indicando si quieres mantener los nombres de buckets actuales y si hay alguna región preferida (us-east-1, sa-east-1, etc.) al crear el proyecto.
3. Tener a mano el `service_role` de la central para volverlo a pegar como secret cuando te lo pida.

## Riesgos y notas

- **Tiempo de recreación**: el proyecto tiene ~50 tablas, varios enums, ~100 políticas RLS y 5 buckets. Recrear todo toma 1–2 ciclos de migración aprobados por ti.
- **Edge functions**: se redepliegan automáticamente, pero las que dependan de secrets requerirán que reingreses los valores.
- **URL del proyecto cambia**: cualquier cosa que apunte hard-coded al ref viejo (no debería haber, pero confirmaremos) se actualiza solo via `.env`.
- **OAuth providers** (si llegaras a usar Google login): habría que reconfigurar en tu Supabase.
