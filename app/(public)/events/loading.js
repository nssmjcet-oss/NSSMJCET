export default function Loading() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '80vh' }}>
            {/* Header skeleton */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '140px', height: '16px', background: 'rgba(0,0,0,0.06)', borderRadius: '8px', margin: '0 auto 16px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div style={{ width: '280px', height: '36px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', margin: '0 auto 12px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                <div style={{ width: '420px', height: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', margin: '0 auto', maxWidth: '90%', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>

            {/* Filter pills skeleton */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                {[80, 100, 90, 110].map((w, i) => (
                    <div key={i} style={{ width: `${w}px`, height: '38px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ))}
            </div>

            {/* Event cards grid skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ width: '100%', height: '180px', background: 'rgba(0,0,0,0.06)', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                        <div style={{ width: '90px', height: '18px', background: 'rgba(0,0,0,0.06)', borderRadius: '6px' }} />
                        <div style={{ width: '80%', height: '24px', background: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} />
                        <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
                        <div style={{ width: '70%', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
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
