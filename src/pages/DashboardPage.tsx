import { useEffect } from 'react';
import { useNotesStore } from '@store/notesStore';
import { useLinksStore } from '@store/linksStore';
import { useTasksStore } from '@store/tasksStore';
import { useFinanceStore } from '@store/financeStore';
import { notesApi, linksApi, tasksApi, expensesApi } from '@services/api';

const DashboardPage = () => {
  const { notes, setNotes, setLoading: setNotesLoading } = useNotesStore();
  const { links, setLinks, setLoading: setLinksLoading } = useLinksStore();
  const { tasks, setTasks, setLoading: setTasksLoading } = useTasksStore();
  const { expenses, setExpenses, getBalance } = useFinanceStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setNotesLoading(true);
        setLinksLoading(true);
        setTasksLoading(true);

        const [notesData, linksData, tasksData, expensesData] = await Promise.all([
          notesApi.getAll(),
          linksApi.getAll(),
          tasksApi.getAll(),
          expensesApi.getAll(),
        ]);

        setNotes(notesData);
        setLinks(linksData);
        setTasks(tasksData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setNotesLoading(false);
        setLinksLoading(false);
        setTasksLoading(false);
      }
    };

    loadData();
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const balance = getBalance();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Welcome to ProductivePro - Your all-in-one productivity suite
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <StatCard title="Total Notes" value={notes.length} icon="📝" color="#2196f3" />
        <StatCard title="Active Links" value={links.length} icon="🔗" color="#9c27b0" />
        <StatCard title="Active Tasks" value={activeTasks.length} icon="✅" color="#ff9800" />
        <StatCard
          title="Balance"
          value={`$${balance.toFixed(2)}`}
          icon="💰"
          color={balance >= 0 ? '#4caf50' : '#f44336'}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Quick Stats</h2>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <p>📊 Total Items: {notes.length + links.length + tasks.length + expenses.length}</p>
          <p>📈 This is your productivity dashboard built with Vite + TypeScript + Zustand!</p>
          <p>🎯 Phase 1 Complete: Modern build system is now running!</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}) => (
  <div
    style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color }}>{value}</p>
      </div>
      <span style={{ fontSize: '40px' }}>{icon}</span>
    </div>
  </div>
);

export default DashboardPage;
