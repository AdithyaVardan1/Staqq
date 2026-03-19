export default function Loading() {
    return (
        <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }} />
                    <div>
                        <div style={{ width: '200px', height: '32px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '8px' }} />
                        <div style={{ width: '120px', height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div style={{ height: '400px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ height: '88px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
