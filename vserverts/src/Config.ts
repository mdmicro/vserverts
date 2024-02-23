import {OnvifInfo} from "./VideoCam";
import {access, readFile, writeFile} from "fs/promises";
import path from "node:path";


export const globalConfigPath = path.join(process.cwd(), '/config.json');

export const readConfig = async (): Promise<GlobalConfig> => {
    console.log(globalConfigPath)
    try {
        await access(globalConfigPath)
        const res = await readFile(globalConfigPath)?.toString();
        return JSON.parse(res);
    } catch (e) {
        const config: GlobalConfig = {
            cams: [],
            recordSetting: {
                path: './',
                intervalRecordMinut: 5,
                maxArchiveSizeGb: undefined
            }
        };
        await writeFile(globalConfigPath,JSON.stringify(config));
        return config;
    }
}

export interface GlobalConfig {
    cams: OnvifInfo[];
    recordSetting: {
        path: string;
        intervalRecordMinut: number;
        maxArchiveSizeGb: number | undefined;
    }
}