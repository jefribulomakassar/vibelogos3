export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#0a0a0a',
      color: '#ededed',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Hello World 👋</h1>
      <p style={{ maxWidth: '500px', textAlign: 'center', color: '#888', lineHeight: 1.7 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation.
      </p>
    </main>
  )
}
