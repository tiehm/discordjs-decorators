/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import chalk from 'chalk';
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
        return this;
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
    public error(err: string|Error) {
        if (typeof err === 'string') {
            const msg = this.format() + chalk.red(err);
            Logger.write(msg);
        } else {
            const [name, ...stack] = err.stack.split('\n');
            const msg = `${this.format() + chalk.red(name)}\n${chalk.gray(stack.join('\n'))}`;
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is not restricted to errors only
     * @param text {String} The message to log
     */
    public warn(text: string) {
        if (process.env.LOGLEVEL !== 'ERROR') {
            const msg = this.format() + chalk.yellow(text);
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is not restricted to errors or warns only
     * @param text {String} The message to log
     */
    public log(text: string) {
        if (process.env.LOGLEVEL === 'DEBUG' || process.env.LOGLEVEL === 'ALL') {
            const msg = this.format() + text;
            Logger.write(msg);
        }
    }

    /**
     * Log the message if the log level is in debug mode
     * @param text {String} The message to log
     */
    public debug(text: string) {
        if (process.env.LOGLEVEL === 'DEBUG') {
            const msg = this.format() + chalk.magenta(text);
            Logger.write(msg);
        }
    }

    /**
     * Format a message to include the log name and the current time
     * @returns {String}
     */
    private format(): string {
        return chalk.gray(`[${moment().format('HH:mm:ss')}] [${this.name}] `);
    }

}

export function logger(type?: string): PropertyDecorator {
    return function (target: Object, propertyKey: string) {
        // tslint:disable-next-line
        if (!type) type = target.constructor.name;
        // tslint:disable-next-line
        type = type.toUpperCase();
        const log = loggers.get(type) || new Logger(type);
        Object.defineProperty(target, propertyKey, {
            value: log
        });
    };
}
