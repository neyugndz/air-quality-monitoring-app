import React, { useState, useCallback } from 'react';

// --- Icon Components (Sử dụng SVG inline để đảm bảo tất cả trong 1 file) ---

const MenuIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const SearchSortIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
);

const EditIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const DeleteIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.728-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 01-2 0v6a1 1 0 112 0V7z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

// --- Data Mocks ---
const ruleData = [
    { name: "PM2.5_thresholds", type: "Telemetry Data", trigger: "Based on threshold", action: "Notification - Email", time: "26-09-2025 11:28:06", status: true },
];

const deviceData = [
    { name: "CauGiayParkSensor", id: "5eb40b68...", type: "DEVICE", domain: "EnvironmentMonitor", date: "04-06-2025 08:40:27", status: "CONNECTED" },
    { name: "NoiBaiAirportSensor", id: "5eb40b68...", type: "DEVICE", domain: "EnvironmentMonitor", date: "04-06-2025 08:39:09", status: "CONNECTED" },
];

// --- Component Fragments ---

const RuleList = ({ onAddRule, onEditRule }) => (
    <>
        <div className="flex items-center space-x-4 mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors" onClick={onAddRule}>
                ADD
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors">
                REFRESH
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-gray-500 text-sm font-medium border-b border-gray-200">
                            {["Rule Name", "Rule Type", "Rule Trigger", "Rule Action", "Time", "Status", "Action"].map(header => (
                                <th key={header} className="p-3">
                                    <div className="flex items-center">
                                        {header}
                                        {header !== "Action" && <SearchSortIcon className="h-4 w-4 ml-1" />}
                                    </div>
                                    {(header === "Rule Name" || header === "Time") && (
                                        <input type="text" placeholder="Search..." className="mt-2 w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                                    )}
                                    {["Rule Type", "Rule Trigger", "Rule Action", "Status"].includes(header) && (
                                        <select className="mt-2 w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                                            <option>Search...</option>
                                        </select>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ruleData.map((rule, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="p-3">{rule.name}</td>
                                <td className="p-3">{rule.type}</td>
                                <td className="p-3">{rule.trigger}</td>
                                <td className="p-3">{rule.action}</td>
                                <td className="p-3">{rule.time}</td>
                                <td className="p-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={rule.status} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                    </label>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" onClick={onEditRule}>
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md">
                                            <DeleteIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-center md:justify-end items-center space-x-2 p-4 border-t border-gray-200 text-sm text-gray-600">
                <span>1-1/1</span>
                <button className="text-gray-400 hover:text-gray-600">&lt;</button>
                <button className="text-gray-400 hover:text-gray-600">&lt;</button>
                <span>1</span>
                <button className="text-gray-400 hover:text-gray-600">&gt;</button>
                <button className="text-gray-400 hover:text-gray-600">&gt;</button>
                <select className="border border-gray-300 rounded-md px-2 py-1">
                    <option>10</option>
                </select>
            </div>
        </div>
    </>
);

const RuleAdd = ({ onCancel }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-end space-x-4 mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors">
                SAVE
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors" onClick={onCancel}>
                CANCEL
            </button>
        </div>
        <div className="p-4 border border-gray-200 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Rule Trigger</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-gray-700 font-medium">Rule Name (*)</label>
                    <input type="text" defaultValue="PM2.5 thresholds" className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Rule Type (*)</label>
                    <input type="text" defaultValue="Telemetry Data" className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Rule Trigger (*)</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        <option>Based on threshold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Property (*)</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        <option>Data Type (*)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Operator (*)</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        <option>Operator (*)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Value (*)</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Trigger Range</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                        <input type="radio" name="trigger-range" className="form-radio text-blue-600 h-4 w-4" defaultChecked />
                        <span>From All Devices</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input type="radio" name="trigger-range" className="form-radio text-blue-600 h-4 w-4" />
                        <span>From Group</span>
                    </label>
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 font-medium">Device</label>
                <p className="text-red-500 text-sm">You need to select the device</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Rule Action</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 font-medium">Action Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        <option>Notification</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Notification Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        <option>Email</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Email List</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Subject</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
            </div>
        </div>
    </div>
);

const DeviceInventory = ({ onRegisterDevice, onShowDetail }) => (
    <>
        <div className="flex items-center space-x-4 mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors" onClick={onRegisterDevice}>
                REGISTER
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors">
                REFRESH
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-gray-500 text-sm font-medium border-b border-gray-200">
                            {["Status", "Device Name", "Device ID", "Device Type", "Application Domain", "Registration Date", "Action"].map(header => (
                                <th key={header} className="p-3">
                                    <div className="flex items-center">
                                        {header}
                                        {header !== "Action" && <SearchSortIcon className="h-4 w-4 ml-1" />}
                                    </div>
                                    {header !== "Action" && header !== "Status" && (
                                        <input type="text" placeholder="Search..." className="mt-2 w-full text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {deviceData.map((device, index) => (
                            <tr key={index} className="border-b border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => onShowDetail(device.name, device.id)}>
                                <td className="p-3">
                                    <div className={`text-white text-xs px-2 py-1 rounded-full text-center ${device.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`}>{device.status}</div>
                                </td>
                                <td className="p-3">{device.name}</td>
                                <td className="p-3">{device.id}</td>
                                <td className="p-3">
                                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full text-center">{device.type}</div>
                                </td>
                                <td className="p-3">{device.domain}</td>
                                <td className="p-3">{device.date}</td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" onClick={(e) => { e.stopPropagation(); onShowDetail(device.name, device.id); }}>
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md" onClick={(e) => e.stopPropagation()}>
                                            <DeleteIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination is similar to RuleList, omitted for brevity */}
        </div>
    </>
);

const DeviceRegister = ({ onCancel }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-end space-x-4 mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors">
                SAVE
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors" onClick={onCancel}>
                CANCEL
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className='p-4 border border-gray-200 rounded-md'>
                <div className="mb-4">
                    <label className="flex items-center space-x-2 mb-4">
                        <input type="radio" name="device-registration" className="form-radio text-blue-600 h-4 w-4" defaultChecked />
                        <span className='font-medium'>Single device registration</span>
                    </label>
                    <label className="block text-gray-700">Device Name (*)</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Device Type</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Select...</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">App Domain</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Select...</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Category</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Select...</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md h-24"></textarea>
                </div>
            </div>
            <div className='p-4 border border-gray-200 rounded-md'>
                <div className="mb-4">
                    <label className="flex items-center space-x-2 mb-4">
                        <input type="radio" name="device-registration" className="form-radio text-blue-600 h-4 w-4" />
                        <span className='font-medium'>Bulk device registration</span>
                    </label>
                    <label className="block text-gray-700">Upload a file to bulk-register device</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 transition-colors">
                            SELECT FILE TO UPLOAD
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">No files have been selected yet!</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium">Connecting devices</label>
                    <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700">
                        <p>Create all registration request at once, then each one needs to go through waiting for connection process</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors mt-4">
                            DOWNLOAD TEMPLATE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DeviceDetail = ({ deviceName, deviceId }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-end space-x-4 mb-6">
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors">
                UNREGISTER
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-gray-300 transition-colors">
                REFRESH
            </button>
        </div>

        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {["Info", "Latest Telemetry", "Data Model", "Command", "Device Template", "Log"].map((tab) => (
                    <a key={tab} href="#" className={`py-4 px-1 text-sm font-medium whitespace-nowrap ${tab === "Info" ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {tab}
                    </a>
                ))}
            </nav>
        </div>

        {/* Content for Info Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-300 rounded-md p-4">
                <h3 className="text-sm font-bold text-gray-600 mb-4 border-b pb-2">CONNECTION INFORMATION</h3>
                <div className="space-y-3 text-sm">
                    {[
                        { label: "Device Status", value: <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full text-center">Connected</span> },
                        { label: "Device ID", value: "S6951716-8983-43e0-8168-efb7b3aefa1c", copy: true },
                        { label: "Device Name", value: deviceName || "HanoiRailwayStationSensor" },
                        { label: "Access Token", value: "eyJh...", copy: true },
                        { label: "Refresh Token", value: "eyJ....", copy: true },
                        { label: "Last Connection", value: "04-06-2025 09:34:32" },
                        { label: "Last Update", value: "04-06-2025 08:45:57" },
                        { label: "Device Type", value: "DEVICE" },
                        { label: "Category", value: "Sensor" },
                        { label: "Tenant", value: "Nguyễn" },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-500">{item.label}</span>
                            <div className="flex items-center space-x-2">
                                <span>{item.value}</span>
                                {item.copy && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => console.log('Copied')}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v6m-4 0h8m-4 0v6m4-6V7m0 6v6m0 0h-8m0-6h8M4 7h16" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-gray-300 rounded-md p-4">
                <h3 className="text-sm font-bold text-gray-600 mb-4 border-b pb-2">DEVICE INFORMATION</h3>
                <div className="space-y-3 text-sm">
                    {["Device-Label", "Local Name", "Protocol", "Manufacturer", "Product Type", "Model", "Firmware Version", "Software Version", "Hardware Version", "OS Version"].map((label, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-500">{label}</span>
                            <span>-</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const AdminDashboard = () => {
    // Quản lý trạng thái cho Sidebar (Rule Engine hay Device Manager)
    const [mainTab, setMainTab] = useState('rule'); // 'rule' | 'device'

    // Quản lý trạng thái cho các sub-tab bên trong main tab
    const [subTab, setSubTab] = useState('list'); // 'list' | 'add' | 'detail'

    // State để lưu thông tin chi tiết thiết bị được chọn
    const [deviceDetail, setDeviceDetail] = useState({ name: '', id: '' });

    // Cập nhật Breadcrumb dựa trên trạng thái hiện tại
    const getBreadcrumb = useCallback(() => {
        let title = '';
        let currentNav = mainTab === 'rule' ? 'Rule Engine' : 'Device Manager';

        if (mainTab === 'rule') {
            if (subTab === 'add') title = 'Rule Add';
        } else if (mainTab === 'device') {
            if (subTab === 'add') title = 'Device Register';
            if (subTab === 'detail') title = `Device Detail - ${deviceDetail.name}`;
        }
        
        return { currentNav, title };
    }, [mainTab, subTab, deviceDetail.name]);

    const { currentNav, title } = getBreadcrumb();

    // Hàm điều hướng
    const navigateTo = (newMainTab, newSubTab = 'list') => {
        setMainTab(newMainTab);
        setSubTab(newSubTab);
        if (newSubTab !== 'detail') {
            setDeviceDetail({ name: '', id: '' });
        }
    };

    const handleShowDeviceDetail = (name, id) => {
        setDeviceDetail({ name, id });
        navigateTo('device', 'detail');
    };

    // Render Component chính dựa trên trạng thái
    const renderContent = () => {
        if (mainTab === 'rule') {
            if (subTab === 'list') return <RuleList onAddRule={() => setSubTab('add')} onEditRule={() => setSubTab('add')} />;
            if (subTab === 'add') return <RuleAdd onCancel={() => setSubTab('list')} />;
        } else if (mainTab === 'device') {
            if (subTab === 'list') return <DeviceInventory onRegisterDevice={() => setSubTab('add')} onShowDetail={handleShowDeviceDetail} />;
            if (subTab === 'add') return <DeviceRegister onCancel={() => setSubTab('list')} />;
            if (subTab === 'detail') return <DeviceDetail deviceName={deviceDetail.name} deviceId={deviceDetail.id} />;
        }
        return <RuleList onAddRule={() => setSubTab('add')} onEditRule={() => setSubTab('add')} />; // Fallback
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            
            {/* Sidebar */}
            <nav className="hidden md:block w-64 bg-white shadow-xl p-4 border-r border-gray-200">
                <div className="text-2xl font-bold text-blue-600 mb-8">ADMIN PANEL</div>
                <div className="space-y-2">
                    <button 
                        className={`w-full text-left p-3 rounded-lg flex items-center space-x-2 transition-colors ${mainTab === 'rule' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => navigateTo('rule')}
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.525.321 1.069.467 1.724 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>Rule Engine</span>
                    </button>
                    <button 
                        className={`w-full text-left p-3 rounded-lg flex items-center space-x-2 transition-colors ${mainTab === 'device' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => navigateTo('device')}
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1v-3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-4 3 4m-3 4v-4m5 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2z" /></svg>
                        <span>Device Manager</span>
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white p-4 flex items-center justify-between shadow-md border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <MenuIcon className="h-6 w-6 text-gray-700 cursor-pointer md:hidden" />
                        <h1 className="text-xl font-semibold text-gray-800">ADMINISTRATION</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">NN</div>
                            <span className="hidden sm:block text-gray-700">Nguyễn Nguyễn Đăng</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-full mx-auto">
                        
                        {/* Breadcrumbs */}
                        <div className="text-gray-500 mb-6 flex items-center space-x-2 text-sm">
                            <button 
                                className={`font-medium transition-colors ${mainTab === 'rule' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                                onClick={() => navigateTo('rule')}
                            >
                                Rule Engine
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                                className={`font-medium transition-colors ${mainTab === 'device' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                                onClick={() => navigateTo('device')}
                            >
                                Device Manager
                            </button>
                            
                            {title && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <span className="font-medium text-blue-600">
                                        {title}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Dynamic Content */}
                        {renderContent()}

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
