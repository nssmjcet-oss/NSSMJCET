export default function Loading() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '80vh' }}>
            {/* Header skeleton */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '120px', height: '16px', background: 'rgba(0,0,0,0.06)', borderRadius: '8px', margin: '0 auto 16px' }} />
                <div style={{ width: '260px', height: '36px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', margin: '0 auto 12px' }} />
                <div style={{ width: '380px', height: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', margin: '0 auto', maxWidth: '90%' }} />
            </div>

            {/* Team cards grid skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(0,0,0,0.07)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                        <div style={{ width: '130px', height: '20px', background: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} />
                        <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 0.25; }
                }
            `}</style>
        </div>
    );
}
