const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getKPIs = async (req, res) => {
    try {
        const [[empleadosCount]] = await db.query(`SELECT COUNT(*) AS total FROM Empleados`);
        const [[ventasCount]] = await db.query(`SELECT COUNT(*) AS total FROM Ventas`);
        const [[facturasCount]] = await db.query(`SELECT COUNT(*) AS total FROM Facturas`);

        if (empleadosCount.total === 0 || ventasCount.total === 0 || facturasCount.total === 0) {
            return res.status(400).json({
                error: 'Faltan datos esenciales para generar los KPIs',
                detalles: {
                    empleados: empleadosCount.total,
                    ventas: ventasCount.total,
                    facturas: facturasCount.total
                }
            });
        }

        const [result] = await db.query(`
            SELECT 
                COUNT(*) AS totalEmpleados,
                IFNULL(SUM(salario), 0) AS salarioTotal,
                (SELECT COUNT(*) FROM Ventas WHERE estado = 'completada') AS ventasRealizadas,
                (SELECT COUNT(*) FROM Facturas WHERE estado = 'pagada') AS facturasPagadas
            FROM Empleados
        `);
        res.json(result[0]);
    } catch (err) {
        console.error('Error en getKPIs:', err);
        res.status(500).json({ error: 'Error al obtener KPIs' });
    }
};

exports.getTopVendedores = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT E.nombre, COUNT(V.id_venta) AS totalVentas
            FROM Ventas V
            JOIN Empleados E ON V.id_empleado = E.id_empleado
            WHERE V.estado = 'completada'
            GROUP BY E.nombre
            ORDER BY totalVentas DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error en getTopVendedores:', err);
        res.status(500).json({ error: 'Error al obtener ranking de ventas' });
    }
};

exports.getReportes = async (req, res) => {
    try {
        const [empleados] = await db.query(`SELECT * FROM Empleados`);
        const [ventas] = await db.query(`SELECT * FROM Ventas`);
        const [facturas] = await db.query(`SELECT * FROM Facturas`);
        const [nominas] = await db.query(`SELECT * FROM Nominas`);
        res.json({ empleados, ventas, facturas, nominas });
    } catch (err) {
        console.error('Error en getReportes:', err);
        res.status(500).json({ error: 'Error al generar reportes' });
    }
};
