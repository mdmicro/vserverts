import * as onvif from 'node-onvif-ts';
import fs from 'fs';
import child from 'child_process';

export default class VideoCam {
    public videoCamXaddr: Array<string> = []; // ссылки на адрес видеокамер для запроса служебной информации
    public findedCams: OnvifInfo[] = [];
    private readonly pathVideo: string; // путь для хранения видеофайлов
    private pathScreenShot: string; // путь для хранения скриншотов
    private timeLimitVideoFilesMin: number;
    // private rtspUrl: Array<string | undefined> = [];
    private cams: Array<CamConfig>;

    constructor(pVideo: string, pScreenShot: string, timeLimitVideoFilesMin: number, ipCams: Array<CamConfig>) {
        this.pathVideo = pVideo;
        this.pathScreenShot = pScreenShot;
        this.timeLimitVideoFilesMin = timeLimitVideoFilesMin;
        this.cams = ipCams;

        // (async () => {
        //     for (let i = 0; i < ipCams.length; i += 1) {
        //         if (!ipCams[i].rtspUrl || ipCams[i].rtspUrl === '') {
        //             ipCams[i].rtspUrl = await this.findRtspUrl(ipCams[i].ip);
        //             console.log('rtsp Cam: ' + ipCams[i].rtspUrl);
        //         }
        //     }
        //     this.camRecordStart();
        // })();
    }

    public camRecordStart(): void {
        try {
            fs.accessSync(this.pathVideo, fs.constants.R_OK | fs.constants.W_OK);
            for (const cam of this.cams) {
                if (cam.rtspUrl && cam.rtspUrl !== '') {
                    console.log(`Cam '${cam.name}' record start`);
                    this.recordFromCam(cam.rtspUrl, cam.name, this.timeLimitVideoFilesMin);
                }
            }
        } catch (err) {
            console.error('Path for video record incorrect or not access!' +
                '\n Record from Cam not enabled!');
        }
    }


