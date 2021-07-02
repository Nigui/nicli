nicli
=====

Multi-usage nigui CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nicli.svg)](https://npmjs.org/package/nicli)
[![Downloads/week](https://img.shields.io/npm/dw/nicli.svg)](https://npmjs.org/package/nicli)
[![License](https://img.shields.io/npm/l/nicli.svg)](https://github.com/Nigui/nicli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nicli
$ ni COMMAND
running command...
$ ni (-v|--version|version)
nicli/0.0.0 darwin-x64 node-v12.22.1
$ ni --help [COMMAND]
USAGE
  $ ni COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ni hello [FILE]`](#ni-hello-file)
* [`ni help [COMMAND]`](#ni-help-command)

## `ni hello [FILE]`

describe the command here

```
USAGE
  $ ni hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ ni hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/Nigui/nicli/blob/v0.0.0/src/commands/hello.ts)_

## `ni help [COMMAND]`

display help for ni

```
USAGE
  $ ni help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
