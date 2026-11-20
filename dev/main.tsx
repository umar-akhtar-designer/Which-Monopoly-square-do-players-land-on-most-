// Local preview only: mounts app/App.tsx. This folder is not uploaded.
import {createRoot} from 'react-dom/client';
import App from '../app/App';

createRoot(document.getElementById('root')!).render(<App />);
