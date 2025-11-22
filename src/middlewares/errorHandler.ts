import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// 全局异常处理中间件
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ 捕获到异常:", err); 

  // 处理 Zod 校验错误 (参数不对)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: '参数校验失败',
      details: err.issues.map(e => e.message), 
    });
  }

  // 处理 Prisma 数据库错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: '资源未找到' });
    }
  }

  // 处理其他未知错误 (500 Internal Server Error)
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message || 'Unknown error',
  });
};