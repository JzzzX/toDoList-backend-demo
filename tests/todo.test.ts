import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 每个测试运行前，先清空数据库，保证环境干净 (在真实项目中通常连接专门的测试数据库)
beforeAll(async () => {
  await prisma.todo.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Todo API 接口测试', () => {
  
  // 测试 1: 创建任务 (正常情况)
  it('POST /api/todos - 应该能创建一个新任务', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: '测试任务 Jest',
        priority: 2
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('测试任务 Jest');
    expect(res.body.priority).toBe(2);
    expect(res.body.id).toBeDefined();
  });

  // 测试 2: 参数校验 (异常情况)
  it('POST /api/todos - 如果标题为空，应该报错', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        priority: 1
        // 故意不传 title
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('参数校验失败');
  });

  // 测试 3: 获取列表
  it('GET /api/todos - 应该能获取任务列表', async () => {
    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    // 因为刚才创建了一个，所以数组长度应该 >= 1
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});