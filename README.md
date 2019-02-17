# Discord Decorators


![CRAN](https://img.shields.io/cran/l/devtools.svg?style=for-the-badge) ![CRAN](https://img.shields.io/badge/Built%20With-Typescript-yellow.svg?style=for-the-badge) ![CRAN](https://img.shields.io/badge/Linted%20By-tslint-purple.svg?style=for-the-badge) 
![Travis (.com) branch](https://img.shields.io/travis/com/tiehm/discord-decorators/master.svg?style=for-the-badge)


> This framework is made for users using typescript, **I do not support the use of plain Javascript**

> This project is using typescript's decorator, you have to set the ``experimentalDecorators`` option to ``true`` in your tsconfig file.

Developer orientated ``discord.js`` Framework based on Typescript.

## Features

- Simple to use
- Powerful
- A lot of configuration possible

## Getting Started

Please look [here](.github/CONTRIBUTING.md) for details on how to get running on a dev environment.

### Prerequisites

What things you need to install the software and how to install them

```
npm i discord.js --save
```

### Installing
Install with

```bash
npm i discordjs-decorators --save # yarn add discordjs-decorators
```

and install ``discord.js``

```bash
npm i discord.js --save # yarn add discord.js
```

You can now use ``discordjs-decorators`` in your project.

## Running the tests

### Unit tests
````bash
yarn only-test
````

### Code style

```bash
yarn lint 
```

### Implementation tests

> Important: You need to setup a config(.js) file in the ``test`` folder which exports a JSON object with a token and owner property.

````bash
yarn test:discord
````

## Built With

* [discord.js](https://www.npmjs.com/package/discord.js)
* [Typescript](https://www.typescriptlang.org/)
* [glob](https://www.npmjs.com/package/glob)
* [chalk](https://www.npmjs.com/package/chalk)

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details.

## License

This project is licensed under the [GNU General Public License v2.0](LICENSE).

## Acknowledgments

This project is inspired by [yamdbf](https://github.com/yamdbf/core).

