#!/usr/bin/env node
"use strict";

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const reporter = (0, _index.default)();
process.stdin.pipe(reporter).pipe(process.stdout);
process.on('exit', status => {
  if (status === 1 || reporter.isFailed) process.exit(1);
});