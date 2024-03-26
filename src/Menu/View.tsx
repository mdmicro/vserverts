import React, {useEffect, useState} from "react";
import {CamView} from "../Component/CamView";
import {GlobalConfig, readConfig} from "../Config";

export const View: React.FC = () => {
    const [config, setConfig] = useState<GlobalConfig>()

    useEffect(()=>{
        (async () => {
            const config: GlobalConfig = await readConfig();
            setConfig(config)
        })()
    })

    return <>
        {config?.cams.map(cam => <CamView key={cam.name} cam={cam} recordSetting={config.recordSetting} />)}
    </>
}
