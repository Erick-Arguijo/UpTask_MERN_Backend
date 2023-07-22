const express = require("express");
const Usuario = require("../model/Usuario");
const bcrypt = require("bcrypt");
const { generarJWT } = require("../helpers/jwt");
const { generarId } = require("../helpers/generarId");
const { emailRegistro, emailsolicitudCambioPassword } = require("../helpers/email");

const crearUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;
  
  const usuario = await Usuario.findOne({ correo });
  //console.log(usuario)
  if (usuario) {
    return res
      .status(400)
      .json({ ok: false, msj: "Ya existe un usuario con este correo" });
  }

  try {
    const token = await generarJWT({
      id: generarId(),
      correo: req.body.correo,
    });

    const nuevoUsuario = { ...req.body, token };
    //console.log(nuevoUsuario)
    const usuario = new Usuario(nuevoUsuario);
    await usuario.save();
    emailRegistro(nuevoUsuario)
    res
      .status(200)
      .json({ ok: true, msj: "Usuario creado con exito, Revisa tu email para confirmar tu cuenta"});
  } catch (error) {
    return res.status(500).json({ ok: false, msj: "Error inesperado" });
  }
};

const iniciarSesion = async (req, res) => {
  const { correo, contraseña } = req.body;
  //console.log(req.body)
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ ok: false, msj: "usuario no existe" });
    }

    if (!usuario.confirmacion) {
      return res
        .status(500)
        .json({ ok: false, msj: "Usuario no autenticado, revisa tu correo y confirmar tu cuenta" });
    }

    const compare = bcrypt.compareSync(contraseña, usuario.contraseña);

    if (!compare) {
      return res.status(404).json({ ok: false, msj: "Contraseña incorrecta" });
    }

    const token = await generarJWT({ id: usuario._id, nombre: usuario.nombre });

    return res.status(200).json({ok: true,msj: "usuario autenticado",usuario: {_id: usuario._id,nombre: usuario.nombre,correo: usuario.correo,token}});
  } catch (error) {
    console.log(error);
    return res.status(400).json('Error inesperado')
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ token });

  if (!usuario) {
    return res
      .status(404)
      .json({ ok: false, msj: "Token no valido" });
  }
  try {
    usuario.confirmacion = true;
    usuario.token = "";
    await usuario.save();
    res.status(200).json({ ok: true, msj: "Cuenta confirmada", usuario });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ ok: false, msj: "Error inesperado" });
  }
};

const solicitudCambioContraseña = async (req, res) => {
  const { correo } = req.body;
  const usuario = await Usuario.findOne({ correo });

  if (!usuario) {
    return res
      .status(404)
      .json({ ok: false, msj: "No existe un usuario con esa cuenta" });
  }

  try {
    const token = await generarJWT({
      _id: usuario._id,
      nombre: usuario.nombre,
    });
    //console.log(token);
    //Confirmar la identidad del usuario (Enviar un token al correo)
    usuario.token = token;
    usuario.save();
    emailsolicitudCambioPassword({nombre:usuario.nombre, correo:usuario.correo, token:usuario.token})
    res
      .status(200)
      .json({
        ok: true,
        msj: "Hemos enviado un correo con las instrucciones para cambio de contraseña",
      });
  } catch (error) {
    return res.status(404).json({ ok: false, msj: "Error inesperado" });
  }
};

const cambiarContraseña = async (req, res) => {
  const { token } = req.params;
  const {contraseña} = req.body

  //console.log(token)
  //console.log(contraseña)
  
    const usuario= await Usuario.findOne({token})
    //console.log(usuario)
    try {
        if (!usuario) {
           return res.status(404).json({ok:false, msj:'Token expirado, vuelva a solicitar cambio de Contraseña'})
        }

        usuario.contraseña = contraseña
        usuario.token=''
        await usuario.save()
        res.status(200).json({ok:true, msj:'Contraseña cambiada exitosamente'})

    } catch (error) {
        return res.status(404).json({ ok: false, msj: "Error inesperado" });
    }

};

const perfil = (req, res) => {
  
    res.status(200).json({ ok: true, usuario:req.usuario})
}

module.exports = {
  crearUsuario,
  iniciarSesion,
  confirmarCuenta,
  solicitudCambioContraseña,
  cambiarContraseña,
  perfil
};
