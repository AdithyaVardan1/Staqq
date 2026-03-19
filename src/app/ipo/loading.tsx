export default function Loading() {
    return (
        <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ width: '300px', height: '40px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '12px' }} />
                    <div style={{ width: '500px', height: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '40px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                </div>
            </div>
        </main>
    );
}
