
# Trabajo Practico Integrador - Programacion III - 2025
## Sistema de Gestión de Reservas de Casas de Cumpleaños

## Integrantes 
### - Matias Vespa
### -
### -
### -
### -

# --- Datos Importantes ---
### ENV:
```
PUERTO=3000

USEREMAIL= CORREO
PASSWORDEMAIL= CONTRASEÑA

HOST=localhost

USER=Admin
PASSWORD=admin1234

DATABASE=reservastp

JWT_SECRET=48441520b81750add320ba0199a63cd25f6b776008e96a7bc00d97f46c256924
```

### Añadidos a la base de datos:

Procedimientos Almacenados:

sp_reporte_reservas: Genera el reporte completo de reservas para los CSV/PDF.
```
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte_reservas` ()   BEGIN
    SELECT 
        r.reserva_id,
        DATE_FORMAT(r.fecha_reserva, '%Y-%m-%d') as fecha_reserva,
        s.titulo as salon,
        t.orden as turno,
        CONCAT(u.nombre, ' ', u.apellido) as cliente,
        r.tematica,
        r.importe_total,
        (
            SELECT GROUP_CONCAT(serv.descripcion SEPARATOR ', ')
            FROM reservas_servicios as rs
            INNER JOIN servicios as serv ON serv.servicio_id = rs.servicio_id
            WHERE rs.reserva_id = r.reserva_id
        ) as servicios_contratados
    FROM reservas as r
    INNER JOIN salones as s ON s.salon_id = r.salon_id
    INNER JOIN turnos as t ON t.turno_id = r.turno_id
    INNER JOIN usuarios as u ON u.usuario_id = r.usuario_id
    WHERE r.activo = 1
    ORDER BY r.fecha_reserva DESC;
END$$
```



sp_estadistica_reservas_por_salon: Calcula el total de reservas por salón,
```
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadistica_reservas_por_salon` ()   BEGIN
    SELECT
        s.titulo AS salon,
        COUNT(r.reserva_id) AS total_reservas
    FROM reservas AS r
    JOIN salones AS s ON r.salon_id = s.salon_id
    WHERE r.activo = 1 AND s.activo = 1
    GROUP BY s.titulo
    ORDER BY total_reservas DESC;
END$$
```

sp_estadistica_ingresos_mensuales: Calcula los ingresos agrupados por mes.
```
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadistica_ingresos_mensuales` ()
BEGIN
SELECT
        YEAR(r.fecha_reserva) AS anio,
        MONTH(r.fecha_reserva) AS mes_numero,
        SUM(r.importe_total) AS ingresos_totales,
        COUNT(r.reserva_id) AS total_reservas
    FROM reservas AS r
    WHERE r.activo = 1
    GROUP BY anio, mes_numero
    ORDER BY anio DESC, mes_numero DESC;
END$$
```

sp_estadistica_top_servicios: Calcula los servicios más populares.
```
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadistica_top_servicios` ()   BEGIN
    SELECT
        s.descripcion AS servicio,
        COUNT(rs.servicio_id) AS veces_contratado
    FROM reservas_servicios AS rs
    JOIN servicios AS s ON rs.servicio_id = s.servicio_id
    JOIN reservas AS r ON rs.reserva_id = r.reserva_id
    WHERE s.activo = 1 AND r.activo = 1
    GROUP BY s.descripcion
    ORDER BY veces_contratado DESC
    LIMIT 5;
END$$
```

sp_notificacion_reserva: Busca los datos de la reserva y los correos de los admins/cliente para enviar las notificaciones.
```
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_notificacion_reserva` (IN `p_reserva_id` INT)   BEGIN
    -- Primera consulta: Datos de la reserva Y correo del cliente
    SELECT
        r.fecha_reserva AS fecha,
        s.titulo AS salon,
        t.orden AS turno,
        u_cliente.nombre_usuario AS correoCliente -- <-- CAMBIO: Email del cliente
    FROM
        reservas AS r
    INNER JOIN
        salones AS s ON s.salon_id = r.salon_id
    INNER JOIN
        turnos AS t ON t.turno_id = r.turno_id
    INNER JOIN -- <-- CAMBIO: Join para obtener el cliente
        usuarios AS u_cliente ON u_cliente.usuario_id = r.usuario_id
    WHERE
        r.activo = 1 AND r.reserva_id = p_reserva_id;

    -- Segunda consulta: Correos de administradores
    SELECT
        u_admin.nombre_usuario as correoAdmin
    FROM
        usuarios AS u_admin
    WHERE
        u_admin.tipo_usuario = 1 AND u_admin.activo = 1; -- Agregado chequeo de 'activo'
