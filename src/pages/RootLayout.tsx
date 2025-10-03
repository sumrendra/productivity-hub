import { Outlet, Link } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';

const RootLayout = () => {
  const { colorMode, toggleColorMode, sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  const isDark = colorMode === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: isDark ? '#1a1a1a' : '#f5f5f5',
        color: isDark ? '#fff' : '#000',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? '60px' : '240px',
          background: isDark ? '#252525' : '#fff',
          borderRight: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px', borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}` }}>
          <h1 style={{ fontSize: sidebarCollapsed ? '16px' : '20px', margin: 0 }}>
            {sidebarCollapsed ? 'PP' : 'ProductivePro'}
          </h1>
        </div>

        <nav style={{ flex: 1, padding: '10px' }}>
          <NavLink to="/" icon="📊" label="Dashboard" collapsed={sidebarCollapsed} />
          <NavLink to="/notes" icon="📝" label="Notes" collapsed={sidebarCollapsed} />
          <NavLink to="/links" icon="🔗" label="Links" collapsed={sidebarCollapsed} />
          <NavLink to="/tasks" icon="✅" label="Tasks" collapsed={sidebarCollapsed} />
          <NavLink to="/finance" icon="💰" label="Finance" collapsed={sidebarCollapsed} />
        </nav>

        <div
          style={{
            padding: '10px',
            borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <button
            onClick={toggleSidebarCollapse}
            style={{
              padding: '10px',
              background: isDark ? '#333' : '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#000',
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          <button
            onClick={toggleColorMode}
            style={{
              padding: '10px',
              background: isDark ? '#333' : '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#000',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

const NavLink = ({
  to,
  icon,
  label,
  collapsed,
}: {
  to: string;
  icon: string;
  label: string;
  collapsed: boolean;
}) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      margin: '5px 0',
      borderRadius: '4px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'background 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(100, 100, 100, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    <span style={{ fontSize: '20px' }}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </Link>
);

export default RootLayout;
