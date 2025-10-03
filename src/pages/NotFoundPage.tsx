import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#2196f3',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
