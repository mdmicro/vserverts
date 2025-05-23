import VideoCam, {CamConfig, OnvifInfo} from "../VideoCam";
import {Button, Checkbox, Divider, Input, message, Modal, Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import './Cam.css';
import {GlobalConfig, saveConfig} from "../Config";
import FormItem from "antd/es/form/FormItem";
import Form, {useForm} from "antd/es/form/Form";


export const Cam: React.FC<{config: GlobalConfig, updateConfig: (cams: OnvifInfoCam[])=>void}> = ({config, updateConfig}) => {
    const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(config)
    const [messageApi, contextHolder] = message.useMessage();
    const [spinFindCam, setSpin] = useState(false);
    const [findedCams, setFindedCams] = useState<OnvifInfoCam[]>([]);
    const [formManual] = useForm<{name: string; rtspUrl: string}>();

    useEffect(()=>{
        setGlobalConfig(config)
    }, [config])

    const onChangeItemCamHandler = (index: number, value: CheckboxChangeEvent) => {
        findedCams[index].enable = value.target.checked;
        setFindedCams(findedCams)
    }

    const findCamHandler = async () => {
        const cam = new VideoCam('./', './', 5, []);

        setSpin(true);
        await cam.findCam()
        setSpin(false);
        console.log(cam)

        setFindedCams(cam.findedCams.map((item: OnvifInfo)=>
        { return {...item, enable: true}}));
        !cam.videoCamXaddr && messageApi.warning('Видеокамеры не найдены');
    }

    const modalAddManualHandler = () => {
        const modal = Modal.confirm({
            onOk: () => {
                if (globalConfig) {
                    const cams = globalConfig.cams;
                    cams.push({
                        urn: "",
                        xaddrs: [],
                        name: formManual.getFieldValue('name'),
                        rtspUrl: formManual.getFieldValue('rtspUrl')
                    })
                    setGlobalConfig({...globalConfig, cams})
                }
                modal.destroy()
            },
            onCancel: () => {
                modal.destroy()
            },
            content: (
                <Form form={formManual}>
                    <FormItem name='name' label='Имя камеры'>
                        <Input />
                    </FormItem>
                    <FormItem name='rtspUrl' label='Адрес потока rtsUrl'>
                        <Input />
                    </FormItem>
                </Form>
            ),
        })
    }

    const onChangeItemCamCurrent = (index: number, value: CheckboxChangeEvent) => {
        const cams = globalConfig.cams;
        cams[index].enable = value.target.checked;

        setGlobalConfig({...globalConfig, cams})
    }

    const ItemCamCurrent = (props: {item: OnvifInfoCam; index: number; onChangeItemCamCurrent: (index: number, value: CheckboxChangeEvent)=>void}) => {
        const {item, index, onChangeItemCamCurrent} = props;

        return (
            <div key={index}>
                <Checkbox onChange={(event) => onChangeItemCamCurrent(index, event)} checked={item.enable}>
                    <a href={item.rtspUrl || ''}>Cam{index}: {item.name}</a>
                </Checkbox>
            </div>
        );
    };

    const deleteCamHandler = async (): Promise<void> => {
        const newCams: OnvifInfoCam[] = [];
        for (const cam of globalConfig.cams) {
            !cam.enable && newCams.push(cam)
        }

        setGlobalConfig({...globalConfig, cams: newCams})
        await updateConfig(newCams)
    }

    return (
        <>
            <Button className='Button-Find' onClick={findCamHandler}>Поиск видеокамер</Button>
            <Divider dashed />
            {spinFindCam && <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>}
            {findedCams.length
                ?
                <>
                    <pre style={{textAlign: 'left'}}>Найденные видеокамеры</pre>
                    {findedCams.map((item: OnvifInfoCam, index: number) => <ItemCamFind key={index} item={item} index={index} onChangeItemCam={onChangeItemCamHandler}/>)}
                    <Button className='Button-Save' onClick={async ()=> updateConfig(globalConfig.cams.concat(findedCams))}>Сохранить</Button>
                </>
                : ''}
            <Divider dashed />

            <pre style={{textAlign: 'left'}}>Видеокамеры</pre>
            {globalConfig?.cams.map((item: OnvifInfoCam, index: number) => <ItemCamCurrent key={index} item={item} index={index} onChangeItemCamCurrent={onChangeItemCamCurrent}/>)}
            <div>
                <Button className='Button-Manual' onClick={modalAddManualHandler}>Добавить вручную</Button>
                <Button className='Button-Manual' onClick={deleteCamHandler}>Удалить</Button>
            </div>
        </>
    );
}


const ItemCamFind = (props: {item: OnvifInfoCam; index: number; onChangeItemCam: (index: number, value: CheckboxChangeEvent)=>void}) => {
    const {item, index, onChangeItemCam} = props;

    return (
    <div key={index}>
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
    </div>
    );
};

export interface OnvifInfoCam extends OnvifInfo {
    enable?: boolean;
}