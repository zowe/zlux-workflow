

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

const net = require('net');
const { HtmlObfuscator } = require('../../zlux-shared/src/obfuscator/htmlObfuscator.js');

exports.zosmfTrackerServiceInstaller = function (dataservice, methods, manager) {
  return new ZosmfTrackerServiceHandler(dataservice, methods, manager);
};

function ZosmfTrackerServiceHandler(dataservice, methods, manager) {
}

ZosmfTrackerServiceHandler.prototype.handleRequest = function (request, response, bodyIn, subUrl) {
  const host = request.query['host'];
  const port = request.query['port'];
  if (!!host && !!port) {
    var htmlObfuscator = new HtmlObfuscator();
    try {
      const client = net.createConnection({host: host, port: +port})
              .on('connect', () => {
                response.status(200).send({online: true});
                client.end();
              })
              .on('error', (err) => {
                var safeMessage = htmlObfuscator.findAndReplaceHTMLEntities(err.message);
                response.status(200).send({online: false, error: safeMessage});
              });
    } catch(err) {
      var safeMessage = htmlObfuscator.findAndReplaceHTMLEntities(err.message);
      response.status(200).send({online: false, error: safeMessage});
    }
  } else {
    response.status(500).send({online: false, error: 'No host and/or port specified in GET query parameters'});
  }
};


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

