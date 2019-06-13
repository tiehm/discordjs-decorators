/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import chalk from 'chalk';
import { DiscordAPIError } from 'discord.js';
import * as moment from 'moment';

const loggers: Map<string, Logger> = new Map<string, Logger>();

/**
 * The logger
 */
export class Logger {

    /**
     * Outputs the message to the console
     * @param text {String} The message to log
     * @static
     */
    private static write(text: string) {
        process.stdout.write(`${text}\n`);
    }

    /**
     * Format a message to include the log name and the current time
     * @returns {String}
     */
    private static format(name: string): string {
        return chalk.gray(`[${moment().format('HH:mm:ss')}] [${name}] `);
    }

    /**
     * The name displayed when logging
     * @property {String} name
     */
    private readonly name: string;

    /**
     * @param name {String} The name displayed when logging something
     * @returns {Logger}
     */
    constructor(name: string) {
        this.name = name.toUpperCase();
    }

    /**
     * Log something without any format, this equals a console.log
     * @param msg {String} The message to log
     */
    public rawLog(msg: string) {
        Logger.write(msg);
    }

    /**
     * Logs the error
     * @param err {String|Error} The message or error to log
     */
    public error(err: string|Error|DiscordAPIError) {
        if (!err) return;
        if (typeof err === 'string' || !err.stack) {
            // @ts-ignore
            const msg = Logger.format(this.name) + chalk.red(err);
            Logger.write(msg);
        } else if (err.name !== 'DiscordAPIError') {
            const [name, ...stack] = err.stack!.split('\n');
            // tslint:disable-next-line:prefer-template
            const msg = Logger.format(this.name) + `${chalk.red(name)}\n${chalk.gray(stack.join('\n'))}`;
            Logger.write(msg);
        } else {
            const { name, message, stack, code, method, path } = err as DiscordAPIError;
            // tslint:disable-next-line:prefer-template
            const msg = Logger.format(this.name) +
`${chalk.red(name)}: ${chalk.redBright(message + ' [Code ' + code + ']')}
${chalk.gray(stack!.split('\n').slice(1).join('\n'))}
${chalk.white('Path: ' + path)}
${chalk.white('Method: ' + method)}
`;
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is not restricted to errors only
     * @param text {String} The message to log
     */
    public warn(text: string) {
        if (process.env.LOGLEVEL !== 'ERROR') {
            const msg = Logger.format(this.name) + chalk.yellow(text);
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is not restricted to errors or warns only
     * @param text {String} The message to log
     */
    public log(text: string) {
        if (process.env.LOGLEVEL === 'DEBUG' || process.env.LOGLEVEL === 'ALL') {
            const msg = Logger.format(this.name) + text;
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is in debug mode
     * @param text {String} The message to log
     */
    public debug(text: string) {
        if (process.env.LOGLEVEL === 'DEBUG') {
            const msg = Logger.format(this.name) + chalk.magenta(text);
            Logger.write(msg);
        }
    }

}

export function logger(type?: string): PropertyDecorator {
    return function (target: Object, propertyKey: string|symbol) {
        // tslint:disable-next-line
        if (!type) type = target.constructor.name;
        // tslint:disable-next-line
        type = type.toUpperCase();
        const log = loggers.get(type) || new Logger(type);
        if (!loggers.get(type)) loggers.set(type, log);
        Object.defineProperty(target, propertyKey, {
            value: log
        });
    };
}
