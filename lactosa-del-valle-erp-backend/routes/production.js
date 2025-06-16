const express = require('express');
const router = express.Router();
const productionCtrl = require('../controllers/production');

router.get('/stock', productionCtrl.getStock);
router.post('/create-order', productionCtrl.createOrder);
router.get('/ordenes', productionCtrl.getOrdenesProduccion);
router.put('/ordenes/:id_orden/estado', productionCtrl.updateEstadoOrden);
router.get('/productos', productionCtrl.getProductos);
router.get('/orden/:id', productionCtrl.getDetalleOrden);
router.delete('/ordenes/:id_orden', productionCtrl.eliminarOrden);
router.post('/productos', productionCtrl.crearProducto);


//control calidad
router.post('/control-calidad', productionCtrl.agregarControlCalidad);
router.get('/control-calidad/:id_orden', productionCtrl.getControlCalidadPorOrden);
//insumos
router.post('/compras', productionCtrl.registrarCompraInsumo);
router.get('/proveedores', productionCtrl.getProveedores);
router.get('/insumos', productionCtrl.getInsumos);
router.get('/compras', productionCtrl.getComprasInsumos);

//dashboard
router.get('/dashboard', productionCtrl.getDashboardProduccion);
router.get('/dashboard/produccion-diaria', productionCtrl.getProduccionPorDia);

module.exports = router;
