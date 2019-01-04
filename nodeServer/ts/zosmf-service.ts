/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Response, Request } from "express";
import { Router } from "express-serve-static-core";
import { ServerResponse, ServerRequest, IncomingMessage } from "http";

const https = require('https');
const express = require('express');
const Promise = require('bluebird');
const bodyParser = require('body-parser');

class ZosmfService{
  private context: any;
  private router: Router;
  private manager: any;
  private ready: boolean = true;

  constructor(context: any){
    this.context = context;
    let router = express.Router();
    router.all('/*',(req: Request, res: Response)=> {
      const zosmfHostAndPort = ZosmfService.extractZosmfHostAndPort(req);
      if (zosmfHostAndPort) {
        ZosmfService.makeZosmfRequest(req, res, zosmfHostAndPort.host, zosmfHostAndPort.port, req.body, req.url);
      } else {
        res.status(500).send(`No z/osmf host and/or port on request headers`);
      }
    });
    router.use(bodyParser.text());
    this.router = router;
  }

  private static extractZosmfHostAndPort(req: Request) {
    const port = req.get('zosmf-port');
    const host = req.get('zosmf-host');
    if (!!host && !!port) {
      return {
        host: host,
        port: port
      };
    } else {
      return null;
    }
  };  

  private static makeZosmfRequestOptions(request: Request, zosmfHost: string, zosmfPort: string, serviceSubUrl: string) {
    let headers = request.headers;
    let zosmfRequestHeaders = {};
    let removeCookies = false;
    for (let header in headers) {
      if (headers.hasOwnProperty(header)) {
        if (header === "host") {
          zosmfRequestHeaders[header] = `${zosmfHost}:${zosmfPort}`;
        } else if (header === "origin") {
          zosmfRequestHeaders[header] = `https://${zosmfHost}:${zosmfPort}`;
        } else if (header === "referer") {
          zosmfRequestHeaders[header] = `https://${zosmfHost}:${zosmfPort}/zosmf/`;
        } else if (header === "zosmf-authorization") {
          zosmfRequestHeaders['authorization'] = headers[header];
          removeCookies = true;
        } else if (!header.startsWith("zosmf-")) {
          zosmfRequestHeaders[header] = headers[header];
        }
      }
    }
    if (removeCookies) {
      zosmfRequestHeaders['set-cookie'] = [];
    }
    const zosmfRequestOptions = {
      method: request.method,
      host: zosmfHost,
      port: zosmfPort,
      headers: zosmfRequestHeaders,
      rejectUnauthorized: false, //allows self-signed certs
      path: request.originalUrl.substring(request.originalUrl.indexOf(`/${serviceSubUrl}`)+1)
    };
    return zosmfRequestOptions;
  }

  private static makeZosmfRequest(request: Request, response: Response, zosmfHost: string, zosmfPort: string,
                                  requestBody: string, serviceSubUrl: string) {
    const zosmfRequestOptions = ZosmfService.makeZosmfRequestOptions(request, zosmfHost, zosmfPort, serviceSubUrl);
    const zosmfRequest = https.request(zosmfRequestOptions, (zosmfResponse: IncomingMessage) => {
      ZosmfService.transformZosmfResponse(zosmfResponse);
      response.writeHead(zosmfResponse.statusCode, zosmfResponse.statusMessage, zosmfResponse.headers);
      zosmfResponse.pipe(response);
    }).on('error', (err) => {
      response.status(500).send(err.message);
    });
    if (!!requestBody) {
      zosmfRequest.write(requestBody);
    }
    request.pipe(zosmfRequest);
  }

  private static transformZosmfResponse(zosmfResponse: IncomingMessage) {
    ZosmfService.transformZosmfResponseCookies(zosmfResponse);
    ZosmfService.transformZosmfResponseStatusCode(zosmfResponse);
  }

  private static transformZosmfResponseStatusCode(zosmfResponse: IncomingMessage) {
    if (zosmfResponse.statusCode === 401) {
      zosmfResponse.statusCode = 403;
    }
  }

  private static transformZosmfResponseCookies(zosmfResponse: IncomingMessage) {
    let zosmfResponseCookies = zosmfResponse.headers['set-cookie'];
    if (Array.isArray(zosmfResponseCookies)) {
      zosmfResponseCookies = zosmfResponseCookies.map(cookie => cookie.replace(/Domain\=[^;]+;/, ''));
      zosmfResponseCookies = zosmfResponseCookies.map(cookie => cookie.replace(/Secure;/, ''));
      zosmfResponseCookies = zosmfResponseCookies.map(cookie => cookie.replace(/HttpOnly/, ''));
      zosmfResponse['set-cookie'] = zosmfResponseCookies;
    }
  }
  
  getRouter():Router{
    return this.router;
  }
}

exports.zosmfServiceRouter = function(context): Router {
  return new Promise(function(resolve, reject) {
    let dataservice = new ZosmfService(context);
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
