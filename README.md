
# Trabajo Practico Integrador - Programacion III - 2025

-  Sistema de Gestión de Reservas de Casas de Cumpleaños

## Integrantes 
- Matias Vespa
-
-
-
-

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


