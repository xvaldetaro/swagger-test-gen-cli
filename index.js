#!/usr/bin/env node
'use strict';

var stt = require('swagger-test-templates');
var cli = require('cli');
var fs = require('fs');
var path = require('path');
var ymlRefs = require('yaml-refs');

cli.setUsage('swagger-test-templates-cli [OPTIONS] inputYMLfile outputDir');

var opts = cli.parse({
  paths: ['p', 'Comma separated list of paths', 'string'],
  supertest: ['s', 'Is supertest', true]
});

cli.main(function (args, options) {
  var inputFile = args.shift();
  if (!fs.statSync(inputFile).isFile()) {
    cli.output('input file is invalid');
    return;
  }

  var outputDir = args.shift();
  if (!fs.statSync(outputDir).isDirectory()) {
    cli.output('output dir is invalid');
    return;
  }

  var config = {
    assertionFormat: 'should',
    testModule: opts.supertest ? 'supertest' : 'request',
    pathName: [],
    maxLen: 90,
    statusCodes: [200, 500]
  };

  if (options.paths) {
    config.pathName = opts.paths.split(',');
  }

  ymlRefs(path.join(inputFile)).catch(function (error) {
    return cli.output(error);
  }).then(function (swagger) {
    var files = stt.testGen(swagger, config);
    files.forEach(function (file) {
      return fs.writeFile(path.join(outputDir, file.name), file.test, function (err) {
        if (err) {
          cli.output(err);
        }
      });
    });
    cli.output('Successfully wrote test to files: ');
    files.forEach(function (file) {
      return cli.output(file.name);
    });
  });
});
