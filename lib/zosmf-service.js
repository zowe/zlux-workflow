

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

let https = require('https');
const obfuscator = require ('../zlux-shared/src/obfuscator/htmlObfuscator.js');

 // Fix for an issue with a zosmf certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.zosmfServiceInstaller = function (dataservice, methods, manager) {
  return new ZosmfServiceHandler(dataservice, methods, manager);
};

function ZosmfServiceHandler(dataservice, methods, manager) {
  this.manager = manager;
  this.ready = true;
}

ZosmfServiceHandler.prototype.handleRequest = function (request, response, bodyIn, subUrl) {
  const zosmfHostAndPort = this.extractZosmfHostAndPort(request);
  if (zosmfHostAndPort) {
    this.makeZosmfRequest(request, response, zosmfHostAndPort.host, zosmfHostAndPort.port, bodyIn, subUrl);
  } else {
    response.status(500).send('No z/osmf host and/or port on request headers');
  }
};

ZosmfServiceHandler.prototype.extractZosmfHostAndPort = function (request) {
  const headers = request.headers;
  const port = headers['zosmf-port'];
  const host = headers['zosmf-host'];
  if (!!host && !!port) {
    return {
      host: host,
      port: port
    };
  } else {
    return null;
  }
};

ZosmfServiceHandler.prototype.makeZosmfRequestOptions = function (request, zosmfHost, zosmfPort, serviceSubUrl) {
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
    path: request.originalUrl.substring(request.originalUrl.indexOf(`/${serviceSubUrl}`))
  };
  return zosmfRequestOptions;
};

ZosmfServiceHandler.prototype.makeZosmfRequest = function (request, response, zosmfHost,
                                                           zosmfPort, requestBody, serviceSubUrl) {
  const zosmfRequestOptions = this.makeZosmfRequestOptions(request, zosmfHost, zosmfPort, serviceSubUrl);
  const zosmfRequest = https.request(zosmfRequestOptions, (zosmfResponse) => {
    this.transformZosmfResponse(zosmfResponse,!(request.protocol == 'http'));
    response.writeHead(zosmfResponse.statusCode, zosmfResponse.statusMessage, zosmfResponse.headers);
    zosmfResponse.pipe(response);
  }).on('error', (err) => {
    var htmlObfuscator = new obfuscator.HtmlObfuscator();
    var safeMessage = htmlObfuscator.findAndReplaceHTMLEntities(safeMessage);
    response.status(500).send(safeMessage);
  });
  if (!!requestBody) {
    zosmfRequest.write(requestBody);
  }
  request.pipe(zosmfRequest);
};

ZosmfServiceHandler.prototype.transformZosmfResponse = function (zosmfResponse, secureConnection) {
  this.transformZosmfResponseCookies(zosmfResponse, secureConnection);
  this.transformZosmfResponseStatusCode(zosmfResponse);
};

ZosmfServiceHandler.prototype.transformZosmfResponseStatusCode = function (zosmfResponse) {
  if (zosmfResponse.statusCode === 401) {
    zosmfResponse.statusCode = 403;
  }
};

ZosmfServiceHandler.prototype.transformZosmfResponseCookies = function (zosmfResponse, secureConnection) {
    let zosmfResponseCookies = zosmfResponse.headers['set-cookie'];
    if (Array.isArray(zosmfResponseCookies)) {
      zosmfResponseCookies = zosmfResponseCookies.map(cookie => cookie.replace(/Domain\=[^;]+;/, ''));
      if (!secureConnection) {
        zosmfResponseCookies = zosmfResponseCookies.map(cookie => cookie.replace(/Secure;/, ''));
      }
      zosmfResponse.headers['set-cookie'] = zosmfResponseCookies;
    }
};


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

