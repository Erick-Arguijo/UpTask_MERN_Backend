const express = require("express");
const router = express.Router();

const { validarJWT } = require("../middleware/validarJWT");
const {
  nuevoProyecto,
  obtenerProyectos,
  obtenerProyecto,
  agregarColaborador,
  eliminarColaborador,
  eliminarProyecto,
  editarProyecto,
  obtenerTareas,
  buscarColaborador
} = require("../controllers/projectController");

router.post("/", validarJWT, nuevoProyecto);
router.get("/", validarJWT, obtenerProyectos);
router.get("/:id", validarJWT, obtenerProyecto);
router.put("/:id", validarJWT, editarProyecto)
router.delete("/:id", validarJWT, eliminarProyecto)
router.post("/buscarColaborador", validarJWT, buscarColaborador)
router.post("/colaborador/:idProyecto", validarJWT, agregarColaborador);
router.put("/colaborador/:idProyecto", validarJWT, eliminarColaborador);
router.get("/tareas/:id", validarJWT, obtenerTareas)


module.exports = router;
