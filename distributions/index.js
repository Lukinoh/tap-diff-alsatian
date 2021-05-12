"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _diff = require("diff");

var _chalk = _interopRequireDefault(require("chalk"));

var _duplexer = _interopRequireDefault(require("duplexer"));

var _figures = _interopRequireDefault(require("figures"));

var _through = _interopRequireDefault(require("through2"));

var _tapParser = _interopRequireDefault(require("tap-parser"));

var _prettyMs = _interopRequireDefault(require("pretty-ms"));

var _jsondiffpatch = _interopRequireDefault(require("jsondiffpatch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const INDENT = '  ';
const FIG_TICK = _figures.default.tick;
const FIG_CROSS = _figures.default.cross;

const createReporter = () => {
  const output = (0, _through.default)();
  const p = new _tapParser.default();
  const stream = (0, _duplexer.default)(p, output);
  const startedAt = Date.now();

  const println = (input = '', indentLevel = 0) => {
    let indent = '';

    for (let i = 0; i < indentLevel; ++i) {
      indent += INDENT;
    }

    input.split('\n').forEach(line => {
      output.push(`${indent}${line}`);
      output.push('\n');
    });
  };

  const handleTest = name => {
    println();
    println(_chalk.default.blue(name), 1);
  };

  const handleAssertSuccess = assert => {
    const name = assert.name;
    println(`${_chalk.default.green(FIG_TICK)}  ${_chalk.default.dim(name)}`, 2);
  };

  const toString = arg => Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();

  const JSONize = str => {
    return str // wrap keys without quote with valid double quote
    .replace(/([\$\w]+)\s*:/g, (_, $1) => '"' + $1 + '":') // replacing single quote wrapped ones to double quote
    .replace(/'([^']+)'/g, (_, $1) => '"' + $1 + '"');
  };

  const handleAssertFailure = assert => {
    const name = assert.name;

    const writeDiff = ({
      value,
      added,
      removed
    }) => {
      let style = _chalk.default.white;
      if (added) style = _chalk.default.green.inverse;
      if (removed) style = _chalk.default.red.inverse; // only highlight values and not spaces before

      return value.replace(/(^\s*)(.*)/g, (m, one, two) => one + style(two));
    }; // Diag fromat received from alsatian
    // {
    //   message: 'Expected 2 to be 4.',
    //   severity: 'fail',
    //   data: { got: '2', expect: '4' }
    // }


    let {
      message,
      severity,
      data: {
        got,
        expect
      }
    } = assert.diag;
    let at = 'Not implemented';
    let actual = got;
    let expected = expect;
    let expected_type = toString(expected);

    if (expected_type !== 'array') {
      try {
        // the assert event only returns strings which is broken so this
        // handles converting strings into objects
        if (expected.indexOf('{') > -1) {
          actual = JSON.stringify(JSON.parse(JSONize(actual)), null, 2);
          expected = JSON.stringify(JSON.parse(JSONize(expected)), null, 2);
        }
      } catch (e) {
        try {
          actual = JSON.stringify(eval(`(${actual})`), null, 2);
          expected = JSON.stringify(eval(`(${expected})`), null, 2);
        } catch (e) {// do nothing because it wasn't a valid json object
        }
      }

      expected_type = toString(expected);
    }

    println(`${_chalk.default.red(FIG_CROSS)}  ${_chalk.default.red(name)} at ${_chalk.default.magenta(at)}`, 2);

    if (message) {
      println(`${(0, _chalk.default)(message)}`, 4);
    }

    if (expected_type === 'object') {
      const delta = _jsondiffpatch.default.diff(actual[failed_test_number], expected[failed_test_number]);

      const output = _jsondiffpatch.default.formatters.console.format(delta);

      println(output, 4);
    } else if (expected_type === 'array') {
      const compared = (0, _diff.diffJson)(actual, expected).map(writeDiff).join('');
      println(compared, 4);
    } else if (expected === 'undefined' && actual === 'undefined') {
      ;
    } else if (expected_type === 'string') {
      const compared = (0, _diff.diffWords)(actual, expected).map(writeDiff).join('');
      println(compared, 4);
    } else {
      println(_chalk.default.red.inverse(actual) + _chalk.default.green.inverse(expected), 4);
    }
  };

  const handleComplete = result => {
    const finishedAt = Date.now();
    println();
    println(_chalk.default.green(`passed: ${result.pass}  `) + _chalk.default.red(`failed: ${result.fail || 0}  `) + _chalk.default.white(`of ${result.count} tests  `) + _chalk.default.dim(`(${(0, _prettyMs.default)(finishedAt - startedAt)})`));
    println();

    if (result.ok) {
      println(_chalk.default.green(`All of ${result.count} tests passed!`));
    } else {
      println(_chalk.default.red(`${result.fail || 0} of ${result.count} tests failed.`));
      stream.isFailed = true;
    }

    println();
  };

  p.on('comment', comment => {
    const trimmed = comment.replace('# ', '').trim();
    if (/^tests\s+[0-9]+$/.test(trimmed)) return;
    if (/^pass\s+[0-9]+$/.test(trimmed)) return;
    if (/^fail\s+[0-9]+$/.test(trimmed)) return;
    if (/^ok$/.test(trimmed)) return;
    handleTest(trimmed);
  });
  p.on('assert', assert => {
    if (assert.ok) return handleAssertSuccess(assert);
    handleAssertFailure(assert);
  });
  p.on('complete', handleComplete);
  p.on('child', child => {
    ;
  });
  p.on('extra', extra => {
    println(_chalk.default.yellow(`${extra}`.replace(/\n$/, '')), 4);
  });
  return stream;
};

var _default = createReporter;
exports.default = _default;