import { cmdPrefix } from "config";

export const configuration = {
    prefix: cmdPrefix, //Default custom command prefix
    multiThreadingEnabled: true, // Whether multithreading is enabled, if not, any created threads are processed immediately
    multiThreadingTimeBudget: 32, // How long (in milliseconds) active threads are allowed to run before pausing a bit
};
