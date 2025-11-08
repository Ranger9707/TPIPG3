-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-11-2025 a las 16:57:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservastp`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadistica_ingresos_mensuales` ()   BEGIN
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

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `reserva_id` int(11) NOT NULL,
  `fecha_reserva` date NOT NULL,
  `salon_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `foto_cumpleaniero` varchar(255) DEFAULT NULL,
  `tematica` varchar(255) DEFAULT NULL,
  `importe_salon` decimal(10,2) DEFAULT NULL,
  `importe_total` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`reserva_id`, `fecha_reserva`, `salon_id`, `usuario_id`, `turno_id`, `foto_cumpleaniero`, `tematica`, `importe_salon`, `importe_total`, `activo`, `creado`, `modificado`) VALUES
(1, '2025-10-08', 1, 1, 1, NULL, 'Plim plim', NULL, 200000.00, 1, '2025-08-19 19:02:33', '2025-08-19 19:02:33'),
(2, '2025-10-08', 2, 1, 1, NULL, 'Messi', NULL, 100000.00, 1, '2025-08-19 19:03:45', '2025-08-19 19:03:45'),
(3, '2025-10-08', 2, 2, 1, NULL, 'Palermo', NULL, 500000.00, 1, '2025-08-19 19:03:45', '2025-08-19 19:03:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_servicios`
--

