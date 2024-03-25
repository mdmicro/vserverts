import React from "react";
import { PlayCircleOutlined, LoginOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import {OnvifInfoCam} from "../Menu/Cam";

const { Meta } = Card;

export const CamView: React.FC<{ cam?: OnvifInfoCam }> = (props) => {
    const {cam} = props;
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
                        <LoginOutlined key="record"/>,
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
