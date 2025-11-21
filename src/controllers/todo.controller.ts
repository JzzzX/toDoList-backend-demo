import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 获取所有任务
export const getTodos = async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' } 
    });
    res.json(todos); 
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
};

// 2. 创建任务
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }

    const newTodo = await prisma.todo.create({
      data: {
        title,
        description, 
      },
    });
    
    res.status(201).json(newTodo); 
  } catch (error) {
    console.error("❌ 数据库操作失败:", error);
    res.status(500).json({ error: '创建任务失败' }); 
  }
};


// 3. 更新任务 
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { isCompleted } = req.body; 

    const updatedTodo = await prisma.todo.update({
      where: { id }, 
      data: {
        isCompleted, 
      },
    });

    res.json(updatedTodo);
  } catch (error) {
    // Prisma 如果找不到 ID 会抛错
    res.status(500).json({ error: '更新失败，可能是ID不存在' });
  }
};

// 4. 删除任务 
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.todo.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
};