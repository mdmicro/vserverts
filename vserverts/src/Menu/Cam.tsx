import VideoCam, {CamConfig, OnvifInfo} from "../VideoCam";
import {Button, Checkbox, Divider, message, Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import './Cam.css';
import {GlobalConfig} from "../Config";


export const Cam: React.FC<{ config: GlobalConfig | undefined, updateConfig: (cams: CamConfig[])=>void }> = ({config, updateConfig}) => {
    const [globalConfig, setGlobalConfig] = useState<GlobalConfig | undefined>()
    const [messageApi, contextHolder] = message.useMessage();
    const [spinFindCam, setSpin] = useState(false);
    const [findedCams, setFindedCams] = useState<OnvifInfoCam[]>([]);

    useEffect(()=>{
        setGlobalConfig(config)
    }, [config])


    const onChangeItemCamHandler = (index: number, value: CheckboxChangeEvent) => {
        findedCams[index].enable = value.target.checked;
        setFindedCams(findedCams)
    }

    const onChangeItemCamCurrentHandler = (index: number, value: CheckboxChangeEvent) => {
        // findedCams[index].enable = value.target.checked;
        // setFindedCams(findedCams)
    }

    // const updateCamListHandler = async () => {
    //
    // }

    const findCamHandler = async () => {
        const cam = new VideoCam('./', './', 5, []);

        setSpin(true);
        await cam.findCam()
        setSpin(false);

        setFindedCams(cam.findedCams.map((item: OnvifInfo)=>
        { return {...item, enable: true}}));
        !cam.videoCamXaddr && messageApi.warning('Видеокамеры не найдены');
    }

    // const CurrentCams = () => {
    //     return globalConfig?.cams.map(item => {
    //         return (
    //
    //         )});
    // }

    return (
        <>
            <Button className='Button-Find' onClick={findCamHandler}>Поиск видеокамер</Button>
            <Divider dashed />
            {spinFindCam && <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>}
            {findedCams.length
                ?
                <>
                    <pre style={{textAlign: 'left'}}>Найденные видеокамеры</pre>
                    {findedCams.map((item: OnvifInfoCam, index: number) => <ItemCamFind item={item} index={index} onChangeItemCam={onChangeItemCamHandler}/>)}
                    <Button className='Button-Save' onClick={()=>updateConfig(findedCams.map(item => {
                        return {
                        name: item.name,
                        ip: '',
                        rtspUrl: '',
                    }
                    }))}>Сохранить</Button>
                </>
                : ''}
            <Divider dashed />
            <pre style={{textAlign: 'left'}}>Видеокамеры</pre>
            {/*{globalConfig?.cams.map((item: OnvifInfo, index: number) => <ItemCamCurrent item={item} index={index} onChangeItemCamCurrent={onChangeItemCamHandler}/>)}*/}
        </>
    );
}


const ItemCamFind = (props: {item: OnvifInfoCam; index: number; onChangeItemCam: (index: number, value: CheckboxChangeEvent)=>void}) => {
    const {item, index, onChangeItemCam} = props;

    return (
    <>
        <Checkbox onChange={(event) => onChangeItemCam(index, event)}>
            <a href={item.xaddrs[0]}>Cam{index}: {item.name} / {item.xaddrs}</a>
        </Checkbox>
        <div className='Item-cam-info'>
            {item.rtspUrl
                ? <div>rtspUrl: <a href={item.rtspUrl}>{item.rtspUrl}</a></div>
                : ''
            }
            <div>hw: {item.hardware || ''}</div>
            <div>location: {item.location || ''}</div>
            <div>scope:</div>
            {item.scopes?.map(item => <div><a href={item}>{item}</a></div>)}
        </div>

    </>);
};

const ItemCamCurrent = (props: {item: CamConfig; index: number; onChangeItemCamCurrent: (index: number, value: CheckboxChangeEvent)=>void}) => {
    const {item, index, onChangeItemCamCurrent} = props;

    return (
        <>
        {/*<Checkbox onChange={(event) => onChangeItemCam(index, event)}>*/}
            <a href={item.ip}>Cam{index}: {item.name} / ip: {item.ip} {item.rtspUrl ? `/ rtspUrl: ${item.rtspUrl}` : ''}</a>
        {/*</Checkbox>*/}
        </>);
};

interface OnvifInfoCam extends OnvifInfo {
    enable: boolean;
}