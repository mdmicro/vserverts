import {ReactComponent} from "*.svg";
import VideoCam, {CamConfig, OnvifInfo} from "../VideoCam";
import {Button, Divider, message, Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useState} from "react";


export const Cam: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [spinFindCam, setSpin] = useState(false);
    const [findedCams, setFindedCams] = useState<OnvifInfo[]>([]);

    const findCamHandler = async () => {
        const cam = new VideoCam('./', './', 5, []);

        setSpin(true);
        await cam.findCam()
        console.log(cam.videoCamXaddr);
        setSpin(false);

        setFindedCams(cam.findedCams);
        !cam.videoCamXaddr && messageApi.warning('Видеокамеры не найдены');
    }

    return (
        <>
            <div style={{textAlign: 'left'}}>
                <Button onClick={findCamHandler}>Поиск видеокамер</Button>
            </div>
            <Divider dashed />
            <pre style={{textAlign: 'left'}}>Найденные видеокамеры</pre>
            {spinFindCam && <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>}
            {findedCams.length ? findedCams.map((item: OnvifInfo) => <a href={item.xaddrs[0]}>{item.name}</a>) : <></>}

            <Divider dashed />
            <pre style={{textAlign: 'left'}}>Видеокамеры</pre>
        </>
    );
}