import VideoCam, {CamConfig, OnvifInfo} from "../VideoCam";
import {Button, Checkbox, Divider, message, Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useState} from "react";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import './Cam.css';


export const Cam: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [spinFindCam, setSpin] = useState(false);
    const [findedCams, setFindedCams] = useState<OnvifInfoCam[]>([]);


    const onChangeItemCamHandler = (index: number, value: CheckboxChangeEvent) => {
        findedCams[index].enable = value.target.checked;
        setFindedCams(findedCams)
    }
    const updateCamListHandler = async () => {

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
            <Button className='Button' onClick={findCamHandler}>Поиск видеокамер</Button>
            <Divider dashed />
            {spinFindCam && <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>}
            {findedCams.length
                ?
                <>
                    <pre style={{textAlign: 'left'}}>Найденные видеокамеры</pre>
                    {findedCams.map((item: OnvifInfoCam, index: number) => <ItemCam item={item} index={index} onChangeItemCam={onChangeItemCamHandler}/>)}
                    <Button className='Button' onClick={updateCamListHandler}>Сохранить</Button>
                </>
                : ''}
            <Divider dashed />
            <pre style={{textAlign: 'left'}}>Видеокамеры</pre>
        </>
    );
}


const ItemCam = (props: {item: OnvifInfoCam; index: number; onChangeItemCam: (index: number, value: CheckboxChangeEvent)=>void}) => {
    const {item, index, onChangeItemCam} = props;

    return (
    <>
        <Checkbox onChange={(event) => onChangeItemCam(index, event)}>
            <a href={item.xaddrs[0]}>Cam{index}: {item.name} / {item.xaddrs}</a>
        </Checkbox>
        <div className='Item-cam-info'>
            <div>hw: {item.hardware || ''}</div>
            <div>location: {item.location || ''}</div>
            <div>scope:</div>
            {item.scopes?.map(item => <div><a href={item}>{item}</a></div>)}
        </div>

    </>);
};

interface OnvifInfoCam extends OnvifInfo {
    enable: boolean;
}