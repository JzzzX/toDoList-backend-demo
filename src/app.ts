import express, { Request, Response } from 'express';
import cors from 'cors';
import todoRoutes from './routes/todo.routes'; 
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/todos', todoRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('你好，后端服务已启动！访问 /api-docs 查看接口文档。');
});

// Error Handler
app.use(errorHandler);

export default app;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
// });



