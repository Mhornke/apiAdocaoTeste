"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const especies_1 = __importDefault(require("./routes/especies"));
const animais_1 = __importDefault(require("./routes/animais"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const adotantes_1 = __importDefault(require("./routes/adotantes"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
// import adminsRoutes from './routes/admins'
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
const port = 3005;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use("/especies", especies_1.default);
app.use("/animais", animais_1.default);
app.use("/fotos", fotos_1.default);
app.use("/adotantes", adotantes_1.default);
app.use("/pedidos", pedidos_1.default);
// app.use("/admins", adminsRoutes)
app.use("/dashboard", dashboard_1.default);
app.get('/', (req, res) => {
    res.send('API: Sistema de Canil');
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
