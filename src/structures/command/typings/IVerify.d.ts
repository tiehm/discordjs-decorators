/*
 * Copyright (c) 2019., Charlie Tiehm - admin@tiehm.me
 */

export interface IVerify {
    permission?: boolean;
    syntax?: boolean;
    throttle?: boolean;
    nsfw?: boolean;
    role?: boolean;
    guild?: boolean;
    dm?: boolean;
    owner?: boolean;
    verify?: boolean;
    restricted?: boolean;
    channel?: boolean;
}
