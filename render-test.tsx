import React from 'react';
import { renderToString } from 'react-dom/server';
import TiptapEditor from './src/components/admin/TiptapEditor';

try {
    const html = renderToString(<TiptapEditor content="<p>Test</p>" onChange={() => {}} />);
    console.log("Render successful. HTML starts with:", html.substring(0, 100));
} catch (e) {
    console.error("Render failed:", e);
}
