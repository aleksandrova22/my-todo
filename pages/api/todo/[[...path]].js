import { neon } from '@neondatabase/serverless';
import { parse } from 'node:path';
import { URL } from 'node:url';
const sql = neon(process.env.POSTGRES_URL);

// const
//   selectAllSt = () => sql`SELECT * FROM list`,
//   addSt = ()=> sql`INSERT INTO list (id, text, checked) VALUES ('${id}','${text}','true')`,
//   //deleteSt = (id) => sql`DELETE from list where id=${id}`,
//   updateSt = sql`UPDATE list set text = ?, checked = 'true' where id=?`;


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
      break;
    case 'GET':
      response.setHeader('content-type', 'application/json; charset=utf-8');
      const rowsGet = await sql`SELECT * FROM list`;
      response.status(200).json(rowsGet);
      break;
    case 'POST':
      const
        { id, text } = JSON.parse(await postData(request));
      addSt(id, text);
      response.statusCode = 201;
      break;
    case 'DELETE':
      const
        result = await sql`DELETE from list WHERE id = ${{id}}`;
      console.log('result=', result);
      response.status(200).send();
      return;

    //break;
    case 'PATCH':
      const
        data = JSON.parse(await postData(request));
      updateSt.run(data.text, data.id);
      response.statusCode = 200;
      break;

  }





  //response.status(200).json( rows );
}




async function postData(request) {
  const buffers = [];
  for await (const chunk of request)
    buffers.push(chunk);
  return Buffer.concat(buffers).toString();
}