END$$
```

Vistas: Creamos una vista (v_reservas_con_servicios) para simplificar las consultas que necesitan cruzar datos de reservas con los servicios.

# Informacion sobre la aplicacion
### Swagger:
- API documentada y se puede probar interactivamente a traves de: http://localhost:3000/api/v1/docs
### Arquitectura:
El proyecto sigue un diseño 4 capas para la separación de responsabilidades:
- Rutas (routes/): Define los endpoints, permisos (middlewares de autorización) y validaciones (express-validator).
- Controladores (controllers/): Orquesta el flujo. Maneja req y res, parsea el body y llama a los servicios.
- Servicios (services/): Contiene la logica de negocio. logica transacciones, la logica de reportes y el envio de correos.
- Datos (db/): capa que habla con la base de datos. Ejecuta las consultas SQL y los Stored Procedures.
### Manejo de Transacciones: 
- La creación (POST /reservas) y edición (PUT /reservas/:id) de reservas son atomicas. Utilizamos un Pool de MySQL para obtener una conexión (getConnection), iniciar una transacción (beginTransaction), y solo hacer commit si tanto la reserva (reservas) como sus servicios asociados (reservas_servicios) se guardan correctamente. Si falla, hace rollback para revertir cambios, asegurando que no queden datos corruptos.
### Manejo de Subida de Archivos: 
- Las rutas de creacion/edición de /reservas y /usuarios, especificamente para las fotos de usuario/cumpleañero usan multer para manejar multipart/form-data. en los casos en el que se neceisten datos JSON (como el array servicios), ya que llegan los datos en forma de string, el controlador se encarga de parsear los datos recibidos en forma de string (JSON.parse(req.body.servicios)) antes de pasarlo al servicio.
### Funcionalidades Extra:
- Registro Público de Clientes: Creamos un endpoint público (POST /api/v1/auth/register) que permite a cualquier persona registrarse en el sistema. Sin esto, un cliente nuevo no podría usar la API a menos que un Administrador le cree una cuenta manualmente, con este metodo el controlador fuerza que cualquier cuenta creada por esta ruta reciba automaticamente el tipo_usuario = 3 (Cliente).
- Endpoint "Mi Perfil" (/me): ruta (GET /api/v1/auth/me) que permite a cualquier usuario autenticado (sin importar su rol) obtener su propia información de perfil (nombre, email, etc.). util para que cualquiera consumiendo la API tenga una forma de saber "quién soy" después de iniciar sesión. Este endpoint resuelve eso, tomando el ID del usuario directamente del token JWT.
- Cancelación de Reservas por Clientes: permitimos que el cliente pueda cancelar (borrar logicamente) sus propias reservas. La lógica en el servicio (reservasServicio.js) y la base de datos (db/reservas.js) verifica que si el usuario es un cliente, la consulta UPDATE ... SET activo = 0 solo se ejecute si el usuario_id de la reserva coincide con el usuario_id del token.
### Dependencias utilizadas:
- express
- mysql2
- passport / passport-local / passport-jwt
- jsonwebtoken
- express-validator
- multer
- nodemailer
- handlebars
- puppeteer
- csv-writer
- swagger-autogen / swagger-ui-express
- dotenv
- morgan
- apicache
- cors

### Imagenes de muestra:
👤 Autenticación y Perfil (/api/v1/auth)
POST /login: (Público) Inicia sesión y devuelve un token JWT.

POST /register: (Público) Permite a un nuevo usuario registrarse como Cliente (rol 3).
<img width="1589" height="500" alt="REGISTRAR USUARIO CON FOTO" src="https://github.com/user-attachments/assets/f1da2ff1-5f21-4dbb-a1d8-1871b82252b5" />
<img width="1594" height="412" alt="REGISTRAR USUARIO" src="https://github.com/user-attachments/assets/59326d95-d531-46b6-9edd-acf293505bd2" />

GET /me:(Admin, Empleado, Cliente) Devuelve la información del perfil del usuario autenticado.
<img width="1592" height="395" alt="VER PERFIL" src="https://github.com/user-attachments/assets/083a6644-75f9-4926-8834-7ada974f9009" />


- 👥 Usuarios (/api/v1/usuarios)

GET /: (Admin, Empleado) Lista todos los usuarios.
<img width="1601" height="680" alt="VER USUARIOS" src="https://github.com/user-attachments/assets/c2e8d4b2-3a0b-4848-951a-696e12cf8437" />

POST /: (Admin) Crea un nuevo usuario (de cualquier rol).
<img width="1594" height="459" alt="CREAR USUARIO" src="https://github.com/user-attachments/assets/d52138d9-de66-479d-97e1-43d8cf3e6b70" />

PUT /:usuario_id: (Admin) Modifica un usuario.
<img width="1590" height="427" alt="EDITAR USUARIO" src="https://github.com/user-attachments/assets/4dc77c73-b371-4dc4-a951-39691b78f895" />

DELETE /:usuario_id: (Admin) Elimina (soft delete) un usuario.
<img width="1587" height="268" alt="ELIMINAR USUARIO" src="https://github.com/user-attachments/assets/61cead54-2ae7-4cdb-b3e2-cec8bab37ce0" />

- 🛋️ Salones (/api/v1/salones)

GET /: (Admin, Empleado, Cliente) Lista todos los salones activos.
<img width="1577" height="767" alt="GET SALONES" src="https://github.com/user-attachments/assets/e21f9303-f373-4dc4-80db-5f2c787a5b77" />

POST /: (Admin, Empleado) Crea un nuevo salón.
<img width="1586" height="564" alt="POST SALON" src="https://github.com/user-attachments/assets/ec5b0fdd-24b1-46f8-8a0b-085cf342e7a6" />

GET /:salon_id: (Admin, Empleado, Cliente) Obtiene un salón específico.
<img width="1594" height="577" alt="GET SALONES  ID" src="https://github.com/user-attachments/assets/bed8307e-99c1-44d4-9806-530047588acb" />

PUT /:salon_id: (Admin, Empleado) Modifica un salón.
<img width="1592" height="546" alt="EDIT SALON" src="https://github.com/user-attachments/assets/0634ee48-1170-408e-9d9c-816851fbd0e6" />

DELETE /:salon_id: (Admin, Empleado) Elimina (soft delete) un salón.
<img width="1590" height="301" alt="DELETE SALON" src="https://github.com/user-attachments/assets/f520134f-c20f-48e1-adbc-9cf81e4305ca" />

- ⚙️ Servicios (/api/v1/servicios)
GET /: (Admin, Empleado, Cliente) Lista todos los servicios activos.
<img width="1593" height="835" alt="VER SERVICIOS" src="https://github.com/user-attachments/assets/545acac3-9317-49be-aa6c-eb74a0d47265" />

POST /: (Admin, Empleado) Crea un nuevo servicio.
<img width="1595" height="375" alt="CREAR SERVICIO" src="https://github.com/user-attachments/assets/e2232ecc-8079-4be5-9bc0-fdcf2a7b4e10" />

GET /:servicio_id: (Admin, Empleado, Cliente) Obtiene un servicio específico.
<img width="1590" height="426" alt="VER SERVICIOS POR ID" src="https://github.com/user-attachments/assets/a26dd72d-f59f-4e8d-9f62-c152c6fc5c69" />

PUT /:servicio_id: (Admin, Empleado) Modifica un servicio.
<img width="1591" height="377" alt="EDIT SERVICIO" src="https://github.com/user-attachments/assets/52c32e27-c5d9-4ff5-8695-21fa4568344f" />

DELETE /:servicio_id: (Admin, Empleado) Elimina (soft delete) un servicio.
<img width="1590" height="272" alt="ELIMINAR SERVICIO" src="https://github.com/user-attachments/assets/6b3b6bb0-73f4-4b62-a5c6-48b4b879c967" />

- 🗓️ Turnos (/api/v1/turnos)
GET /: (Admin, Empleado, Cliente) Lista todos los turnos activos.
<img width="1591" height="711" alt="VER TURNOS" src="https://github.com/user-attachments/assets/0aeebb76-ed97-4d2d-9c8e-db06039864ad" />

POST /: (Admin, Empleado) Crea un nuevo turno.
<img width="1587" height="401" alt="CREAR TURNO" src="https://github.com/user-attachments/assets/5b8e1845-2f64-4b71-9b45-470c924018e1" />

GET /:turno_id: (Admin, Empleado, Cliente) Obtiene un turno específico.
<img width="1592" height="365" alt="VER TURNO ID" src="https://github.com/user-attachments/assets/123088b6-194c-4497-809d-38813e3ac046" />

PUT /:turno_id: (Admin, Empleado) Modifica un turno.
<img width="1597" height="419" alt="EDITAR TURNO" src="https://github.com/user-attachments/assets/b2c8e495-dbb5-42da-9244-7a97a4fa529e" />

DELETE /:turno_id: (Admin, Empleado) Elimina (soft delete) un turno.
<img width="1584" height="303" alt="ELIMINAR TURNO" src="https://github.com/user-attachments/assets/fc7eb764-c96e-4bec-a531-fec963a13617" />

- 📝 Reservas (/api/v1/reservas)
GET /: (Admin, Empleado, Cliente) Lista reservas. (Si es Admin/Empleado ve todo, si es Cliente ve solo las suyas).
<img width="1601" height="714" alt="VER RESERVAS ADMIN EMPLEADO" src="https://github.com/user-attachments/assets/fa7e77fd-ca20-4528-acb9-6c15ba3eb57a" />
<img width="1589" height="659" alt="VER RESERVA CLIENTE" src="https://github.com/user-attachments/assets/5bc7d0ef-a43e-40df-810b-21e2df241b65" />

POST /: (Admin, Cliente) Crea una nueva reserva (con sus servicios).
<img width="1591" height="525" alt="CREAR RESERVA CLIENTE" src="https://github.com/user-attachments/assets/74e7147b-baa7-47f3-96bf-b039803f20c8" />
<img width="1596" height="570" alt="RESERVA CON FOTO" src="https://github.com/user-attachments/assets/8505f090-290e-4033-b3bb-86d936e29604" />

PUT /:reserva_id: (Admin) Modifica una reserva (y/o sus servicios).
<img width="1592" height="520" alt="EDITAR RESERVA" src="https://github.com/user-attachments/assets/1d5678b7-6584-4ae1-b4ea-9aa49692a999" />


DELETE /:reserva_id: (Admin, Cliente) (Extra) Elimina (soft delete) una reserva. (El Cliente solo puede borrar las suyas)
<img width="1599" height="263" alt="ELIMINAR RESERVA ADMIN" src="https://github.com/user-attachments/assets/8522e954-f837-499d-807b-bb3f46a5c18b" />
<img width="1595" height="294" alt="ELIMINAR RESERVA CLIENTE" src="https://github.com/user-attachments/assets/2a67b178-6f21-4eef-8b84-5b92f5a51b55" />

EMAIL DE NOTIFICACION: Cliente y Admins reciben email de notificacion de reserva.
![ezgif-7bf727a58f720145](https://github.com/user-attachments/assets/d3f450ba-aa55-4b6b-8651-06d5552b02db)

- 📊 Reportes y Estadísticas (/api/v1/reservas/)
GET /reporte/csv: (Admin) Descarga un reporte de reservas en formato CSV.
<img width="1597" height="606" alt="REPORTE CSV RESERVA" src="https://github.com/user-attachments/assets/058cbcbc-8f9d-441c-93db-b094e25e22ac" />

GET /reporte/pdf: (Admin) Descarga un reporte de reservas en formato PDF.
<img width="1593" height="737" alt="RESERVAS PDF" src="https://github.com/user-attachments/assets/525f596b-64b4-4366-bc34-cb8fe39f46f4" />

GET /estadisticas/por-salon: (Admin) Obtiene un JSON con estadísticas de reservas por salón.
GET /estadisticas/ingresos-mensuales: (Admin) Obtiene un JSON con estadísticas de ingresos por mes.
GET /estadisticas/top-servicios: (Admin) Obtiene un JSON con los servicios más contratados.
<img width="1591" height="546" alt="ESTADISTICAS CSV" src="https://github.com/user-attachments/assets/356a3d14-8381-4c4c-b0ed-77fe3de9d8c4" />

GET /reporte/estadisticas-pdf: (Admin) Descarga un reporte completo de estadísticas en formato PDF.
<img width="1592" height="681" alt="ESTADISTICAS PDF" src="https://github.com/user-attachments/assets/a46846dc-576d-484a-b46e-30f0fc31fe81" />




