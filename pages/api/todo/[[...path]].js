import { neon } from '@neondatabase/serverless';
import { parse } from 'node:path';
import { URL } from 'node:url';



const sql = neon(process.env.POSTGRES_URL);
console.log('sql=',sql);
export default async function todo(request, response) {
  const
    { query, method } = request,
    { path } = query,
    id = path?.[0];
  console.log('parsing', request.method, { path, id });

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  switch (method) {
    case 'OPTIONS':
      response.writeHead(204);
      return;
    case 'GET':
      response.setHeader('content-type', 'application/json; charset=utf-8');
      const rowsGet = await sql`SELECT * FROM list`;
      response.status(200).json(rowsGet);
      return;
    case 'POST':
      const idGen = Math.floor(Math.random() * 100) + 1;
      const addSt = await sql`INSERT INTO list (id, text, checked) VALUES(${idGen}, ${request.body.text},'false')`;
      console.log('addSt=', addSt);
      response.status(201).send();

      return;
    case 'DELETE':
      const
        result = await sql`DELETE from list WHERE id = ${id}`;
      console.log('result=', result);
      response.status(200).send();
      return;
    //break;
    case 'PATCH':
      const
        setSt = await sql`UPDATE list set text = ${request.body.text}, checked = 'true' where id = ${id}`;
      console.log('setSt=', setSt);
      response.status(200).send();
      return;
  }
}

async function postData(request) {
  const buffers = [];
  for await (const chunk of request)
    buffers.push(chunk);
  return Buffer.concat(buffers).toString();
}
