const express = require('express');
const { validarJWT } = require('../middleware/validarJWT');
const { 
    nuevaTarea, 
    editarTarea, 
    eliminarTarea,
    obtenerTareas,
    obtenerTarea,
    cambiarEstado
} = require('../controllers/homeworkController');

const router = express.Router()

router.post('/', validarJWT, nuevaTarea)
router.get("/tareas/:id", validarJWT, obtenerTareas)
router.get("/:id", validarJWT, obtenerTarea)
router.put('/:id', validarJWT, editarTarea)
router.delete("/:id", validarJWT, eliminarTarea)
router.put("/estado/:id", validarJWT, cambiarEstado)


module.exports = router
