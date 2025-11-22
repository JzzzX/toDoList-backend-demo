import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'; // 引入 zod

const prisma = new PrismaClient();

// --- 定义 Zod 校验规则 (Schema) ---
// 创建任务的规则
const createTodoSchema = z.object({
  title: z.string().min(1, "标题不能为空"), 
  description: z.string().optional(),       
  priority: z.number().int().min(1).max(3).optional(),
});

// 更新任务的规则
const updateTodoSchema = z.object({
  isCompleted: z.boolean().optional(),      
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(3).optional(),
});

// --- Controller 函数 (不再需要 try-catch) ---

// 1. 获取所有任务
export const getTodos = async (req: Request, res: Response) => {
  const { search, isCompleted, sort } = req.query;
  const whereCondition: any = {};

  if (search) {
    whereCondition.title = { contains: String(search) };
  }
  if (isCompleted) {
    whereCondition.isCompleted = isCompleted === 'true';
  }

  let orderBy: any = { createdAt: 'desc' };

  if (sort === 'priority') {
    orderBy = { priority: 'desc' };
  }

  const todos = await prisma.todo.findMany({
    where: whereCondition,
    orderBy: orderBy,
  });

  res.json(todos);
};

// 2. 创建任务 (使用 Zod 校验)
export const createTodo = async (req: Request, res: Response) => {
  // Zod 校验：如果校验失败，会直接抛出错误，被全局异常处理捕获
  // parse 成功后会返回类型安全的数据
  const validatedData = createTodoSchema.parse(req.body);

  const newTodo = await prisma.todo.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
    },
  });
  
  res.status(201).json(newTodo);
};

// 3. 更新任务
export const updateTodo = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Zod 校验
  const validatedData = updateTodoSchema.parse(req.body);

  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: validatedData, // 直接传校验过的数据
  });

  res.json(updatedTodo);
};

// 4. 删除任务
export const deleteTodo = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.todo.delete({
    where: { id },
  });

  res.json({ message: '删除成功' });
};