CREATE TABLE `reservas_servicios` (
  `reserva_servicio_id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservas_servicios`
--

INSERT INTO `reservas_servicios` (`reserva_servicio_id`, `reserva_id`, `servicio_id`, `importe`, `creado`, `modificado`) VALUES
(1, 1, 1, 50000.00, '2025-08-19 19:07:31', '2025-08-19 19:07:31'),
(2, 1, 2, 50000.00, '2025-08-19 19:07:31', '2025-08-19 19:07:31'),
(3, 1, 3, 50000.00, '2025-08-19 19:07:31', '2025-08-19 19:07:31'),
(4, 1, 4, 50000.00, '2025-08-19 19:07:31', '2025-08-19 19:07:31'),
(5, 2, 1, 50000.00, '2025-08-19 19:08:08', '2025-08-19 19:08:08'),
(6, 2, 2, 50000.00, '2025-08-19 19:08:08', '2025-08-19 19:08:08'),
(7, 3, 1, 100000.00, '2025-08-19 19:09:17', '2025-08-19 19:09:17'),
(8, 3, 2, 100000.00, '2025-08-19 19:09:17', '2025-08-19 19:09:17'),
(9, 3, 3, 100000.00, '2025-08-19 19:09:17', '2025-08-19 19:09:17'),
(10, 3, 4, 200000.00, '2025-08-19 19:09:17', '2025-08-19 19:09:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salones`
--

CREATE TABLE `salones` (
  `salon_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`salon_id`, `titulo`, `direccion`, `latitud`, `longitud`, `capacidad`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Principal', 'San Lorenzo 1000', NULL, NULL, 200, 95000.00, 1, '2025-08-19 18:51:22', '2025-08-19 18:51:22'),
(2, 'Secundario', 'San Lorenzo 1000', NULL, NULL, 70, 7000.00, 1, '2025-08-19 18:51:22', '2025-08-19 18:51:22'),
(3, 'Cancha Fútbol 5', 'Alberdi 300', NULL, NULL, 50, 150000.00, 1, '2025-08-19 18:51:22', '2025-08-19 18:51:22'),
(4, 'Maquina de Jugar', 'Peru 50', NULL, NULL, 100, 95000.00, 1, '2025-08-19 18:51:22', '2025-08-19 18:51:22'),
(5, 'Trampolín Play', 'Belgrano 100', NULL, NULL, 70, 200000.00, 1, '2025-08-19 18:51:22', '2025-08-19 18:51:22'),
(14, 'San Junipero', 'San Martin 3000', NULL, NULL, 500, 150000.00, 0, '2025-10-04 16:56:13', '2025-10-04 20:48:52'),
(15, 'San Junipero', 'San Martin 3000', NULL, NULL, 320, 150000.00, 0, '2025-10-05 14:44:20', '2025-10-05 14:56:12'),
(16, 'Salón Alegría', 'Av. Siempreviva 742', NULL, NULL, 110, 150000.00, 1, '2025-10-21 16:37:27', '2025-10-21 16:37:27'),
(17, 'Salón de Fiestas (Prueba Bruno)', 'Avenida Siempre Viva 742', NULL, NULL, 150, 300000.00, 0, '2025-11-05 10:59:18', '2025-11-05 11:05:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `servicio_id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`servicio_id`, `descripcion`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Sonido', 15000.00, 1, '2025-08-19 18:47:55', '2025-08-19 18:47:55'),
(2, 'Mesa dulce', 25000.00, 1, '2025-08-19 18:47:55', '2025-08-19 18:47:55'),
(3, 'Tarjetas de invitación', 5000.00, 1, '2025-08-19 18:47:55', '2025-08-19 18:47:55'),
(4, 'Mozos', 15000.00, 1, '2025-08-19 18:47:55', '2025-08-19 18:47:55'),
(5, 'Sala de video juegos', 15000.00, 1, '2025-08-19 18:47:55', '2025-08-19 18:47:55'),
(6, 'Mago', 25000.00, 1, '2025-08-20 18:31:00', '2025-08-20 18:31:00'),
(7, 'Cabezones', 80000.00, 1, '2025-08-20 18:31:00', '2025-08-20 18:31:00'),
(8, 'Maquillaje infantil', 1000.00, 1, '2025-08-20 18:31:00', '2025-08-20 18:31:00'),
(9, 'Show de Magia (Prueba Bruno)', 20000.00, 0, '2025-11-05 11:07:07', '2025-11-05 11:07:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `turno_id` int(11) NOT NULL,
  `orden` int(11) NOT NULL,
  `hora_desde` time NOT NULL,
  `hora_hasta` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `turnos`
--

INSERT INTO `turnos` (`turno_id`, `orden`, `hora_desde`, `hora_hasta`, `activo`, `creado`, `modificado`) VALUES
(1, 1, '12:00:00', '14:00:00', 1, '2025-08-19 18:44:19', '2025-08-19 18:44:19'),
(2, 2, '15:00:00', '17:00:00', 1, '2025-08-19 18:46:08', '2025-08-19 18:46:08'),
(3, 3, '18:00:00', '20:00:00', 1, '2025-08-19 18:46:08', '2025-08-19 18:46:08'),
(5, 4, '21:00:00', '23:30:00', 0, '2025-11-05 11:10:16', '2025-11-05 11:11:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `tipo_usuario` tinyint(4) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `foto`, `activo`, `creado`, `modificado`) VALUES
(1, 'Alberto', 'López', 'alblop@correo.com', 'cf584badd07d42dcb8506f8bae32aa96', 3, NULL, NULL, 1, '2025-08-19 18:37:51', '2025-08-19 18:37:51'),
(2, 'Pamela', 'Gómez', 'pamgom@correo.com', '709ee61c97fc261d35aa2295e109b3fb', 3, NULL, NULL, 1, '2025-08-19 18:39:45', '2025-08-19 18:39:45'),
(3, 'Esteban', 'Ciro', 'estcir@correo.com', 'da6541938e9afdcd420d1ccfc7cac2c7', 3, NULL, NULL, 1, '2025-08-19 18:41:50', '2025-08-19 18:41:50'),
(4, 'Oscar', 'Ramirez', 'oscram@correo.com', '0ac879e8785ea5b3da6ff1333d8b0cf2', 1, NULL, NULL, 1, '2025-08-19 18:41:50', '2025-08-19 18:41:50'),
(5, 'Claudia', 'Juárez', 'clajua@correo.com', '4f9dbdcf9259db3fa6a3f6164dd285de', 1, NULL, NULL, 1, '2025-08-19 18:41:50', '2025-11-05 10:52:14'),
(6, 'William', 'Corbalán', 'wilcor@correo.com', 'f68087e72fbdf81b4174fec3676c1790', 2, NULL, NULL, 1, '2025-08-19 18:41:50', '2025-08-19 18:41:50'),
(7, 'Anahí', 'Flores', 'anaflo@correo.com', 'd4e767c916b51b8cc5c909f5435119b1', 2, NULL, NULL, 1, '2025-08-19 18:41:50', '2025-08-19 18:41:50'),
(9, 'Empleado', 'Nuevo', 'empleado@nuevo.com', 'ccc13e8ab0819e3ab61719de4071ecae6c1d3cd35dc48b91cad3481f20922f9f', 2, '11223344', NULL, 0, '2025-11-05 12:23:49', '2025-11-05 12:25:38'),
(12, 'Bruno', 'Test', 'bruno@test.com', '956cd9e97c44cbb5c9f18ccf258bb3ea0fbac91d027d2ac9489185f531478242', 3, NULL, NULL, 1, '2025-11-05 12:52:34', '2025-11-05 12:52:34');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_reservas_con_servicios`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_reservas_con_servicios` (
`reserva_id` int(11)
,`fecha` date
,`salon` varchar(255)
,`turno` int(11)
,`descripcion` varchar(255)
,`importe` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_reservas_con_servicios`
--
DROP TABLE IF EXISTS `v_reservas_con_servicios`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_reservas_con_servicios`  AS SELECT `r`.`reserva_id` AS `reserva_id`, `r`.`fecha_reserva` AS `fecha`, `s`.`titulo` AS `salon`, `t`.`orden` AS `turno`, `se`.`descripcion` AS `descripcion`, `se`.`importe` AS `importe` FROM ((((`reservas` `r` join `salones` `s` on(`s`.`salon_id` = `r`.`salon_id`)) join `turnos` `t` on(`t`.`turno_id` = `r`.`turno_id`)) join `reservas_servicios` `rs` on(`rs`.`reserva_id` = `r`.`reserva_id`)) join `servicios` `se` on(`se`.`servicio_id` = `rs`.`servicio_id`)) WHERE `r`.`activo` = 1 ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`reserva_id`),
  ADD KEY `reservas_fk2` (`salon_id`),
  ADD KEY `reservas_fk3` (`usuario_id`),
  ADD KEY `reservas_fk4` (`turno_id`);

--
-- Indices de la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  ADD PRIMARY KEY (`reserva_servicio_id`),
  ADD KEY `reservas_servicios_fk1` (`reserva_id`),
  ADD KEY `reservas_servicios_fk2` (`servicio_id`);

--
-- Indices de la tabla `salones`
--
ALTER TABLE `salones`
  ADD PRIMARY KEY (`salon_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`servicio_id`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`turno_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `reserva_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  MODIFY `reserva_servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `salon_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `turno_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_fk2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`salon_id`),
  ADD CONSTRAINT `reservas_fk3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  ADD CONSTRAINT `reservas_fk4` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`turno_id`);

--
-- Filtros para la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  ADD CONSTRAINT `reservas_servicios_fk1` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`reserva_id`),
  ADD CONSTRAINT `reservas_servicios_fk2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicio_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
