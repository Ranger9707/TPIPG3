PROGRAMACION 3 UNER 2025
Trabajo Practico Integrador

Integrantes:

-Vespa, Matias

-Casco, Melina Johanna Lisette 

-Cisnero, Daniel Marcelo

-Contreras, María Gabriela Olivares 

-Debuck, Jose Ignacio



OBJETIVOS DE LA PRIMERA ENTREGA.
Primera entrega (avance funcional mínimo): 09/10/2025
BREAD (Browse, Read, Edit, Add, Delete) completo de alguna entidad del API contemplando las mejores prácticas vistas en clase

FALTANTE.
- ESTADISTICAS.
- CUALQUIER TIPO DE EXTRA.

# BRUNO:
Autenticación (Tokens)

1. Obtener Token de Administrador (Rol 1)
Tipo: POST

URL: http://localhost:3000/api/v1/auth/login

Body (JSON):

JSON
{
  "nombre_usuario": "oscram@correo.com",
  "contrasenia": "tu_contraseña_admin"
}
Acción: Guarda el token de la respuesta en una variable de entorno de Bruno llamada admin_token.

2. Obtener Token de Empleado (Rol 2)
Tipo: POST

URL: http://localhost:3000/api/v1/auth/login

Body (JSON):

JSON

{
  "nombre_usuario": "wilcor@correo.com",
  "contrasenia": "tu_contraseña_empleado"
}
Acción: Guarda el token en una variable de entorno llamada employee_token.

3. Obtener Token de Cliente (Rol 3)
Tipo: POST

URL: http://localhost:3000/api/v1/auth/login

Body (JSON):

JSON

{
  "nombre_usuario": "alblop@correo.com",
  "contrasenia": "tu_contraseña_cliente"
}
Acción: Guarda el token en una variable de entorno llamada client_token.


🛋️ Endpoint: Salones (/api/v1/salones)
Usuarios permitidos: Admin (1) y Empleado (2) para escribir; Todos (1, 2, 3) para leer.

Listar Salones:

