const { default: mongoose } = require("mongoose")
const Tarea = require("../model/Tarea")
const Proyecto = require("../model/Proyecto")

const nuevaTarea = async (req, res) =>{
    const usuario = req.usuario
    
    try {
        //El id es un Object valido?
        if (!mongoose.Types.ObjectId.isValid(req.body.proyecto)) {
            const error = new Error('Proyecto no válido')
            return res.status(404).json({ok:false, msj:error.message})
        }

        const proyecto = await Proyecto.findById(req.body.proyecto)
        //Existe el proyecto?
        if (!proyecto) {
            const error = new Error('Proyecto no encontrado')
            return res.status(404).json({ok:false, msj:error.message})
        } 

        //Tengo los permisos suficientes ?
        if (proyecto.creador.toString() !== usuario._id.toString()) {
            const error = new Error('Permisos insuficientes')
            return res.status(404).json({ok:false, msj:error.message})
        }

        const nuevaTarea = new Tarea(req.body)
        await nuevaTarea.save()

        //Guardar una referencia en Proyecto
        
        proyecto.tareas = [...proyecto.tareas, nuevaTarea._id]
        await proyecto.save()

        res.status(200).json({ok:true, msj:'Tarea creada con exito', nuevaTarea})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'})
    }

}

const obtenerTareas = async (req, res) =>{
    const usuario = req.usuario
    const idProyecto = req.params.id

    //ES UN OBJETO MONGOOSE
    if (!mongoose.Types.ObjectId.isValid(idProyecto)) {
        const error = new Error('Proyecto no válido')
        return res.status(404).json({ok:false, msj:error.message})
    }

    const proyecto = await Proyecto.findOne({_id:idProyecto})

    if(!proyecto){
        const error = new Error('Proyecto encontrado')
        return res.status(404).json({ok:false, msj:error.message})
    }

    //TENGO LOS PERMISOS ?
    if (proyecto.creador.toString() !== usuario._id.toString() && !proyecto.colaboradores.some(
        colaboradorState => colaboradorState.toString() === usuario._id.toString()
    ) ) {
        const error = new Error('Permisos insuficientes')
        return res.status(401).json({ok:false, msj:error.message})
    }


    const tareas = await Tarea.find({proyecto:idProyecto}).populate("usuario","nombre")
    res.status(200).json({ok:true, tareas})
    

}

const obtenerTarea = async (req, res) =>{
    const usuario = req.usuario
    const {id} = req.params
    try {
        //Id Valido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Acción no válida')
            return res.status(404).json({ok:false, msj:error.message}) 
        }

        const tarea = await Tarea.findById(id).populate("proyecto")
        //Tarea no existe
        if (!tarea) {
            const error = new Error('Tarea no encontrado')
            return res.status(404).json({ok:false, msj:error.message})
        }
        // Tengo los permisos ?
        if (tarea.proyecto.creador.toString() === usuario._id.toString() || tarea.proyecto.colaboradores.includes(usuario._id)) {
            //console.log(tarea)
            res.status(200).json({ok:true, msj:'Tarea obtenida con exito', tarea})
        }else{
            const error = new Error('Acceso denegado')
            return res.status(403).json({ok:false, msj:error.message}) 

        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'})
    }
}

const editarTarea = async (req, res) =>{
    const usuario = req.usuario
    const id = req.params.id
    try {
        //Id Valido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Acción no válida')
            return res.status(404).json({ok:false, msj:error.message}) 
        }

        const tarea = await Tarea.findById(id)

        //Tarea no existe
        if (!tarea) {
            const error = new Error('Tarea no encontrada')
            return res.status(404).json({ok:false, msj:error.message})
        }

        const proyecto = await Proyecto.findById(tarea.proyecto)
        
        //Tengo los permisos ?
        if (proyecto.creador.toString() !== usuario.id.toString() && !proyecto.colaboradores.some(
            colaboradorState=> colaboradorState.toString() === usuario._id.toString()
        )) {
            const error = new Error('Acceso denegado')
            return res.status(404).json({ok:false, msj:error.message})
        }


    
        
  
        if (req.body.estado) {
            //console.log("estado true")
            const edicion = {...req.body, usuario:usuario._id}         
            await Tarea.findOneAndUpdate({_id:id}, edicion)
            const tareaActualizada = await Tarea.findOne({_id:id}).populate("usuario")
            return res.status(200).json({ok:true, msj:'tarea Actualizada', tareaActualizada})
        }
        
        if(req.body.estado === false){
            //console.log("estado falso")
            const edicion = {estado:false, usuario:null}
            await Tarea.findOneAndUpdate({_id:id}, edicion)
            const tareaActualizada = await Tarea.findOne({_id:id}).populate("usuario")
            return res.status(200).json({ok:true, msj:'tarea Actualizada', tareaActualizada})
        }
        
        await Tarea.findOneAndUpdate({_id:id}, req.body)
        const tareaActualizada = await Tarea.findOne({_id:id}).populate("usuario")
        return res.status(200).json({ok:true, msj:'tarea Actualizada', tareaActualizada})
  

    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'} )
    }


}

const eliminarTarea = async (req, res) =>{
    const usuario = req.usuario
    const id = req.params.id

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Acción no válida')
            return res.status(404).json({ok:false, msj:error.message}) 
        }

        const tarea = await Tarea.findById(id)
        //console.log(tarea)
        //Tarea no existe
        if (!tarea) {
            const error = new Error('Tarea no encontrada')
            return res.status(404).json({ok:false, msj:error.message})
        }

        const proyecto = await Proyecto.findById(tarea.proyecto)
        
        //Tengo los permisos ?
        if (proyecto.creador.toString() !== usuario.id.toString()) {
            const error = new Error('Acceso denegado')
            return res.status(404).json({ok:false, msj:error.message})
        }


        proyecto.tareas.pull(id)

        await Promise.allSettled([await tarea.deleteOne(),  await proyecto.save()])

        res.status(200).json({ok:true, msj:'Tarea eliminada exitosamente'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'} ) 
    }
}

const cambiarEstado = async (req, res) =>{
    const usuario = req.usuario
    const id = req.params.id

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Acción no válida')
            return res.status(404).json({ok:false, msj:error.message}) 
        }

        const tarea = await Tarea.findById(id)

        //Tarea no existe
        if (!tarea) {
            const error = new Error('Tarea no encontrado')
            return res.status(404).json({ok:false, msj:error.message})
        }

        const proyecto = await Proyecto.findById(tarea.proyecto)

        if (usuario.id.toString() === proyecto.creador.toString() || proyecto.colaboradores.includes(usuario.id)) {
            //console.log(usuario.id.toString() === proyecto.creador.toString())
            //console.log(proyecto.colaboradores.includes(usuario.id))
            tarea.estado = req.body.estado
            //console.log(tarea)
            await tarea.save()
            res.status(200).json({ok:true, msj:"Tarea actulizado con exito"})
        }else{
            const error = new Error('Acceso denegado')
            return res.status(404).json({ok:false, msj:error.message})
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({ok:false, msj:'Error inesperado'} ) 
    }


}

module.exports = {
    nuevaTarea, 
    obtenerTarea,
    editarTarea, 
    obtenerTareas,
    eliminarTarea,
    cambiarEstado
}