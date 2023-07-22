
const generarId = () => {
    const idunico = Math.random().toString(30).substring(2) + Date.now().toString(36)
    return idunico
}

module.exports = {generarId}
