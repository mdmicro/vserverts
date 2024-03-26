import React, {useEffect} from "react";
import { PlayCircleOutlined, LoginOutlined, SettingOutlined } from '@ant-design/icons';
import {Avatar, Card, message} from 'antd';
import {OnvifInfoCam} from "../Menu/Cam";
import VideoCam from "../VideoCam";
import {RecordSetting} from "../Config";
import path from "node:path";

const { Meta } = Card;

export const CamView: React.FC<{ cam: OnvifInfoCam, recordSetting: RecordSetting }> = (props) => {
    const {cam, recordSetting} = props;
    const [messageApi, contextHolder] = message.useMessage();

    // const recordPath = path.join(recordSetting.path, `/${cam.name}`);
    const recordPath = path.join('')
    const videoCam = new VideoCam(recordPath, recordPath, recordSetting.intervalRecordMinut, [{
        ip: '',
        name: 'cam1',
        rtspUrl: cam.rtspUrl,
    }] )

    const recordHandler = () => {
        try {
            console.log('recordHandler');
            console.log(recordPath);
            console.log(process.cwd());
            videoCam.camRecordStart()
        } catch (e) {
            e instanceof Error ? messageApi.error(e.message) : messageApi.error('Ошибка включения записи')
        }
    }

    return <>
        {
            cam
                ? <Card
                    style={{width: 300}}
                    /*cover={
                        <img
                            alt="example"
                            src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                        />
                    }*/
                    actions={[
                        <SettingOutlined key="setting"/>,
                        <LoginOutlined key="record" onClick={() => recordHandler()}/>,
                        <PlayCircleOutlined key="play"/>,
                    ]}
                >
                    <Meta
                        // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
                        title={`Cam: ${cam?.name || ''}`}
                        description=""
                    />
                </Card>
                : <></>
        }
    </>
}
