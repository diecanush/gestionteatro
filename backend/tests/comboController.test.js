process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';

// Dynamically import modules after setting NODE_ENV so the test
// database configuration is used.
const sequelize = (await import('../config/database.js')).default;
const { Combo, ComboItem, SnackBarProduct } = await import('../models/index.js');
const comboRoutes = (await import('../routes/combos.js')).default;

const app = express();
app.use(express.json());
app.use('/combos', comboRoutes);

// Close the database connection once all tests have completed.
test.after(async () => {
  await sequelize.close();
});

test('combo routes', async (t) => {
  // Helper to reset database and seed required products
  const seed = async () => {
    await sequelize.sync({ force: true });
    await SnackBarProduct.bulkCreate([
      { id: 'prod1', name: 'Soda', category: 'Gaseosa' },
      { id: 'prod2', name: 'Chips', category: 'Snack' },
    ]);
  };

  await t.test('GET /combos returns empty list', async () => {
    await seed();
    const res = await request(app).get('/combos');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, []);
  });

  await t.test('GET /combos returns existing combos', async () => {
    await seed();
    const combo = await Combo.create({ id: 'combo1', name: 'Combo 1', price: 10 });
    const item = await ComboItem.create({ comboId: combo.id, name: 'Drink', quantity: 1 });
    const product = await SnackBarProduct.findByPk('prod1');
    await item.setOptions([product]);

    const res = await request(app).get('/combos');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].components.length, 1);
    assert.deepStrictEqual(res.body[0].components[0].productIds, ['prod1']);
  });

  await t.test('POST /combos creates combo with components', async () => {
    await seed();
    const comboData = {
      name: 'Combo A',
      price: 15,
      components: [
        { name: 'Drink', quantity: 1, productIds: ['prod1'] },
        { name: 'Snack', quantity: 2, productIds: ['prod2'] },
      ],
    };

    const res = await request(app).post('/combos').send(comboData);
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.components.length, 2);
    const ids = res.body.components.map((c) => c.productIds[0]).sort();
    assert.deepStrictEqual(ids, ['prod1', 'prod2']);
  });

  await t.test('PUT /combos/:id updates combo', async () => {
    await seed();
    const initial = {
      name: 'Combo A',
      price: 10,
      components: [{ name: 'Drink', quantity: 1, productIds: ['prod1'] }],
    };
    const created = await request(app).post('/combos').send(initial);
    const comboId = created.body.id;

    const update = {
      name: 'Combo B',
      price: 20,
      components: [{ name: 'Snack', quantity: 2, productIds: ['prod2'] }],
    };

    const res = await request(app).put(`/combos/${comboId}`).send(update);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.name, 'Combo B');
    assert.strictEqual(res.body.components.length, 1);
    assert.deepStrictEqual(res.body.components[0].productIds, ['prod2']);
  });
});

