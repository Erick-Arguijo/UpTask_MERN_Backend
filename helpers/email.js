const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASSWORD}`
  }
});
const emailRegistro = async (usuario) =>{
    const {nombre, correo, token} = usuario


    const info = await transport.sendMail({
        from: '"UpTask - Administra tus proyectos" <cuentas@uptask.com>', // sender address
        to: correo, // list of receivers
        subject:"UpTask - Comprueba tu Cuenta",
        text:"Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
                <p>Tu cuenta ya casi esta lista, solo debes comprobarla en el siguiente 
                enlace: 
                    <a href='${process.env.FRONTEND_URL}/confirmarCuenta/${token}' target='_blank'>Comprobar Cuenta</a>
                </p>
                <p>Si tu no creaste esta cuenta, puedes ingnorar este correo</p>
        `, // html body
    });
      
}

const emailsolicitudCambioPassword = async (usuario) =>{
  const {nombre, correo, token} = usuario
 
    const info = await transport.sendMail({
        from: '"UpTask - Administra tus proyectos" <cuentas@uptask.com>', // sender address
        to: correo, // list of receivers
        text:"Comprueba tu cuenta en UpTask",
        subject:"UpTask - Reestablece tu password",
        html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
                <p>Sigue el siguiente enlace para generar un nuevo password: 
                    <a href='${process.env.FRONTEND_URL}/nuevoPassword/${token}' target='_blank'>Cambiar Password</a>
                </p>
                <p>Si tu no solicitaste este email, puedes ingnorar este correo</p>
        `, // html body
    });
}


module.exports = { emailRegistro, emailsolicitudCambioPassword}