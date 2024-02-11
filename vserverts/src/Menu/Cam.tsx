import {ReactComponent} from "*.svg";
import {CamConfig} from "../VideoCam";
import {Button, Flex} from "antd";

export const Cam: React.FC = () => {

    return (
        <Flex>
            <Flex>
                <Button>Поиск видеокамер</Button>
            </Flex>
            <Flex>
                <pre>Найденные видеокамеры</pre>
            </Flex>
            <Flex>
                <pre>Видеокамеры</pre>
            </Flex>
        </Flex>
    );
}