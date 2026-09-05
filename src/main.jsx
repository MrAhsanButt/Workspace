import '@/config/global.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import AuthContext from './context/AuthContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2563eb',
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            colorBorder: '#e2e8f0',
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            borderRadius: 10,
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          },
          components: {
            Modal: {
              contentBg: '#ffffff',
              headerBg: '#ffffff',
              borderRadiusLG: 16,
            },
            Dropdown: {
              colorBgElevated: '#ffffff',
              borderRadiusLG: 12,
            },
            Select: {
              colorBgContainer: '#ffffff',
              colorBorder: '#e2e8f0',
              borderRadius: 8,
            },
            Input: {
              colorBgContainer: '#ffffff',
              colorBorder: '#e2e8f0',
              borderRadius: 8,
            },
            Button: {
              borderRadius: 8,
            },
            Tag: {
              borderRadiusSM: 6,
            },
          },
        }}
      >
        <AuthContext>
          <App />
        </AuthContext>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
