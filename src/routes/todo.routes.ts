import { Router } from 'express';
import { getTodos, createTodo } from '../controllers/todo.controller';

const router = Router();

// 定义路由映射
// GET /api/todos -> 执行 getTodos 函数
router.get('/', getTodos);

// POST /api/todos -> 执行 createTodo 函数
router.post('/', createTodo);

export default router;