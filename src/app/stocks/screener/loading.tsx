export default function Loading() {
    return (
        <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ width: '240px', height: '36px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '24px' }} />
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ width: '160px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    ))}
                </div>
            </div>
        </main>
    );
}
