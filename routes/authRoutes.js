const express = require("express");

const {
  crearUsuario,
  iniciarSesion,
  confirmarCuenta,
  solicitudCambioContraseña,
  cambiarContraseña,
  perfil
} = require("../controllers/authController.js");
const { validarJWT } = require("../middleware/validarJWT.js");
const router = express.Router();

router.post("/nuevoUsuario", crearUsuario);
router.post("/inicioSesion", iniciarSesion);
router.get('/confirmar/:token', confirmarCuenta);
router.post('/solicitudCambioPassword', solicitudCambioContraseña);
router.post('/cambiarPassword/:token', cambiarContraseña);
router.get('/perfil',validarJWT, perfil)

module.exports = router;
