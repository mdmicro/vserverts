import {ReactComponent} from "*.svg";
import VideoCam, {CamConfig, OnvifInfo} from "../VideoCam";
import {Button, Checkbox, Divider, message, Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useState} from "react";
import {CheckboxChangeEvent} from "antd/lib/checkbox";


export const Cam: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [spinFindCam, setSpin] = useState(false);
    const [findedCams, setFindedCams] = useState<OnvifInfoCam[]>([]);


    const onChangeItemCamHandler = (index: number, value: CheckboxChangeEvent) => {
        findedCams[index].enable =value.target.checked;
        console.log(findedCams)
        setFindedCams(findedCams)
    }

    const findCamHandler = async () => {
        const cam = new VideoCam('./', './', 5, []);

        setSpin(true);
        await cam.findCam()
        setSpin(false);

        setFindedCams(cam.findedCams.map((item: OnvifInfo)=> { return {...item, enable: true}}));
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
            {findedCams.length ? findedCams.map((item: OnvifInfoCam, index: number) => <ItemCam item={item} index={index} onChangeItemCam={onChangeItemCamHandler} />) : <></>}
            <Divider dashed />
            <pre style={{textAlign: 'left'}}>Видеокамеры</pre>
        </>
    );
}

const ItemCam = (props: {item: OnvifInfoCam; index: number; onChangeItemCam: (index: number, value: CheckboxChangeEvent)=>void}) => {
    const {item, index, onChangeItemCam} = props;

    return (
    <>
        <Checkbox checked={item.enable} onChange={(event) => onChangeItemCam(index, event)}>
            <a href={item.xaddrs[0]}>Cam{index}: {item.name} / {item.xaddrs}</a>
        </Checkbox>
        <div>
            <div className='Item-cam-info'>hw: {item.hardware || ''}</div>
            <div className='Item-cam-info'>location: {item.location || ''}</div>
            <div>scope:</div>
            {item.scopes?.map(item => <div><a href={item} />{item}</div>)}
        </div>

    </>);
};

interface OnvifInfoCam extends OnvifInfo {
    enable: boolean;
}