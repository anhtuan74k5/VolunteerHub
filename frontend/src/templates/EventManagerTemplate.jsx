import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined, SnippetsOutlined, FileAddOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { GetUserInfo } from '../services/UserService';
import dhcn from '../assets/img/Logo_UET.webp';
import { removeLocalStorage } from '../utils/Configs';
import { LOCALSTORAGE_USER } from '../utils/Constants';

const { Header, Sider, Content } = Layout;

export default function EventManagerTemplate() {
    const [collapsed, setCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await GetUserInfo();
                const userData = res.data?.body || res.data?.content || res.data;
                const isEventManager = userData.role === 'EVENTMANAGER';

                if (!isEventManager) {
                    removeLocalStorage(LOCALSTORAGE_USER);
                    window.location.href = '/';
                } else {
                    setUserInfo(userData);
                }
            } catch (error) {
                console.error(error);
                removeLocalStorage(LOCALSTORAGE_USER);
                window.location.href = '/';
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <Layout className="!min-h-screen">
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <NavLink to='/' className="flex items-center justify-center p-2">
                    <img
                        src={dhcn}
                        alt="Logo UET"
                        className=" w-[65px] h-[65px] rounded-full object-cover transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_8px_rgba(24,144,255,0.6)]"
                    />
                </NavLink>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={[
                        // {
                        //     key: '1',
                        //     icon: <UserOutlined />,
                        //     label: <NavLink to='tinh-nguyen-vien'>Quản lý tình nguyện viên</NavLink>
                        // },
                        {
                            key: '2',
                            icon: <SnippetsOutlined />,
                            label: 'Quản lý sự kiện',
                            children: [
                                {
                                    key: '21',
                                    icon: <FileAddOutlined />,
                                    label: <NavLink to='su-kien'>Sự kiện của tôi</NavLink>,
                                },
                                {
                                    key: '22',
                                    icon: <FileAddOutlined />,
                                    label: <NavLink to='su-kien/tao'>Tạo sự kiện</NavLink>,
                                }
                            ]
                        },
                    ]}
                />
            </Sider>

            <Layout className="site-layout ">
                <Header className="site-layout-background !pl-4 text-[1.8rem] !bg-white">
                    {React.createElement(
                        collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                        {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                        }
                    )}
                </Header>

                <Content
                    className="site-layout-background contentAdmin !bg-white"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 500,
                    }}
                >
                    <Outlet context={userInfo} />
                </Content>
            </Layout>
        </Layout>
    );
}
