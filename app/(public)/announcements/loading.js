export default function Loading() {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 24px 60px', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '130px', height: '16px', background: 'rgba(0,0,0,0.06)', borderRadius: '8px', margin: '0 auto 16px' }} />
                <div style={{ width: '280px', height: '36px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', margin: '0 auto 12px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '14px', padding: '20px 24px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '22px', background: 'rgba(0,0,0,0.07)', borderRadius: '12px' }} />
                            <div style={{ width: '100px', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
                        </div>
                        <div style={{ width: '70%', height: '22px', background: 'rgba(0,0,0,0.08)', borderRadius: '6px' }} />
                        <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
