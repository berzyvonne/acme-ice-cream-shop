const express = require('express');
const pg = require('pg');
const morgan = require('morgan');

const app = express();
const { Client } = pg;

const client = new Client(
  process.env.DATABASE_URL ||
    'postgres://localhost/acme-ice-cream-shop'
);

app.use(express.json());
app.use(morgan('dev'));

// create // post
app.post("/api/flavors ", async (req, res, next) => {
    try {
      const SQL = `
      INSERT INTO flavors(txt)
      VALUES($1)
      RETURNING *
      `;
  
      const response = await client.query(SQL, [req.body.txt]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

// get all flavors
app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC;`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });  

//  get flavor by id
app.get("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors WHERE id = $1;`; // select specific id
      const response = await client.query(SQL, [req.params.id]);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

  //update flavor
app.put("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = `
          UPDATE flavors
          SET name=$1, is_favorite=$2, updated_at=now()
          WHERE id=$3 RETURNING *`;
  
      const response = await client.query(SQL, [
        req.body.name,
        req.body.is_favorite,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  //delete flavor, returns nothing
  app.delete("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = `
          DELETE from flavors
          WHERE id = $1`;
  
      const response = await client.query(SQL, [req.params.id]);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

// init function
const init = async () => {
    await client.connect();
    console.log("connected to database");
  
    let SQL = `
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL, 
          is_favorite BOOLEAN,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
      );
      INSERT INTO flavors(name, is_favorite) VALUES('mint chocolate', true);
      INSERT INTO flavors(name, is_favorite) VALUES('chocolate', true);
      INSERT INTO flavors(name, is_favorite) VALUES('vanilla', false);
      INSERT INTO flavors(name, is_favorite) VALUES('strawberry', false);
    `;
    await client.query(SQL);
    console.log("flavors created");
  
    SQL = ``;
    await client.query(SQL);
    console.log("data seeded");
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  };

//   init function invocation
init();