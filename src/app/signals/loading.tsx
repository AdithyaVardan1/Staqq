export default function Loading() {
    return (
        <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ width: '140px', height: '40px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
                    ))}
                </div>
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ width: '280px', height: '36px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '12px' }} />
                    <div style={{ width: '450px', height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ height: '160px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                </div>
            </div>
        </main>
    );
}
