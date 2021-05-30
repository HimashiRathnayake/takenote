import initializeServer from './initializeServer'
import router from './router'

const app = initializeServer(router)
var port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${5000}`)) // eslint-disable-line
