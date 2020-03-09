import * as MongoDB from "mongodb"
import { RequestHandler } from "express";
import * as crypto from "crypto"
const MongoClient = MongoDB.MongoClient;
import Xrray from "xrray"
Xrray(Array)


function createSessionKey() {
  return crypto.createHash('sha512').update(Math.random().toString() + "d726aloskjhe8721").digest("hex").toUpperCase();
}


export default function(uri: string, auth?: {username: string, password: string}, dbname: string = "webinquiry"): RequestHandler {
  
  let client: MongoDB.MongoClient
  if (auth) {
    uri = "mongodb://" + auth.username + ":" + auth.password + "@" + uri
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  else {
    uri = "mongodb://" + uri
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  
  
  client.connect()


  let db = client.db(dbname)

  let session = db.collection("session")
  let recording = db.collection("recording")
  let recordingMeta = db.collection("recordingMeta")



  const resolve = {
    auth: async (body: Auth) => {
      let sessKey = createSessionKey()
      if (!body.name) body.name = "Recording " + ((await session.countDocuments({})) + 1)

      await session.insertOne({
        name: body.name,
        defaultDelta: body.defaultDelta, 
        defaultProps: body.defaultProps, 
        sessKey
      })

      return {sessKey}
    },
    log: async (body: Log) => {
      session.findOne({sessKey: body.sessKey})
    }
  }

  return async function(req, res) {
    if (resolve[(req.body as Auth | Log).req]) res.send(await resolve[(req.body as Auth | Log).req](req.body))
  } as RequestHandler  
}


type Auth = {
  req: "auth";
  name?: string;
  defaultProps: {
      "keydown"?: {};
      "mousemove"?: {};
  } & {[key: string]: any};
  defaultDelta: number;
}
type Log = {
  req: "log";
  sessKey: string;
  data: {
      "keydown"?: {
          delta: number;
          props: {
              code: string;
          };
      }[];
      "mousemove"?: ({
          delta: number;
          props: {
              x: number;
              y: number;
          };
      } | {
          props: {
              x: number;
              y: number;
          };
          delta?: undefined;
      } & {[key: string]: {
        delta: number;
        props: {
            code: string;
        };
    }})[];
  }
}

let auth = {
  req: "auth",
  defaultProps: {
    "keydown": {},
    "mousemove": {},
  },
  defaultDelta: 16
};

let log = {
  reqe: "log",
  sessKey: "abcd",
  data: {
    "keydown": [
      {delta: 100000, props: {code: "Enter"}},
      {delta: 100000, props: {code: "KeyK"}}
    ],
    "mousemove": [
      {delta: 17, props: {x: 10, y: 14}},
      {delta: 15, props: {x: 12, y: 12}},
      {props: {x: 12, y: 22}},
      {delta: 15, props: {x: 22, y: 12}},
    ]
  }
}
