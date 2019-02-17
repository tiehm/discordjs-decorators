/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

import { Message } from 'discord.js';

/**
 * This stores all argument decorators
 */
export const argumentStore: Array<{
    value: (msg: Message) => any,
    name: string,
    index: number
}> = [];