Auth: {{client_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/salones

Buscar Salón por ID:

Auth: {{client_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/salones/1

Crear Salón:

Auth: {{admin_token}} (o employee_token)

Tipo: POST

URL: http://localhost:3000/api/v1/salones

Body (JSON):

JSON

{
  "titulo": "Salón de Fiestas (Prueba Bruno)",
  "direccion": "Avenida Siempre Viva 742",
  "capacidad": 150,
  "importe": 250000
}
Editar Salón:

Auth: {{admin_token}} (o employee_token)

Tipo: PUT

URL: http://localhost:3000/api/v1/salones/1

Body (JSON):

JSON

{
  "importe": 300000
}
Eliminar Salón (Soft Delete):

Auth: {{admin_token}} (o employee_token)

Tipo: DELETE

URL: http://localhost:3000/api/v1/salones/5 (Usa un ID que puedas borrar)

⚙️ Endpoint: Servicios (/api/v1/servicios)
Usuarios permitidos: Admin (1) y Empleado (2) para escribir; Todos (1, 2, 3) para leer.

Listar Servicios:

Auth: {{client_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/servicios

Crear Servicio:

Auth: {{admin_token}}

Tipo: POST

URL: http://localhost:3000/api/v1/servicios

Body (JSON):

JSON

{
  "descripcion": "Show de Magia (Prueba Bruno)",
  "importe": 45000
}
Editar Servicio:

Auth: {{admin_token}}

Tipo: PUT

URL: http://localhost:3000/api/v1/servicios/1

Body (JSON):

JSON

{
  "importe": 20000
}
Eliminar Servicio:

Auth: {{admin_token}}

Tipo: DELETE

URL: http://localhost:3000/api/v1/servicios/6 (Usa un ID que puedas borrar)

🗓️ Endpoint: Turnos (/api/v1/turnos)
Usuarios permitidos: Admin (1) y Empleado (2) para escribir; Todos (1, 2, 3) para leer.

Listar Turnos:

Auth: {{client_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/turnos

Crear Turno:

Auth: {{admin_token}}

Tipo: POST

URL: http://localhost:3000/api/v1/turnos

Body (JSON):

JSON

{
  "orden": 4,
  "hora_desde": "21:00:00",
  "hora_hasta": "23:00:00"
}
Editar Turno:

Auth: {{admin_token}}

Tipo: PUT

URL: http://localhost:3000/api/v1/turnos/1

Body (JSON):

JSON

{
  "hora_hasta": "14:30:00"
}
Eliminar Turno:

Auth: {{admin_token}}

Tipo: DELETE

URL: http://localhost:3000/api/v1/turnos/3 (Usa un ID que puedas borrar)

👤 Endpoint: Usuarios (/api/v1/usuarios)
Usuarios permitidos: Admin (1) para todo; Empleado (2) solo para leer lista.

Listar Usuarios (Prueba Admin):

Auth: {{admin_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/usuarios

Listar Usuarios (Prueba Empleado):

Auth: {{employee_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/usuarios

Buscar Usuario por ID:

Auth: {{admin_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/usuarios/2 (Busca al Cliente 2)

Crear Usuario (Cliente):

Auth: {{admin_token}}

Tipo: POST

URL: http://localhost:3000/api/v1/usuarios

Body (JSON):

JSON

{
  "nombre": "Usuario",
  "apellido": "Prueba Bruno",
  "nombre_usuario": "bruno@test.com",
  "contrasenia": "bruno123",
  "tipo_usuario": 3,
  "celular": "1122334455"
}
Editar Usuario:

Auth: {{admin_token}}

Tipo: PUT

URL: http://localhost:3000/api/v1/usuarios/2 (Edita al Cliente 2)

Body (JSON):

JSON

{
  "celular": "555-1234",
  "contrasenia": "nuevaPasswordSegura"
}
Eliminar Usuario:

Auth: {{admin_token}}

Tipo: DELETE

URL: http://localhost:3000/api/v1/usuarios/3 (Usa un ID que puedas borrar)

📝 Endpoint: Reservas (/api/v1/reservas)
Usuarios permitidos: Cliente (3) y Admin (1) para crear; Admin (1) para editar/borrar; Todos (1, 2, 3) para leer.

Crear Reserva (CLIENTE):

Auth: {{client_token}} (El usuario_id se toma del token)

Tipo: POST

URL: http://localhost:3000/api/v1/reservas

Body (JSON):

JSON

{
  "fecha_reserva": "2025-12-20",
  "salon_id": 1,
  "turno_id": 1,
  "tematica": "Prueba de Cliente",
  "importe_salon": 95000,
  "importe_total": 120000,
  "servicios": [
    { "servicio_id": 2, "importe": 25000 }
  ]
}
Crear Reserva (ADMIN):

Auth: {{admin_token}} (La reserva quedará a nombre del Admin, según tu código)

Tipo: POST

URL: http://localhost:3000/api/v1/reservas

Body (JSON): (Similar al anterior)

Listar Reservas (ADMIN):

Auth: {{admin_token}} (Debería ver TODAS las reservas)

Tipo: GET

URL: http://localhost:3000/api/v1/reservas

Listar Reservas (CLIENTE):

Auth: {{client_token}} (Debería ver SÓLO sus reservas)

Tipo: GET

URL: http://localhost:3000/api/v1/reservas

Editar Reserva (ADMIN):

Auth: {{admin_token}}

Tipo: PUT

URL: http://localhost:3000/api/v1/reservas/1 (Edita la reserva 1)

Body (JSON): (Actualiza temática y rehace la lista de servicios)

JSON

{
  "tematica": "Temática Editada por Admin",
  "importe_total": 200000,
  "servicios": [
    { "servicio_id": 1, "importe": 15000 },
    { "servicio_id": 2, "importe": 25000 },
    { "servicio_id": 4, "importe": 15000 }
  ]
}
Eliminar Reserva (ADMIN):

Auth: {{admin_token}}

Tipo: DELETE

URL: http://localhost:3000/api/v1/reservas/2 (Usa un ID que puedas borrar)

📊 Endpoint: Reportes (/api/v1/reservas/reporte)
Usuarios permitidos: Solo Admin (1).

Reporte CSV:

Auth: {{admin_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/reservas/reporte/csv

Reporte PDF:

Auth: {{admin_token}}

Tipo: GET

URL: http://localhost:3000/api/v1/reservas/reporte/pdf

🚫 Pruebas de Fallos (Seguridad y Validación)
No olvides probar que las reglas de seguridad y validación funcionan.

1. Pruebas de Autenticación (401 Unauthorized)
Acción: Intenta acceder a cualquier endpoint (excepto /login) sin token.

Auth: None

Tipo: GET

URL: http://localhost:3000/api/v1/salones

Resultado esperado: HTTP 401

2. Pruebas de Autorización (403 Forbidden)
Acción: Un Cliente intenta crear un Salón.

Auth: {{client_token}}

Tipo: POST

URL: http://localhost:3000/api/v1/salones

Body (JSON): (El mismo de la prueba de salones)

Resultado esperado: HTTP 403 (Acceso no autorizado)

Acción: Un Empleado intenta editar una Reserva.

Auth: {{employee_token}}

Tipo: PUT

URL: http://localhost:3000/api/v1/reservas/1

Body (JSON): (El mismo de la prueba de reservas)

Resultado esperado: HTTP 403

3. Pruebas de Validación (400 Bad Request)
Acción: Intentar crear un Salón sin datos obligatorios.

Auth: {{admin_token}}

Tipo: POST

URL: http://localhost:3000/api/v1/salones

Body (JSON):

JSON

{
  "titulo": "Salón Incompleto"
}
Resultado esperado: HTTP 400 (Errores de express-validator)
