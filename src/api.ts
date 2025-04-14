import express from 'express';
import Joi from 'joi';
import { Tree } from './tree';

const app = express();

app.use(express.json());

app.get('/api/tree', (_, res) => {
  res.json(Tree.read());
});

app.post('/api/tree', ({ body }, res) => {
  const schema = Joi.object({
    label: Joi.string().required(),
    parentId: Joi.number().integer().required(),
  });
  const { error, value } = schema.validate(body);
  if (error !== undefined) {
    res
      .status(400)
      .json({ error: error.details[0]?.message ?? 'Invalid request body.' });
    return;
  }
  if (!Tree.isValidId(value.parentId)) {
    res.status(400).json({ error: 'Nonexisting parent ID.' });
    return;
  }
  Tree.update(value);
  res.sendStatus(204);
});

export default app;
