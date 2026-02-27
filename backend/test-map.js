function testMap() {
    const rows = [
        {
            id: 1,
            metadata: '{"key": "value"}'
        },
        {
            id: 2,
            metadata: { existing: 'object' }
        },
        {
            id: 3,
            metadata: null
        }
    ];

    try {
        const formatted = rows.map(r => ({
            ...r,
            metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {})
        }));
        console.log('Map executado com sucesso:', formatted);
    } catch (error) {
        console.error('ERRO NO MAP:', error);
    }
}

testMap();
