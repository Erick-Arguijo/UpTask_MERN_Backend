const mongoose = require('mongoose');
const Proyecto = require("../model/Proyecto");
const Usuario = require("../model/Usuario");
const Tarea = require('../model/Tarea');

const nuevoProyecto = async (req, res) => {
    const proyecto = req.body
    try {
        const usuario = await Usuario.findOne({_id:req._id})
        //console.log(usuario)
        proyecto.creador = req.usuario._id
        const nuevoProyecto = new Proyecto(proyecto)
        nuevoProyecto.save()
        res.status(200).json({ok:true, msj:'Proyecto creado exitosamente',proyecto:nuevoProyecto})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'})  
    }
};


const obtenerProyectos = async (req, res) =>{
    const usuario = req.usuario
    //console.log(usuario)

    try {

        const proyectos = await Proyecto.find({
            $or:[
                { creador: usuario._id },
                { colaboradores : {$in : usuario._id}  }
               ]
            }).select('-tareas')
         
        
        res.status(202).json({ok:true, proyectos})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:fakse, msj:'error inesperado',error})
    }

}

const obtenerProyecto = async (req, res) =>{
    const id = req.params.id
    const usuario = req.usuario
    
    try {
        //validar si el id es valido
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({ok:false, msj:'Proyecto no existe'})  
        }
        const proyecto = await Proyecto.findById(id).populate("tareas").populate("colaboradores")
        //validar si el proyecto existe
        if (!proyecto) {
            const error = new Error("Proyecto no encontrado")
            return res.status(402).json({ok:false, msj:error.message})  
        }

        //console.log(proyecto.colaboradores)
        //console.log(usuario._id)
        //console.log(proyecto.colaboradores.includes(usuario._id.toString()))
        //No tengo los permisos
        if(proyecto.creador.toString()!== usuario._id.toString() && !proyecto.colaboradores.some(
            (colaborador)=> colaborador._id.toString() === usuario._id.toString()) ){
            const error = new Error("No eres administrador ni colaborador de este proyecto")
            return res.status(401).json({ok:false, msj:error.message})
        }
        
        
        res.status(202).json({ok:true, proyecto})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }
}

const eliminarProyecto = async (req, res) =>{
    const usuario = req.usuario
    const idProyecto = req.params.id
    //console.log(req.params)
    //console.log(idProyecto)
    try {
        //Validar el ID
        if (!mongoose.Types.ObjectId.isValid(idProyecto)) {
            console.log('No es un ObjetoID')
            return res.status(404).json({ok:false, msj:'Proyecto no encontrado'})       
        }
        //console.log("id:" + mongoose.Types.ObjectId.isValid(idProyecto))
        const proyecto = await Proyecto.findById(idProyecto)
       
        //Validar si el proyecto existe
        if (!proyecto) {
            console.log('No existe este proyecto')
            return res.status(404).json({ok:false, msj:'Proyecto no encontrado'})        
        }
        
        //Tengo permidos?
            //console.log(proyecto.creador.toString())
            //console.log(usuario.id)
            //console.log(proyecto.creador.toString() === usuario.id)
        if (proyecto.creador.toString() !== usuario.id) {
            return res.status(400).json({ok:false, msj:'No tengo los permisos necesarios para realizar la accion'})   
        }
        const proyetos = await Proyecto.findOneAndDelete({_id:idProyecto})
        res.status(200).json({ok:true, msj:'Proyecto eliminado exitosamente'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }

}

const editarProyecto = async (req, res) =>{
    const usuario = req.usuario
    const {id} = req.params
    const {nombre} = req.body
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Proyecto no encontrado')
           return res.status(404).json({ok:false, msj:error.message})
        }

        const proyecto = await Proyecto.findById(id)
        
        if (!proyecto) {
            const error = new Error('Proyecto No encontrado')
            return res.status(404).json({ok:false, msj:error.message})      
        }

        if (proyecto.creador.toString()!==usuario.id) {
            const error = new Error("Acción no válida")
            return res.status(404).json({ok:false, msj:error.message})     
        }

        await Proyecto.findByIdAndUpdate(id, req.body)
        const proyectoActualizado = await Proyecto.findById(id)
        
        //console.log(proyectoActualizado)
         res.status(200).json({ok:true, msj:'Proyecto actualizado', proyectoActualizado})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }
}


const buscarColaborador = async (req, res) =>{
    const correo = req.body.correo
    const usuario = req.usuario    
    
    console.log(req.body)
    // buscar Usuario
    try {
        const usuarioEncontrado =  await Usuario.findOne({correo})

        //El correo esta registrado?
        if (!usuarioEncontrado) {
           return res.status(404).json({ok:false,msj:"Usuario no encontrado"})
        }
        res.status(200).json({ok:true, msj:"usuario Encontrado", usuario:usuarioEncontrado}) 
    } catch (error) {
        res.status(500).json({ok:false, msj:"Error inesperado"}) 
    } 

}


