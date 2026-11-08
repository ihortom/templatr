import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createRoot } from 'react-dom/client';
import About from './components/About';
import { watchTheme } from './theme';


watchTheme();

const container = document.getElementById('about');
if (!container) throw new Error('Root element #about not found');
const root = createRoot(container);
root.render(<About />);