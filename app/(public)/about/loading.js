export default function Loading() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '120px', height: '16px', background: 'rgba(0,0,0,0.06)', borderRadius: '8px', margin: '0 auto 16px' }} />
                <div style={{ width: '280px', height: '36px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', margin: '0 auto 12px' }} />
                <div style={{ width: '400px', height: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', margin: '0 auto', maxWidth: '90%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,0,0,0.07)' }} />
                        <div style={{ width: '60%', height: '22px', background: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} />
                        <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }} />
                        <div style={{ width: '80%', height: '14px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