const agregarColaborador = async (req, res) =>{
    const {idProyecto} = req.params
    const usuario = req.usuario
    const {correo} = req.body
    
    try {
        if (!mongoose.Types.ObjectId.isValid(idProyecto) ) {
            const error = new Error('Acción no válida')
            return res.status(404).json({ok:false, msj:error.message}) 
        }

        const colaborador = await Usuario.findOne({correo})
        const proyecto = await Proyecto.findById(idProyecto)
        
        //Existe el proyecto ?
        if (!proyecto) {
            const error = new Error('Proyecto no encontrado')
            return res.status(404).json({ok:false, msj:error.message})  
        }

        // Verificar que el usuario tiene permiso para agregr un colaborador
        if (proyecto.creador.toString() !== usuario.id) {
            return res.status(400).json({ok:false, msj:'No tengo los permisos necesarios para realizar la accion'})    
        }

        // SOY EL CREADOR DEL PROYECTO?
        
        if (usuario._id.toString() === colaborador._id.toString()) {
            return res.status(401).json({ok:false, msj:'Intentas ser colaborador del proyecto que creaste'})
        }

        // Verificar que el nuevo Colaborador existe
        if (!colaborador) {
            return res.status(404).json({ok:false, msj:'No existe ningún usuario registrado con ese correo'})  
        }

        //Verificar que el nuevo colaborador sea un nuevo colaborador ?

        if (proyecto.colaboradores.some((colaboradorState => colaboradorState.toString() === colaborador._id.toString()))) {
            //console.log('el colaborador ya existe como colaborador')
            return res.status(500).json({ok:false, msj:`${colaborador.nombre} ya es colaborador del proyecto`})  
        }else{
            proyecto.colaboradores = [...proyecto.colaboradores, colaborador._id]
            //console.log('Este colaborador no existe')
            //console.log(proyecto)
            proyecto.save()
            res.status(202).json({ok:true, msj:'Colaborador agregado al proyecto', proyecto})

        }

        

    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }
}

const eliminarColaborador = async (req, res) =>{
    const usuario = req.usuario
    const idProyecto = req.params.idProyecto
    const {correo} = req.body



    const user = await Usuario.findOne({correo})
    
    //EXISTE EL USUARIO?
    if (!user) {
        return res.status(404).json({ok:false, msj:'Usuario no encontrado'})
    }

    //ID DEL PROYECTO ES UN OBJETO DE MONGOOSE
    if (!mongoose.isValidObjectId(idProyecto)) {
        return res.status(401).json({ok:false, msj:'Proyecto no encontrado'})
    }

    const project = await Proyecto.findOne({_id:idProyecto})
    


    // El usuario tiene permiso?
    
    if (project.creador.toString() !== usuario.id) {
        return res.status(400).json({ok:false, msj:'No tengo los permisos necesarios para realizar la accion'})        
    }
   

    //Colaborador no esta registrado como colaborador
    console.log(project.colaboradores.some(colaboradorState=> colaboradorState.toString() === user._id.toString()))
    if (!project.colaboradores.some(colaboradorState=> colaboradorState.toString() === user._id.toString())) {
        return res.status(400).json({ok:false, msj:'El Usuario no esta registrado como colaborador'})  
    }

    //console.log(user)
    //console.log(project)
    try {
        const colaboradoresModificado = project.colaboradores.filter(colaboradorState => colaboradorState.toString() !== user._id.toString() ) 
        project.colaboradores = colaboradoresModificado
        await project.save()
        //console.log(project)
        const proyecto = await Proyecto.findOne({_id:idProyecto})

        res.status(202).json({ok:true, msj:'Colaborador eliminado del proyecto', proyecto})

    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }


}

const obtenerTareas = async (req, res) =>{
    const id = req.params.id
    const usuario = req.usuario 
    //console.log(id)
    //console.log(usuario)

    try {
        // Es un objeto valido
        if (!mongoose.isValidObjectId(id)) {
            return res.status(401).json({ok:false, msj:"Tareas no encontradas"})
        }

        //Existe el proyecto
        const proyecto = await Proyecto.findById(id)
        const tareas = await Tarea.find().where("proyecto").equals(id)
        
        if(!proyecto){
            return res.status(401).json({ok:false, msj:'Proyecto no encontrado'})
        }
        
        //Tengo los permisos ?
        //console.log(proyecto.colaboradores.includes(usuario._id))
        if (proyecto.creador.toString() !== usuario._id.toString() || proyecto.colaboradores.includes(usuario._id.toString()) ) {
            return res.status(401).json({ok:false, msj:'No tienes los permisos suficientes'})
        }


        res.status(200).json({ok:true,msj:"tareas obtenidas con exito", tareas })
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'error inesperado'}) 
    }

}


module.exports = { 
    nuevoProyecto,
    obtenerProyectos,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador, 
    eliminarColaborador,
    obtenerTareas,
    buscarColaborador
};
