import KB from './bot';

const KiraBot = new KB();

KiraBot.start().catch((e) => console.error(`Caught an error!\n${e}`));
