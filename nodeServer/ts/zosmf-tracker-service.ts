/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Response, Request } from "express";
import { Router } from "express-serve-static-core";

const net = require('net');
const express = require('express');
const Promise = require('bluebird');

class ZosmfTrackerService{
  private context: any;
  private router: Router;

  constructor(context: any){
    this.context = context;
    let router = express.Router();
    router.get('/',function(req: Request,res: Response) {
      const host = req.query['host'];
      const port = req.query['port'];
      if (!!host && !!port) {
        try {
          const client = net.createConnection({host: host, port: +port})
            .on('connect', () => {
              res.status(200).send({online: true});
              client.end();
            })
            .on('error', (err) => {
              res.status(200).send({online: false, error: err.message});
            });
        } catch(err) {
          res.status(200).send({online: false, error: err.message});
        }
      } else {
        res.status(500).send({online: false, error: 'No host and/or port specified in GET query parameters'});
      }
    });
    this.router = router;
  }

  
  getRouter():Router{
    return this.router;
  }
}

exports.zosmfTrackerRouter = function(context): Router {
  return new Promise(function(resolve, reject) {
    let dataservice = new ZosmfTrackerService(context);
    resolve(dataservice.getRouter());
  });
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
