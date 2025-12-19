'use client';

import { useState } from 'react';

export default function TestInputPage() {
    const [value, setValue] = useState('');

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Input Page</h1>
            <p>Current value: {value}</p>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type here..."
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    width: '300px',
                }}
            />
        </div>
    );
}
