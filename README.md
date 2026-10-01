# Gestión de Equipos y Componentes

Proyecto integrador de Software y Laboratorio Informático.

## Plataforma elegida
Supabase.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: diseño.
- `app.js`: conexión y operaciones CRUD.
- `schema.sql`: tabla, seguridad RLS y datos de prueba.

## Cómo ponerlo a funcionar

1. Crear un proyecto en Supabase.
2. Abrir `SQL Editor`.
3. Copiar y ejecutar todo el contenido de `schema.sql`.
4. Ir a la configuración del proyecto y copiar:
   - Project URL
   - Publishable/anon public key
5. Abrir `app.js`.
6. Reemplazar:
   `PEGAR_AQUI_TU_PROJECT_URL`
   y
   `PEGAR_AQUI_TU_ANON_PUBLIC_KEY`
7. Abrir `index.html` mediante un servidor local o publicar el proyecto.

IMPORTANTE:
No colocar nunca la clave `service_role` en `app.js` ni en GitHub.
