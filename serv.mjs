import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { parse as parsePath } from 'node:path';
import { URL } from 'node:url';


const
  database = new DatabaseSync('./list.sqlite');

database.exec(`
CREATE TABLE if not exists list (
  id INTEGER PRIMARY KEY,
   checked CHARACTER VARYING(30), 
      text CHARACTER VARYING(30)
      )`);

const
  selectAllSt = () => database.prepare(`
    SELECT *
    FROM list `),
  addSt = database.prepare(`
      INSERT INTO list (id, text, checked) values(?, ?, 'false') `),
  deleteSt = database.prepare(`
      DELETE from list where id=? `),
  updateSt = database.prepare(`
          UPDATE list set text = ?, checked = 'true' where id=?`);


const
  port = 3333;


createServer(async (request, response) => {
  log(request.method, request.url, 'HTTP/' + request.httpVersion);
  const
    urlObject = new URL(request.url, `http://${request.headers.host}`),
    path = parsePath(urlObject.pathname),
    id = path.name;
  console.log('parsing', { path, id });
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  switch (true) {
    case '/todo' === path.dir || 'todo' === path.base:
      switch (request.method) {
        case 'OPTIONS':
          response.writeHead(204);
          break;
        case 'GET':
          response.setHeader('content-type', 'application/json; charset=utf-8');
          response.write(JSON.stringify(selectAllSt().all()));

          response.statusCode = 200;
          break;
        case 'POST':
          const
            { id, text } = JSON.parse(await postData(request));
          addSt.run(id, text);
          response.statusCode = 201;
          break;
        case 'DELETE':
          deleteSt.run(id);
          response.statusCode = 200;
          break;
        case 'PATCH':
          const
            data = JSON.parse(await postData(request));
          updateSt.run(data.text, data.id);
          response.statusCode = 200;
          break;
      }

      break;
    default:
      response.statusCode = 404;
  }
  response.end();
}).listen(port, () => {
  log('Server start at http://localhost:' + port);
});

function log(...params) {
  console.log((new Date()).toLocaleTimeString(), ...params);
}


async function postData(request) {
  const buffers = [];
  for await (const chunk of request)
    buffers.push(chunk);
  return Buffer.concat(buffers).toString();
}
