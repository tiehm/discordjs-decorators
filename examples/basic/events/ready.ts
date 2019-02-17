import { Event, Once } from '../../../src';

@Once('ready')
export class Ready extends Event {

    public run() {
        console.log(`Logged in as ${this.client.user.tag}`);
    }

}
