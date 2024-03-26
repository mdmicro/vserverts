import {access, readFile, writeFile} from "fs/promises";
import path from "node:path";
import {OnvifInfoCam} from "./Menu/Cam";


export const globalConfigPath = path.join(process.cwd(), '/config.json');

export const readConfig = async (): Promise<GlobalConfig> => {
    try {
        await access(globalConfigPath)
        const config = (await readFile(globalConfigPath))?.toString();
        return JSON.parse(config);
    } catch (e) {
        const config: GlobalConfig = {
            cams: [],
            recordSetting: {
                path: './',
                intervalRecordMinut: 5,
            }
        };
        return config;
    }
}

export const saveConfig = async (config: GlobalConfig): Promise<void> => {
    await writeFile(globalConfigPath,JSON.stringify(config));
}

export interface GlobalConfig {
    cams: OnvifInfoCam[];
    recordSetting: RecordSetting;
}

export interface RecordSetting {
    path: string;
    intervalRecordMinut: number;
    maxArchiveSizeGb?: number;
}
