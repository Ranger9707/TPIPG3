
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

