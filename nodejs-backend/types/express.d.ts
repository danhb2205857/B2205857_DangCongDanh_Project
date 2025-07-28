declare module 'express' {
  import * as express from 'express';
  export = express;
}

declare module 'jsonwebtoken' {
  const jwt: any;
  export = jwt;
}