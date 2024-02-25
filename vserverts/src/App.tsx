import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
import MenuItem from 'antd/es/menu/MenuItem';
import {View} from './Menu/View';
import {Cam} from './Menu/Cam';
import {CamConfig, OnvifInfo} from "./VideoCam";
import {Setting} from "./Menu/Setting";
import {About} from "./Menu/About";
import {GlobalConfig, readConfig} from "./Config";

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(MenuKey.View);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | undefined>();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
      (async ()=> {
          const config: GlobalConfig = await readConfig()
          setGlobalConfig(config)
      })()
  }, [])

  const updateConfigHandler = () => {

  }

  const content = (key: MenuKey) => {
    switch (key) {
        case MenuKey.View:
            return <View />
        case MenuKey.Cam:
            return <Cam config={globalConfig} updateConfig={updateConfigHandler} />
        case MenuKey.Setting:
            return <Setting />
        case MenuKey.About:
            return <About />
        default:
            return <></>
    }
  }

  return (
    <div className="App">
        <Layout>
          <Sider trigger={null} collapsible collapsed={collapsed}>
              <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                      fontSize: '16px',
                      width: 64,
                      height: 64,
                  }}
              />
            <div className="demo-logo-vertical" />
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                onClick={(item) => setActiveMenu(item.key as MenuKey)}
                items={[
                  {
                    key: MenuKey.View,
                    icon: <UserOutlined />,
                    label: MenuKey.View,
                  },
                    {
                        key: MenuKey.Cam,
                        icon: <VideoCameraOutlined />,
                        label: MenuKey.Cam,
                    },
                  {
                    key: MenuKey.Setting,
                    icon: <VideoCameraOutlined />,
                    label: MenuKey.Setting,
                  },
                  {
                    key: MenuKey.About,
                    icon: <UploadOutlined />,
                    label: MenuKey.About,
                  },
                ]}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
            </Header>
            <Content
                style={{
                  margin: '24px 16px',
                  padding: 24,
                    minWidth: 1280,
                  minHeight: 1024,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
            >
                {content(activeMenu)}
            </Content>
          </Layout>
        </Layout>
    </div>
  );
}

enum MenuKey {
    View= 'View',
    Cam = 'Cam',
    Setting = 'Setting',
    About = 'About',
}

export default App;
