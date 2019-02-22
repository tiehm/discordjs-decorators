/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

export interface IOnlyOptions {
    dm: boolean;
    guild: boolean;
    [id: string]: boolean;
}
