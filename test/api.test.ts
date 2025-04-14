import fs from 'node:fs';
import path from 'node:path';
import supertest from 'supertest';
import app from '../src/api';
import type { Db } from '../src/db';

describe('API', () => {
  const wipeDb = (): void => {
    const filePath = path.resolve(__dirname, '../src/db.json');
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  };

  beforeEach(() => {
    wipeDb();
  });

  afterAll(() => {
    wipeDb();
  });

  type ReqBody = Readonly<{
    label: string;
    parentId: number;
  }>;

  it('must construct a predefined tree', async () => {
    const path = '/api/tree';
    {
      const tree: Db.Tree = [{ id: 1, label: 'root', children: [] }];
      await supertest(app).get(path).expect(200).expect(tree);
    }
    {
      const body: ReqBody = { label: 'bear', parentId: 1 };
      await supertest(app).post(path).send(body).expect(204);
    }
    {
      const body: ReqBody = { label: 'frog', parentId: 1 };
      await supertest(app).post(path).send(body).expect(204);
    }
    {
      const body: ReqBody = { label: 'cat', parentId: 2 };
      await supertest(app).post(path).send(body).expect(204);
    }
    {
      const body: ReqBody = { label: "cat's child", parentId: 4 };
      await supertest(app).post(path).send(body).expect(204);
    }
    {
      const body: ReqBody = { label: 'Invalid parent ID', parentId: 8 };
      await supertest(app).post(path).send(body).expect(400);
    }
    await supertest(app)
      .post(path)
      .send({ label: 'Missing parent ID.' })
      .expect(400);
    {
      const tree: Db.Tree = [
        {
          id: 1,
          label: 'root',
          children: [
            {
              id: 2,
              label: 'bear',
              children: [
                {
                  id: 4,
                  label: 'cat',
                  children: [
                    {
                      id: 5,
                      label: "cat's child",
                      children: [],
                    },
                  ],
                },
              ],
            },
            {
              id: 3,
              label: 'frog',
              children: [],
            },
          ],
        },
      ];
      await supertest(app)
        .get(path)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(tree);
        });
    }
  });

  it('must construct a randomly generated tree', async () => {
    const path = '/api/tree';
    for (let i = 0; i < 30; i++) {
      const parentId = Math.floor(Math.random() * i) + 1;
      const body: ReqBody = { label: `Node ${i + 2}`, parentId };
      await supertest(app).post(path).send(body).expect(204);
    }
    await supertest(app).get(path).expect(200);
  });
});