    /**
     * поиск видеокамер в сети
     *
     * {
		"urn": "urn:uuid:0c0ff42d-5566-7788-99aa-0012166fb223",
		"name": "NVT",
		"hardware": "IPC-model",
		"location": "china",
		"types": [
			"dn:NetworkVideoTransmitter"
		],
		"xaddrs": [
			"http://192.168.0.56:8899/onvif/device_service"
		],
		"scopes": [
			"onvif://www.onvif.org/type/video_encoder",
			"onvif://www.onvif.org/type/audio_encoder",
			"onvif://www.onvif.org/hardware/IPC-model",
			"onvif://www.onvif.org/location/country/china",
			"onvif://www.onvif.org/name/NVT",
			""
		]
	}
     */
    public async findCam(): Promise<boolean> {
        console.info('\n\n-------------------------------');
        console.info('Start the discovery cam process.');
        // Find the ONVIF network cameras.
        // It will take about 3 seconds.
        try {
            const deviceInfoList = await onvif.startProbe();
            if (deviceInfoList) {
                console.info('\n' + deviceInfoList.length + ' devices were found.');
                // Show the device name and the URL of the end point.
                for (const item of deviceInfoList) {
                    console.info('- ' + item.urn);
                    console.info('  - ' + item.name);
                    console.log('  - ' + item.xaddrs[0]);

                    this.videoCamXaddr.push(item.xaddrs[0]);
                    this.findedCams.push({
                        ...item,
                        rtspUrl: await VideoCam.getStreamUrl(item.xaddrs[0]),
                    });
                }
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }


    private async findRtspUrl(ip: string): Promise<string | undefined> {
        console.info('\n\n-------------------------------');
        console.info('Start the discovery cam process.');
        // Find the ONVIF network cameras.
        // It will take about 3 seconds.
        const deviceInfoList = await onvif.startProbe();
        if (deviceInfoList) {
            console.info('\n' + deviceInfoList.length + ' devices were found.');
            // Show the device name and the URL of the end point.
            for (const info of deviceInfoList) {
                console.info('- ' + info.urn);
                console.info('  - ' + info.name);
                console.log('  - ' + info.xaddrs[0]);

                if (info.xaddrs[0].includes(ip)) {
                    const url = await VideoCam.getStreamUrl(info.xaddrs[0], '', '');
                    if (url) {
                        return url;
                    }
                }
            }
        }
        return undefined;
    }

    /**
     * Получить ссылку на RTSP поток, логин и пароль необязательны
     * @param xaddr
     * @param login
     * @param psw
     */
    public static async getStreamUrl(xaddr: string, login?: string, psw?: string): Promise<string | undefined> {
        // Create an OnvifDevice object
        const device = new onvif.OnvifDevice({
            xaddr,
            user: login,
            pass: psw,
        });

        // Initialize the OnvifDevice object
        try {
            const camInfo = await device.init();
            const url = device.getUdpStreamUrl();
            console.info(camInfo);
            console.log('RTSP url: ' + url);
            return url;
        } catch (e: any) {
            throw new Error(e);
        }
    }

    //todo not worked
    public async screenShotFromCam(xaddr: string, objName: string, login?: string, pass?: string): Promise<void> {
        // Create an OnvifDevice object
        const dev = new onvif.OnvifDevice({
            xaddr,
            user: login,
            pass,
        });

        // Initialize the OnvifDevice object
        dev.init().then(() => {
            // Get the data of the snapshot
            console.info('fetching the data of the snapshot...');
            return dev.fetchSnapshot();
        }).then(res => {
            // Save the data to a file
            fs.writeFileSync(`${this.pathScreenShot}/snapshot_${objName}_.jpg`, res.body, {encoding: 'binary'});
            console.info('Done!');
        }).catch(error => {
            console.error(error);
        });
    }


    /**
     * Record RTSP stream from VideoCam
     * @param rtspUrl
     * @param objName -  имя объекта видеосъёмки
     * @param timeLimitMin - ограничение времени записи в файл, мин.
     */
    public recordFromCam(rtspUrl: string, objName: string, timeLimitMin: number): void {
        this.childFunc(this.cmdString(timeLimitMin, rtspUrl, objName), objName);

        setInterval(async () => this.childFunc(this.cmdString(timeLimitMin, rtspUrl, objName), objName), timeLimitMin * 60 * 1000);
    }

    /**
     * запуск дочернего процесса ffmpeg
     * @param cmd
     * @param name
     */
    private childFunc(cmd: FfmpegFileCfg, name: string): void {
        console.info(`Start_rec from ${name}`);
        // CamLog.saveCamLog(name, cmd.fileName, cmd.startDate, cmd.endDate);

        const exec = child.exec(cmd.cmdStr,
            // (error, stdout, stderr) {
            (error, stdout) => {
                if (error) {
                    console.error(error.stack);
                    console.error('Error code: ' + error.code);
                    console.error('Signal received: ' + error.signal);
                }
                console.log(stdout);
                // console.log('stderr: ' + stderr);
            });

        exec.on('data', data => {
            console.log(data);
        });
        exec.on('exit', () => {
            console.info(`End_rec for ${name}`);
        });
    }

    /**
     * формирование строки команды выполнения ffmpeg
     * @param timeLimitMin
     * @param rtspUrl
     * @param objName
     */
    private cmdString(timeLimitMin: number, rtspUrl: string, objName: string): FfmpegFileCfg {
        const dtStartRecord = new Date();
        const dtEndRecord = new Date(new Date().getTime() + timeLimitMin * 60 * 1000);
        const fileName = `${this.pathVideo}/${objName}_${dtStartRecord.toLocaleString()}_${dtEndRecord.toLocaleString()}.mp4`;

        return {
            endDate: dtEndRecord,
            startDate: dtStartRecord,
            cmdStr: `ffmpeg -rtsp_transport tcp -i "${rtspUrl}" -r 30 -vcodec copy -an -t ${timeLimitMin * 60} "${fileName}"`,
            fileName,
        };
    }
} //class

interface FfmpegFileCfg {
    cmdStr: string;
    fileName: string;
    startDate: Date;
    endDate: Date;
}

export interface CamConfig {
    ip: string,
    name: string,
    rtspUrl?: string,
}

export interface OnvifInfo {
    urn: string;
    name: string;
    xaddrs: string[];
    types?: string[];
    hardware?: string;
    location?: string;
    scopes?: string[];
    rtspUrl: string | undefined;
}