import express from 'express'
import cors from 'cors'
import especiesRoutes from './routes/especies'
import animaisRoutes from './routes/animais'
import fotosRoutes from './routes/fotos'
import adotatesRoutes from './routes/adotantes'
import pedidosRoutes from './routes/pedidos'
// import adminsRoutes from './routes/admins'
import dashboardRoutes from './routes/dashboard'


const app = express()
const port = 3005

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use("/especies", especiesRoutes)
app.use("/animais", animaisRoutes)
app.use("/fotos", fotosRoutes)
app.use("/adotantes", adotatesRoutes)
app.use("/pedidos", pedidosRoutes)
// app.use("/admins", adminsRoutes)
app.use("/dashboard", dashboardRoutes)



app.get('/', (req, res) => {
  res.send('API: Sistema de Canil')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})